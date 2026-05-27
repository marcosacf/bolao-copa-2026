var SHEET_NAME = "DADOS_BOLAO";

var GRUPOS = {
  A: { paises: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"], jogos: [["México", "África do Sul"], ["Coreia do Sul", "República Tcheca"], ["República Tcheca", "África do Sul"], ["México", "Coreia do Sul"], ["República Tcheca", "México"], ["África do Sul", "Coreia do Sul"]] },
  B: { paises: ["Canadá", "Bósnia", "Catar", "Suíça"], jogos: [["Canadá", "Bósnia"], ["Catar", "Suíça"], ["Suíça", "Bósnia"], ["Canadá", "Catar"], ["Suíça", "Canadá"], ["Bósnia", "Catar"]] },
  C: { paises: ["Brasil", "Marrocos", "Haiti", "Escócia"], jogos: [["Brasil", "Marrocos"], ["Haiti", "Escócia"], ["Brasil", "Haiti"], ["Escócia", "Marrocos"], ["Escócia", "Brasil"], ["Marrocos", "Haiti"]] },
  D: { paises: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"], jogos: [["Estados Unidos", "Paraguai"], ["Austrália", "Turquia"], ["Turquia", "Paraguai"], ["Estados Unidos", "Austrália"], ["Turquia", "Estados Unidos"], ["Paraguai", "Austrália"]] },
  E: { paises: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"], jogos: [["Alemanha", "Curaçao"], ["Costa do Marfim", "Equador"], ["Alemanha", "Costa do Marfim"], ["Equador", "Curaçao"], ["Equador", "Alemanha"], ["Curaçao", "Costa do Marfim"]] },
  F: { paises: ["Holanda", "Japão", "Suécia", "Tunísia"], jogos: [["Holanda", "Japão"], ["Suécia", "Tunísia"], ["Holanda", "Suécia"], ["Tunísia", "Japão"], ["Tunísia", "Holanda"], ["Japão", "Suécia"]] },
  G: { paises: ["Bélgica", "Egito", "Irã", "Nova Zelândia"], jogos: [["Bélgica", "Egito"], ["Irã", "Nova Zelândia"], ["Bélgica", "Irã"], ["Nova Zelândia", "Egito"], ["Nova Zelândia", "Bélgica"], ["Egito", "Irã"]] },
  H: { paises: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"], jogos: [["Espanha", "Cabo Verde"], ["Arábia Saudita", "Uruguai"], ["Espanha", "Arábia Saudita"], ["Cabo Verde", "Uruguai"], ["Cabo Verde", "Espanha"], ["Uruguai", "Arábia Saudita"]] },
  I: { paises: ["França", "Senegal", "Iraque", "Noruega"], jogos: [["França", "Senegal"], ["Iraque", "Noruega"], ["França", "Iraque"], ["Noruega", "Senegal"], ["Senegal", "França"], ["Noruega", "Iraque"]] },
  J: { paises: ["Argentina", "Argélia", "Áustria", "Jordânia"], jogos: [["Argentina", "Argélia"], ["Áustria", "Jordânia"], ["Argentina", "Áustria"], ["Jordânia", "Argélia"], ["Argélia", "Áustria"], ["Jordânia", "Argentina"]] },
  K: { paises: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"], jogos: [["Portugal", "RD Congo"], ["Uzbequistão", "Colômbia"], ["Portugal", "Uzbequistão"], ["Colômbia", "RD Congo"], ["Colômbia", "Portugal"], ["RD Congo", "Uzbequistão"]] },
  L: { paises: ["Inglaterra", "Croácia", "Gana", "Panamá"], jogos: [["Inglaterra", "Croácia"], ["Gana", "Panamá"], ["Inglaterra", "Gana"], ["Panamá", "Croácia"], ["Panamá", "Inglaterra"], ["Croácia", "Gana"]] }
};

var BANDEIRAS = {
  "México": "🇲🇽", "África do Sul": "🇿🇦", "Coreia do Sul": "🇰🇷", "República Tcheca": "🇨🇿",
  "Canadá": "🇨🇦", "Bósnia": "🇧🇦", "Catar": "🇶🇦", "Suíça": "🇨🇭",
  "Brasil": "🇧🇷", "Marrocos": "🇲🇦", "Haiti": "🇭🇹", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪", "Curaçao": "🇨🇼", "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
  "Holanda": "🇳🇱", "Japão": "🇯🇵", "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪", "Egito": "🇪🇬", "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻", "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
  "França": "🇫🇷", "Senegal": "🇸🇳", "Iraque": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argélia": "🇩🇿", "Áustria": "🇦🇹", "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia": "🇭🇷", "Gana": "🇬🇭", "Panamá": "🇵🇦"
};

var REGRAS_PADRAO = { placarExato: 10, acertouVencedor: 5, classifExata: 10, classifPassou: 5, "Campeão": 30, "Artilheiro": 30 };

function doGet(e) { return HtmlService.createHtmlOutputFromFile('Index').setTitle('⚽ Bolão Copa 2026').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (data.action === 'addParticipant') return ContentService.createTextOutput(JSON.stringify(addParticipant(data)));
  if (data.action === 'removeParticipant') return ContentService.createTextOutput(JSON.stringify(removeParticipant(data)));
  if (data.action === 'savePalpites') return ContentService.createTextOutput(JSON.stringify(savePalpites(data)));
  if (data.action === 'saveResultados') return ContentService.createTextOutput(JSON.stringify(saveResultados(data)));
  if (data.action === 'saveRegras') return ContentService.createTextOutput(JSON.stringify(saveRegras(data)));
  if (data.action === 'getData') return ContentService.createTextOutput(JSON.stringify(getData()));
}

function initSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 8).setValues([["tipo", "grupo", "jogo_idx", "gols1", "gols2", "participante", "extra", "pontuou_extra"]]);
  }
  return sheet;
}

function addParticipant(data) {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues(), nome = data.nome.trim();
  if (!nome) return { ok: false };
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === 'participante' && rows[i][5] === nome) return { ok: false, msg: 'Já existe' };
  sheet.appendRow(['participante', '', '', '', '', nome, '', '']);
  return { ok: true };
}

function removeParticipant(data) {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) if (rows[i][5] === data.nome) sheet.deleteRow(i + 1);
  return { ok: true };
}

