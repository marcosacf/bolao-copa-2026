// api/bolao.js — API Route do Next.js (substitui o doPost do Apps Script)

import { readRows, appendRow, deleteRows, updateCell } from '../../lib/sheets';
import { GRUPOS, BANDEIRAS, REGRAS_PADRAO, calcularPontos } from '../../lib/data';

export default async function handler(req, res) {
  // CORS — permite o frontend chamar a API
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
      const actions = {
        addParticipant,
        removeParticipant,
        savePalpites,
        saveResultados,
        saveRegras,
        savePrazo,
      };
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

// =============================================
// GET — lê todos os dados
// =============================================
async function getData() {
  const rows = await readRows();
  const part = [], pal = {}, extP = {}, ofi = {}, rankingAnterior = {};
  let reg = { ...REGRAS_PADRAO };
  let prazo = null;

  for (let i = 1; i < rows.length; i++) {
    const [t, g, ji, g1, g2, n, ex, pEx] = rows[i];
    if (!t) continue;
    if (t === 'participante') { if (!part.includes(n)) part.push(n); }
    else if (t === 'palpite') {
      if (!pal[n]) pal[n] = [];
      pal[n].push({ grupo:g, jogoIdx:parseInt(ji), gols1:parseInt(g1), gols2:parseInt(g2), penaltis:parseInt(ex)||0 });
    }
    else if (t === 'palpite_extra') {
      if (!extP[n]) extP[n] = {};
      extP[n][g] = { palpite:ex, pontuou:(pEx==1||pEx==='1') };
    }
    else if (t === 'oficial') {
      ofi[g+'-'+ji] = { gols1:parseInt(g1), gols2:parseInt(g2), penaltis:parseInt(ex)||0 };
    }
    else if (t === 'regra') { reg[g] = parseInt(ji); }
    else if (t === 'prazo') { prazo = g; }
    else if (t === 'ranking_anterior') { rankingAnterior[g] = parseInt(ji); }
  }

  const ranking = part.map(nm => {
    const c = calcularPontos(nm, pal[nm]||[], extP[nm]||{}, ofi, reg);
    return { nome:nm, pts:c.total, detalhes:c };
  });
  ranking.sort((a,b) => b.pts - a.pts);

  return { ok:true, participantes:part, palpites:pal, extrasPalpite:extP, oficiais:ofi, regras:reg, ranking, grupos:GRUPOS, bandeiras:BANDEIRAS, prazo, rankingAnterior };
}

// =============================================
// PARTICIPANTES
// =============================================
async function addParticipant({ nome }) {
  const n = (nome||'').trim();
  if (!n) return { ok:false, error:'Nome inválido' };
  if (n.length > 50) return { ok:false, error:'Nome muito longo' };
  const rows = await readRows();
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]==='participante' && rows[i][5]===n) return { ok:false, error:'Já existe' };
  }
  await appendRow(['participante','','','','',n,'','']);
  return { ok:true };
}

async function removeParticipant({ nome }) {
  const n = (nome||'').trim();
  if (!n) return { ok:false, error:'Nome inválido' };
  const rows = await readRows();
  const toDelete = [];
  for (let i=1; i<rows.length; i++) {
    const tipo = rows[i][0], nomeLinha = (rows[i][5]||'').trim();
    if (nomeLinha===n && ['participante','palpite','palpite_extra'].includes(tipo)) {
      toDelete.push(i); // índice 0-based na planilha
    }
  }
  if (toDelete.length) await deleteRows(toDelete);
  return { ok:true };
}

