import { readRows, appendRow, appendRows, deleteRows, updateCells } from '../../lib/sheets';
import { GRUPOS, BANDEIRAS, REGRAS_PADRAO, REGRAS_AOVIVO_PADRAO, calcularPontos, calcularPontosAoVivo, calcularRankingTerceiros } from '../../lib/data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const data = await getData();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { action, ...body } = req.body;
      const actions = { addParticipant, removeParticipant, savePalpites, saveResultados, saveRegras, saveRegrasAoVivo, savePrazo, setEstadoTorneio, saveChaveamentoOficial, savePalpiteMataMataVivo };
      if (!actions[action]) return res.status(400).json({ ok: false, error: 'Ação inválida: ' + action });
      const result = await actions[action](body);
      return res.status(200).json(result);
    }
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  } catch (err) {
    console.error('[API Error]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// ── Helpers ──────────────────────────────────────────────
function normName(s) { return (s || '').trim(); }
function isValidScore(v) { return Number.isInteger(v) && v >= 0 && v <= 99; }

// ── GET ──────────────────────────────────────────────────
async function getData() {
  const rows = await readRows();
  const part = [], pal = {}, extP = {}, ofi = {}, rankingAnterior = {}, chaveamentoOficial = {}, palMMVivo = {};
  let reg = { ...REGRAS_PADRAO };
  let regAoVivo = { ...REGRAS_AOVIVO_PADRAO };
  let prazo = null;
  let estadoTorneio = 'previsao';

  for (let i = 1; i < rows.length; i++) {
    const [t, g, ji, g1, g2, n, ex, pEx] = rows[i];
    if (!t) continue;
    const nm = normName(n);
    if (t === 'participante') {
      if (nm && !part.includes(nm)) part.push(nm);
    } else if (t === 'palpite') {
      if (!nm) continue;
      if (!pal[nm]) pal[nm] = [];
      pal[nm].push({ grupo: g, jogoIdx: parseInt(ji), gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 });
    } else if (t === 'palpite_extra') {
      if (!nm) continue;
      if (!extP[nm]) extP[nm] = {};
      extP[nm][g] = { palpite: ex, pontuou: (pEx == 1 || pEx === '1') };
    } else if (t === 'oficial') {
      ofi[g + '-' + ji] = { gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 };
    } else if (t === 'regra') {
      reg[g] = parseInt(ji);
    } else if (t === 'regra_aovivo') {
      regAoVivo[g] = parseInt(ji);
    } else if (t === 'prazo') {
      prazo = g;
    } else if (t === 'estado_torneio') {
      estadoTorneio = g === 'ao_vivo' ? 'ao_vivo' : 'previsao';
    } else if (t === 'chaveamento_oficial') {
      chaveamentoOficial[g] = ex;
    } else if (t === 'palpite_mm_vivo') {
      if (!nm) continue;
      if (!palMMVivo[nm]) palMMVivo[nm] = [];
      palMMVivo[nm].push({ matchId: parseInt(g), gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 });
    } else if (t === 'ranking_anterior') {
      // col 1 = nome do participante, col 2 = posição
      const rNm = normName(g);
      if (rNm) rankingAnterior[rNm] = parseInt(ji);
    }
  }

  // Bug fix: só retorna palpites de participantes cadastrados
  const palFiltrado = {}, extPFiltrado = {}, palMMVivoFiltrado = {};
  for (const nm of part) {
    if (pal[nm]) palFiltrado[nm] = pal[nm];
    if (extP[nm]) extPFiltrado[nm] = extP[nm];
    if (palMMVivo[nm]) palMMVivoFiltrado[nm] = palMMVivo[nm];
  }

  const ranking = part.map(nm => {
    const c = calcularPontos(nm, palFiltrado[nm] || [], extPFiltrado[nm] || {}, ofi, reg);
    const cv = calcularPontosAoVivo(palMMVivoFiltrado[nm] || [], ofi, regAoVivo);
    return { nome: nm, pts: c.total + cv.total, ptsPrevisao: c.total, ptsAoVivo: cv.total, detalhes: c, detalhesAoVivo: cv };
  });
  ranking.sort((a, b) => b.pts - a.pts);

  const rankingTerceiros = calcularRankingTerceiros(ofi);
  return { ok: true, participantes: part, palpites: palFiltrado, extrasPalpite: extPFiltrado, oficiais: ofi, regras: reg, regrasAoVivo: regAoVivo, ranking, grupos: GRUPOS, bandeiras: BANDEIRAS, prazo, rankingAnterior, estadoTorneio, chaveamentoOficial, palpitesMMVivo: palMMVivoFiltrado, rankingTerceiros, nomeBolao: process.env.BOLAO_NOME || 'STUPENDO' };
}

// ── PARTICIPANTES ─────────────────────────────────────────
async function addParticipant({ nome }) {
  const n = normName(nome);
  if (!n) return { ok: false, error: 'Nome inválido' };
  if (n.length > 50) return { ok: false, error: 'Nome muito longo' };
  const rows = await readRows();
  for (let i = 1; i < rows.length; i++) {
    // Bug fix: comparação case-insensitive para evitar duplicatas
    if (rows[i][0] === 'participante' && normName(rows[i][5]).toLowerCase() === n.toLowerCase()) {
      return { ok: false, error: 'Já existe um participante com esse nome' };
    }
  }
  await appendRow(['participante', '', '', '', '', n, '', '']);
  return { ok: true };
}

async function removeParticipant({ nome }) {
  const n = normName(nome);
  if (!n) return { ok: false, error: 'Nome inválido' };
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    const tipo = rows[i][0];
    // Bug fix: também remove ranking_anterior (col 1 = nome) e limpa dados órfãos
    const nomePrincipal = normName(rows[i][5]); // col 5 = nome na maioria dos tipos
    const nomeRanking = normName(rows[i][1]);   // col 1 = nome no ranking_anterior

    const ehDado = ['participante', 'palpite', 'palpite_extra', 'palpite_mm_vivo'].includes(tipo) && nomePrincipal === n;
    const ehRanking = tipo === 'ranking_anterior' && nomeRanking === n;

    if (ehDado || ehRanking) toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  return { ok: true };
}

// ── PALPITES ──────────────────────────────────────────────
async function savePalpites({ nome, palpites, extras }) {
  const n = normName(nome);
  if (!n) return { ok: false, error: 'Nome inválido' };

  // Valida scores
  for (const p of (palpites || [])) {
    if (!isValidScore(p.gols1) || !isValidScore(p.gols2)) {
      return { ok: false, error: 'Placar inválido' };
    }
  }

  const rows = await readRows();
  const toDelete = [];
  const ptsAntigos = {};

  for (let i = 1; i < rows.length; i++) {
    // Bug fix: trim na comparação
    const nmLinha = normName(rows[i][5]);
    if (nmLinha === n && (rows[i][0] === 'palpite' || rows[i][0] === 'palpite_extra')) {
      if (rows[i][0] === 'palpite_extra') ptsAntigos[rows[i][1]] = rows[i][7] || 0;
      toDelete.push(i);
    }
  }
  if (toDelete.length) await deleteRows(toDelete);

  const newRows = [];
  for (const p of (palpites || [])) {
    newRows.push(['palpite', p.grupo, p.jogoIdx, p.gols1, p.gols2, n, p.penaltis || 0, '']);
  }
  for (const k of Object.keys(extras || {})) {
    const val = (extras[k] || '').trim();
    if (val) newRows.push(['palpite_extra', k, '', '', '', n, val, ptsAntigos[k] || 0]);
  }
  await appendRows(newRows);
  return { ok: true };
}

// ── RESULTADOS OFICIAIS ───────────────────────────────────
async function saveResultados({ resultados, extrasChecks }) {
  const rows = await readRows();

  // Calcula ranking atual para salvar como "anterior"
  const part = [], pal = {}, extP = {}, ofi = {};
  let reg = { ...REGRAS_PADRAO };
  for (let i = 1; i < rows.length; i++) {
    const [t, g, ji, g1, g2, n, ex, pEx] = rows[i];
    if (!t) continue;
    const nm = normName(n);
    if (t === 'participante' && nm && !part.includes(nm)) part.push(nm);
    else if (t === 'palpite' && nm) { if (!pal[nm]) pal[nm] = []; pal[nm].push({ grupo: g, jogoIdx: parseInt(ji), gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 }); }
    else if (t === 'palpite_extra' && nm) { if (!extP[nm]) extP[nm] = {}; extP[nm][g] = { palpite: ex, pontuou: pEx == 1 }; }
    else if (t === 'oficial') { ofi[g + '-' + ji] = { gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 }; }
    else if (t === 'regra') { reg[g] = parseInt(ji); }
  }
  const rankingAtual = part.map(nm => { const c = calcularPontos(nm, pal[nm] || [], extP[nm] || {}, ofi, reg); return { nome: nm, pts: c.total }; });
  rankingAtual.sort((a, b) => b.pts - a.pts);

  // Remove oficiais e ranking_anterior antigos
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'oficial' || rows[i][0] === 'ranking_anterior') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);

  // Salva ranking anterior
  const novasLinhas = rankingAtual.map((ra, idx) => ['ranking_anterior', ra.nome, idx + 1, '', '', 'SISTEMA', '', '']);

  // Salva novos resultados (com validação)
  for (const r of (resultados || [])) {
    const g1 = parseInt(r.gols1), g2 = parseInt(r.gols2);
    if (isValidScore(g1) && isValidScore(g2)) {
      novasLinhas.push(['oficial', r.grupo, r.jogoIdx, g1, g2, 'OFICIAL', r.penaltis || 0, '']);
    }
  }
  await appendRows(novasLinhas);

  // Atualiza flags de extras (só para participantes cadastrados)
  const newRows = await readRows();
  const cellUpdates = [];
  for (let j = 1; j < newRows.length; j++) {
    if (newRows[j][0] === 'palpite_extra') {
      const rNome = newRows[j][1], pNome = normName(newRows[j][5]);
      // Bug fix: só atualiza se o participante ainda existe
      if (part.includes(pNome)) {
        const check = (extrasChecks?.[pNome]?.[rNome]) ? 1 : 0;
        cellUpdates.push({ row: j + 1, col: 8, value: check });
      }
    }
  }
  await updateCells(cellUpdates);
  return { ok: true };
}