function saveRegras(data) {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) if (rows[i][0] === 'regra') sheet.deleteRow(i + 1);
  Object.keys(data.regras).forEach(function(k) { sheet.appendRow(['regra', k, data.regras[k], '', '', 'SISTEMA', '', '']); });
  return { ok: true };
}

function savePalpites(data) {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues(), nome = data.nome, ptsAntigos = {};
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][5] === nome && (rows[i][0] === 'palpite' || rows[i][0] === 'palpite_extra')) {
      if (rows[i][0] === 'palpite_extra') ptsAntigos[rows[i][1]] = rows[i][7] || 0;
      sheet.deleteRow(i + 1);
    }
  }
  data.palpites.forEach(function(p) { sheet.appendRow(['palpite', p.grupo, p.jogoIdx, p.gols1, p.gols2, nome, p.penaltis || '', '']); });
  Object.keys(data.extras).forEach(function(k) { sheet.appendRow(['palpite_extra', k, '', '', '', nome, data.extras[k], ptsAntigos[k] || 0]); });
  return { ok: true };
}

function saveResultados(data) {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) if (rows[i][0] === 'oficial') sheet.deleteRow(i + 1);
  data.resultados.forEach(function(r) { if (r.gols1 !== '' && r.gols2 !== '') sheet.appendRow(['oficial', r.grupo, r.jogoIdx, r.gols1, r.gols2, 'OFICIAL', r.penaltis || '', '']); });
  
  var novasLinhas = sheet.getDataRange().getValues();
  for (var j = 1; j < novasLinhas.length; j++) {
    if (novasLinhas[j][0] === 'palpite_extra') {
      var rNome = novasLinhas[j][1], pNome = novasLinhas[j][5];
      var check = (data.extrasChecks[pNome] && data.extrasChecks[pNome][rNome]) ? 1 : 0;
      sheet.getRange(j + 1, 8).setValue(check);
    }
  }
  return { ok: true };
}