// =============================================
// PALPITES
// =============================================
async function savePalpites({ nome, palpites, extras }) {
  const n = (nome||'').trim();
  if (!n) return { ok:false, error:'Nome inválido' };

  const rows = await readRows();
  const toDelete = [];
  const ptsAntigos = {};

  for (let i=1; i<rows.length; i++) {
    if (rows[i][5]===n && (rows[i][0]==='palpite'||rows[i][0]==='palpite_extra')) {
      if (rows[i][0]==='palpite_extra') ptsAntigos[rows[i][1]] = rows[i][7]||0;
      toDelete.push(i);
    }
  }
  if (toDelete.length) await deleteRows(toDelete);

  for (const p of palpites) {
    await appendRow(['palpite', p.grupo, p.jogoIdx, p.gols1, p.gols2, n, p.penaltis||0, '']);
  }
  for (const k of Object.keys(extras||{})) {
    if (extras[k]) await appendRow(['palpite_extra', k, '', '', '', n, extras[k], ptsAntigos[k]||0]);
  }
  return { ok:true };
}

// =============================================
// RESULTADOS OFICIAIS
// =============================================
async function saveResultados({ resultados, extrasChecks }) {
  const rows = await readRows();

  // Salva ranking anterior
  const part = [], pal = {}, extP = {}, ofi = {};
  let reg = { ...REGRAS_PADRAO };
  for (let i=1; i<rows.length; i++) {
    const [t,g,ji,g1,g2,n,ex,pEx] = rows[i];
    if (!t) continue;
    if (t==='participante' && !part.includes(n)) part.push(n);
    else if (t==='palpite') { if (!pal[n]) pal[n]=[]; pal[n].push({grupo:g,jogoIdx:parseInt(ji),gols1:parseInt(g1),gols2:parseInt(g2),penaltis:parseInt(ex)||0}); }
    else if (t==='palpite_extra') { if (!extP[n]) extP[n]={}; extP[n][g]={palpite:ex,pontuou:pEx==1}; }
    else if (t==='oficial') { ofi[g+'-'+ji]={gols1:parseInt(g1),gols2:parseInt(g2),penaltis:parseInt(ex)||0}; }
    else if (t==='regra') { reg[g]=parseInt(ji); }
  }
  const rankingAtual = part.map(nm => { const c=calcularPontos(nm,pal[nm]||[],extP[nm]||{},ofi,reg); return {nome:nm,pts:c.total}; });
  rankingAtual.sort((a,b)=>b.pts-a.pts);

  // Remove ranking anterior e oficiais antigos
  const toDelete = [];
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]==='oficial' || rows[i][0]==='ranking_anterior') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);

  // Salva ranking anterior
  for (let idx=0; idx<rankingAtual.length; idx++) {
    await appendRow(['ranking_anterior', rankingAtual[idx].nome, idx+1, '', '', 'SISTEMA', '', '']);
  }

  // Salva novos resultados
  for (const r of resultados) {
    if (r.gols1!=='' && r.gols2!=='') {
      await appendRow(['oficial', r.grupo, r.jogoIdx, r.gols1, r.gols2, 'OFICIAL', r.penaltis||0, '']);
    }
  }

  // Atualiza flags extras
  const newRows = await readRows();
  for (let j=1; j<newRows.length; j++) {
    if (newRows[j][0]==='palpite_extra') {
      const rNome=newRows[j][1], pNome=newRows[j][5];
      const check = (extrasChecks?.[pNome]?.[rNome]) ? 1 : 0;
      await updateCell(j+1, 8, check);
    }
  }
  return { ok:true };
}

// =============================================
// REGRAS
// =============================================
async function saveRegras({ regras }) {
  const rows = await readRows();
  const toDelete = [];
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]==='regra') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  for (const k of Object.keys(regras)) {
    await appendRow(['regra', k, regras[k], '', '', 'SISTEMA', '', '']);
  }
  return { ok:true };
}

// =============================================
// PRAZO
// =============================================
async function savePrazo({ prazo }) {
  const rows = await readRows();
  const toDelete = [];
  for (let i=1; i<rows.length; i++) {
    if (rows[i][0]==='prazo') toDelete.push(i);
  }
  if (toDelete.length) await deleteRows(toDelete);
  if (prazo) await appendRow(['prazo', prazo, '', '', '', 'SISTEMA', '', '']);
  return { ok:true };
}