// ── REGRAS ────────────────────────────────────────────────
async function saveRegras({ regras }) {
  if (!regras || typeof regras !== 'object') return { ok: false, error: 'Regras inválidas' };
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'regra') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  const novasLinhas = [];
  for (const k of Object.keys(regras)) {
    const val = parseInt(regras[k]);
    if (!isNaN(val) && val >= 0) {
      novasLinhas.push(['regra', k, val, '', '', 'SISTEMA', '', '']);
    }
  }
  await appendRows(novasLinhas);
  return { ok: true };
}

// ── REGRAS AO VIVO ────────────────────────────────────────
async function saveRegrasAoVivo({ regras }) {
  if (!regras || typeof regras !== 'object') return { ok: false, error: 'Regras inválidas' };
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'regra_aovivo') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  const novasLinhas = [];
  for (const k of Object.keys(regras)) {
    const val = parseInt(regras[k]);
    if (!isNaN(val) && val >= 0) {
      novasLinhas.push(['regra_aovivo', k, val, '', '', 'SISTEMA', '', '']);
    }
  }
  await appendRows(novasLinhas);
  return { ok: true };
}

// ── PALPITES MATA-MATA AO VIVO ────────────────────────────
async function savePalpiteMataMataVivo({ nome, palpites }) {
  const n = normName(nome);
  if (!n) return { ok: false, error: 'Nome inválido' };
  for (const p of (palpites || [])) {
    if (!isValidScore(p.gols1) || !isValidScore(p.gols2)) {
      return { ok: false, error: 'Placar inválido' };
    }
  }
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'palpite_mm_vivo' && normName(rows[i][5]) === n) toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  const newRows = (palpites || []).map(p => ['palpite_mm_vivo', p.matchId, '', p.gols1, p.gols2, n, p.penaltis || 0, '']);
  await appendRows(newRows);
  return { ok: true };
}