function getData() {
  var sheet = initSheet(), rows = sheet.getDataRange().getValues();
  var part = [], pal = {}, extP = {}, ofi = {}, reg = Object.assign({}, REGRAS_PADRAO);

  for (var i = 1; i < rows.length; i++) {
    var t = rows[i][0], g = rows[i][1], ji = rows[i][2], g1 = rows[i][3], g2 = rows[i][4], n = rows[i][5], ex = rows[i][6], pEx = rows[i][7];
    if (t === 'participante') { if (part.indexOf(n) < 0) part.push(n); }
    else if (t === 'palpite') { if (!pal[n]) pal[n] = []; pal[n].push({ grupo: g, jogoIdx: parseInt(ji), gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 }); }
    else if (t === 'palpite_extra') { if (!extP[n]) extP[n] = {}; extP[n][g] = { palpite: ex, pontuou: (pEx == 1) }; }
    else if (t === 'oficial') { ofi[g + '-' + ji] = { gols1: parseInt(g1), gols2: parseInt(g2), penaltis: parseInt(ex) || 0 }; }
    else if (t === 'regra') { reg[g] = parseInt(ji); }
  }

  var ranking = part.map(function(n) { var c = calcularPontos(n, pal[n] || [], extP[n] || {}, ofi, reg); return { nome: n, pts: c.total, detalhes: c }; });
  ranking.sort(function(a, b) { return b.pts - a.pts; });
  return { ok: true, participantes: part, palpites: pal, extrasPalpite: extP, oficiais: ofi, regras: reg, ranking: ranking, grupos: GRUPOS, bandeiras: BANDEIRAS };
}

function calcularPontos(nome, palpites, extrasP, oficiais, regras) {
  var ptJ = 0, ptC = 0, ptE = 0, extrato = [];

  palpites.forEach(function(p) {
    var of = oficiais[p.grupo + '-' + p.jogoIdx]; if (!of) return;
    var t1 = GRUPOS[p.grupo] ? GRUPOS[p.grupo].jogos[p.jogoIdx][0] : "Jogo " + p.jogoIdx;
    var t2 = GRUPOS[p.grupo] ? GRUPOS[p.grupo].jogos[p.jogoIdx][1] : "Mata-Mata";
    var descMatch = t1 + " vs " + t2;

    if (p.gols1 === of.gols1 && p.gols2 === of.gols2) {
      ptJ += (regras.placarExato || 10);
      extrato.push({ icone: '🎯', texto: descMatch + " (Placar Exato)", pts: (regras.placarExato || 10), grupo: p.grupo, ordem: 1 });
    } else {
      var resP = p.gols1 > p.gols2 ? 1 : (p.gols1 < p.gols2 ? -1 : 0), resO = of.gols1 > of.gols2 ? 1 : (of.gols1 < of.gols2 ? -1 : 0);
      if (resP === resO) {
        ptJ += (regras.acertouVencedor || 5);
        extrato.push({ icone: '✅', texto: descMatch + " (Vencedor/Empate)", pts: (regras.acertouVencedor || 5), grupo: p.grupo, ordem: 2 });
      }
    }
  });

  Object.keys(GRUPOS).forEach(function(letra) {
    var grupo = GRUPOS[letra];
    if (grupo.jogos.filter(function(_, i) { return oficiais[letra + '-' + i] !== undefined; }).length === 6) {
      var t2Ofi = getTop2(calcStats(grupo, oficiais, letra)), t2Pal = getTop2(calcStatsPalpite(grupo, palpites, letra));
      if (t2Pal[0] === t2Ofi[0]) { ptC += (regras.classifExata || 10); extrato.push({ icone: '📍', texto: "1º Lugar Grupo " + letra + " (" + t2Pal[0] + ")", pts: (regras.classifExata || 10), grupo: letra, ordem: 3 }); }
      else if (t2Pal[0] === t2Ofi[1]) { ptC += (regras.classifPassou || 5); extrato.push({ icone: '🔄', texto: t2Pal[0] + " Classificou", pts: (regras.classifPassou || 5), grupo: letra, ordem: 4 }); }
      if (t2Pal[1] === t2Ofi[1]) { ptC += (regras.classifExata || 10); extrato.push({ icone: '📍', texto: "2º Lugar Grupo " + letra + " (" + t2Pal[1] + ")", pts: (regras.classifExata || 10), grupo: letra, ordem: 3 }); }
      else if (t2Pal[1] === t2Ofi[0]) { ptC += (regras.classifPassou || 5); extrato.push({ icone: '🔄', texto: t2Pal[1] + " Classificou", pts: (regras.classifPassou || 5), grupo: letra, ordem: 4 }); }
    }
  });

  Object.keys(extrasP).forEach(function(k) {
    if (extrasP[k].pontuou) {
      ptE += (regras[k] || 0);
      extrato.push({ icone: '⭐', texto: k + ": " + extrasP[k].palpite, pts: (regras[k] || 0), grupo: 'ZZZ', ordem: 5 });
    }
  });

  extrato.sort(function(a, b) { return a.grupo !== b.grupo ? a.grupo.localeCompare(b.grupo) : a.ordem - b.ordem; });
  return { total: ptJ + ptC + ptE, extrato: extrato };
}

function calcStats(g, ofi, l) {
  var s = {}; g.paises.forEach(function(p) { s[p] = { pts: 0, sg: 0, gp: 0, j: 0, v: 0, e: 0, d: 0 }; });
  g.jogos.forEach(function(j, i) {
    var o = ofi[l + '-' + i]; if (!o) return;
    s[j[0]].j++; s[j[1]].j++; s[j[0]].gp += o.gols1; s[j[1]].gp += o.gols2; s[j[0]].sg += (o.gols1 - o.gols2); s[j[1]].sg += (o.gols2 - o.gols1);
    if (o.gols1 > o.gols2) { s[j[0]].pts += 3; s[j[0]].v++; s[j[1]].d++; } else if (o.gols1 < o.gols2) { s[j[1]].pts += 3; s[j[1]].v++; s[j[0]].d++; } else { s[j[0]].pts++; s[j[1]].pts++; s[j[0]].e++; s[j[1]].e++; }
  }); return s;
}

function calcStatsPalpite(g, pal, l) {
  var s = {}; g.paises.forEach(function(p) { s[p] = { pts: 0, sg: 0, gp: 0, j: 0, v: 0, e: 0, d: 0 }; });
  g.jogos.forEach(function(j, i) {
    var p = pal.find(function(x) { return x.grupo === l && x.jogoIdx === i; }); if (!p) return;
    s[j[0]].j++; s[j[1]].j++; s[j[0]].gp += p.gols1; s[j[1]].gp += p.gols2; s[j[0]].sg += (p.gols1 - p.gols2); s[j[1]].sg += (p.gols2 - p.gols1);
    if (p.gols1 > p.gols2) { s[j[0]].pts += 3; s[j[0]].v++; s[j[1]].d++; } else if (p.gols1 < p.gols2) { s[j[1]].pts += 3; s[j[1]].v++; s[j[0]].d++; } else { s[j[0]].pts++; s[j[1]].pts++; s[j[0]].e++; s[j[1]].e++; }
  }); return s;
}

function getTop2(s) {
  var arr = Object.keys(s).map(function(k) { return { n: k, pts: s[k].pts, sg: s[k].sg, gp: s[k].gp }; });
  arr.sort(function(x, y) { return y.pts !== x.pts ? y.pts - x.pts : (y.sg !== x.sg ? y.sg - x.sg : y.gp - x.gp); });
  return [arr[0] ? arr[0].n : null, arr[1] ? arr[1].n : null];
}