// ── CHAVEAMENTO OFICIAL (Mata-Mata Ao Vivo) ──────────────
async function saveChaveamentoOficial({ jogos }) {
  if (!Array.isArray(jogos)) return { ok: false, error: 'Chaveamento inválido' };
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'chaveamento_oficial') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  const novasLinhas = jogos.map(j => ['chaveamento_oficial', String(j.id), '', '', '', 'SISTEMA', (j.p1 || '') + '|' + (j.p2 || ''), '']);
  await appendRows(novasLinhas);
  return { ok: true };
}

// ── ESTADO DO TORNEIO ─────────────────────────────────────
async function setEstadoTorneio({ estado }) {
  const e = (estado || '').trim();
  if (e !== 'previsao' && e !== 'ao_vivo') return { ok: false, error: 'Estado inválido' };
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'estado_torneio') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  await appendRow(['estado_torneio', e, '', '', '', 'SISTEMA', '', '']);
  return { ok: true };
}

// ── PRAZO ─────────────────────────────────────────────────
async function savePrazo({ prazo }) {
  const rows = await readRows();
  const toDelete = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === 'prazo') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  const p = (prazo || '').trim();
  if (p) await appendRow(['prazo', p, '', '', '', 'SISTEMA', '', '']);
  return { ok: true };
}
