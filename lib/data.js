// lib/data.js — lógica de negócio portada do Codigo.gs

export const GRUPOS = {
  A: { paises: ["México","África do Sul","Coreia do Sul","República Tcheca"], jogos: [["México","África do Sul"],["Coreia do Sul","República Tcheca"],["República Tcheca","África do Sul"],["México","Coreia do Sul"],["República Tcheca","México"],["África do Sul","Coreia do Sul"]] },
  B: { paises: ["Canadá","Bósnia","Catar","Suíça"], jogos: [["Canadá","Bósnia"],["Catar","Suíça"],["Suíça","Bósnia"],["Canadá","Catar"],["Suíça","Canadá"],["Bósnia","Catar"]] },
  C: { paises: ["Brasil","Marrocos","Haiti","Escócia"], jogos: [["Brasil","Marrocos"],["Haiti","Escócia"],["Brasil","Haiti"],["Escócia","Marrocos"],["Escócia","Brasil"],["Marrocos","Haiti"]] },
  D: { paises: ["Estados Unidos","Paraguai","Austrália","Turquia"], jogos: [["Estados Unidos","Paraguai"],["Austrália","Turquia"],["Turquia","Paraguai"],["Estados Unidos","Austrália"],["Turquia","Estados Unidos"],["Paraguai","Austrália"]] },
  E: { paises: ["Alemanha","Curaçao","Costa do Marfim","Equador"], jogos: [["Alemanha","Curaçao"],["Costa do Marfim","Equador"],["Alemanha","Costa do Marfim"],["Equador","Curaçao"],["Equador","Alemanha"],["Curaçao","Costa do Marfim"]] },
  F: { paises: ["Holanda","Japão","Suécia","Tunísia"], jogos: [["Holanda","Japão"],["Suécia","Tunísia"],["Holanda","Suécia"],["Tunísia","Japão"],["Tunísia","Holanda"],["Japão","Suécia"]] },
  G: { paises: ["Bélgica","Egito","Irã","Nova Zelândia"], jogos: [["Bélgica","Egito"],["Irã","Nova Zelândia"],["Bélgica","Irã"],["Nova Zelândia","Egito"],["Nova Zelândia","Bélgica"],["Egito","Irã"]] },
  H: { paises: ["Espanha","Cabo Verde","Arábia Saudita","Uruguai"], jogos: [["Espanha","Cabo Verde"],["Arábia Saudita","Uruguai"],["Espanha","Arábia Saudita"],["Cabo Verde","Uruguai"],["Espanha","Uruguai"],["Cabo Verde","Arábia Saudita"]] },
  I: { paises: ["França","Senegal","Iraque","Noruega"], jogos: [["França","Senegal"],["Iraque","Noruega"],["França","Iraque"],["Noruega","Senegal"],["França","Noruega"],["Senegal","Iraque"]] },
  J: { paises: ["Argentina","Argélia","Áustria","Jordânia"], jogos: [["Argentina","Argélia"],["Áustria","Jordânia"],["Argentina","Áustria"],["Jordânia","Argélia"],["Argélia","Áustria"],["Jordânia","Argentina"]] },
  K: { paises: ["Portugal","RD Congo","Uzbequistão","Colômbia"], jogos: [["Portugal","RD Congo"],["Uzbequistão","Colômbia"],["Portugal","Uzbequistão"],["Colômbia","RD Congo"],["Colômbia","Portugal"],["RD Congo","Uzbequistão"]] },
  L: { paises: ["Inglaterra","Croácia","Gana","Panamá"], jogos: [["Inglaterra","Croácia"],["Gana","Panamá"],["Inglaterra","Gana"],["Panamá","Croácia"],["Panamá","Inglaterra"],["Croácia","Gana"]] }
};

export const BANDEIRAS = {
  "México":"🇲🇽","África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","República Tcheca":"🇨🇿",
  "Canadá":"🇨🇦","Bósnia":"🇧🇦","Catar":"🇶🇦","Suíça":"🇨🇭",
  "Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
  "Alemanha":"🇩🇪","Curaçao":"🇨🇼","Costa do Marfim":"🇨🇮","Equador":"🇪🇨",
  "Holanda":"🇳🇱","Japão":"🇯🇵","Suécia":"🇸🇪","Tunísia":"🇹🇳",
  "Bélgica":"🇧🇪","Egito":"🇪🇬","Irã":"🇮🇷","Nova Zelândia":"🇳🇿",
  "Espanha":"🇪🇸","Cabo Verde":"🇨🇻","Arábia Saudita":"🇸🇦","Uruguai":"🇺🇾",
  "França":"🇫🇷","Senegal":"🇸🇳","Iraque":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argélia":"🇩🇿","Áustria":"🇦🇹","Jordânia":"🇯🇴",
  "Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbequistão":"🇺🇿","Colômbia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croácia":"🇭🇷","Gana":"🇬🇭","Panamá":"🇵🇦"
};

export const REGRAS_PADRAO = {
  placarExato: 10, acertouVencedor: 5, classifExata: 10, classifPassou: 5,
  "Campeão": 30, "Artilheiro": 30
};

export const REGRAS_AOVIVO_PADRAO = {
  placarExato: 5, acertouVencedor: 2, acertouEmpate: 2, acertouClassificado: 2
};

export function calcStats(g, ofi, l) {
  const s = {};
  g.paises.forEach(p => s[p] = { pts:0, sg:0, gp:0, j:0, v:0, e:0, d:0 });
  g.jogos.forEach((j, i) => {
    const o = ofi[l + '-' + i]; if (!o) return;
    s[j[0]].j++; s[j[1]].j++;
    s[j[0]].gp += o.gols1; s[j[1]].gp += o.gols2;
    s[j[0]].sg += (o.gols1 - o.gols2); s[j[1]].sg += (o.gols2 - o.gols1);
    if (o.gols1 > o.gols2) { s[j[0]].pts+=3; s[j[0]].v++; s[j[1]].d++; }
    else if (o.gols1 < o.gols2) { s[j[1]].pts+=3; s[j[1]].v++; s[j[0]].d++; }
    else { s[j[0]].pts++; s[j[1]].pts++; s[j[0]].e++; s[j[1]].e++; }
  });
  return s;
}

export function calcStatsPalpite(g, pal, l) {
  const s = {};
  g.paises.forEach(p => s[p] = { pts:0, sg:0, gp:0, j:0, v:0, e:0, d:0 });
  g.jogos.forEach((j, i) => {
    const p = pal.find(x => x.grupo === l && x.jogoIdx === i); if (!p) return;
    s[j[0]].j++; s[j[1]].j++;
    s[j[0]].gp += p.gols1; s[j[1]].gp += p.gols2;
    s[j[0]].sg += (p.gols1 - p.gols2); s[j[1]].sg += (p.gols2 - p.gols1);
    if (p.gols1 > p.gols2) { s[j[0]].pts+=3; s[j[0]].v++; s[j[1]].d++; }
    else if (p.gols1 < p.gols2) { s[j[1]].pts+=3; s[j[1]].v++; s[j[0]].d++; }
    else { s[j[0]].pts++; s[j[1]].pts++; s[j[0]].e++; s[j[1]].e++; }
  });
  return s;
}

export function getTop2(s) {
  const arr = Object.keys(s).map(k => ({ n:k, pts:s[k].pts, sg:s[k].sg, gp:s[k].gp }));
  arr.sort((x, y) => y.pts !== x.pts ? y.pts-x.pts : y.sg !== x.sg ? y.sg-x.sg : y.gp-x.gp);
  return [arr[0]?.n || null, arr[1]?.n || null];
}

function faseDoJogoMM(id) {
  if (id <= 16) return 'R32';
  if (id <= 24) return 'R16';
  if (id <= 28) return 'QF';
  if (id <= 30) return 'SF';
  return 'FI';
}

export function calcularPontosAoVivo(palpites, oficiais, regrasAoVivo) {
  let total = 0, extrato = [];
  (palpites || []).forEach(p => {
    const of = oficiais[faseDoJogoMM(p.matchId) + '-' + p.matchId];
    if (!of) return;
    const desc = 'Mata-Mata #' + p.matchId;
    const exato = (p.gols1 === of.gols1 && p.gols2 === of.gols2);
    if (exato) {
      total += (regrasAoVivo.placarExato || 5);
      extrato.push({ icone: '🎯', texto: desc + ' (Placar Exato)', pts: (regrasAoVivo.placarExato || 5), grupo: 'MM', ordem: 1 });
    } else {
      const resP = p.gols1 > p.gols2 ? 1 : p.gols1 < p.gols2 ? -1 : 0;
      const resO = of.gols1 > of.gols2 ? 1 : of.gols1 < of.gols2 ? -1 : 0;
      if (resP === resO) {
        if (resO === 0) {
          total += (regrasAoVivo.acertouEmpate || 2);
          extrato.push({ icone: '🤝', texto: desc + ' (Empate)', pts: (regrasAoVivo.acertouEmpate || 2), grupo: 'MM', ordem: 2 });
        } else {
          total += (regrasAoVivo.acertouVencedor || 2);
          extrato.push({ icone: '✅', texto: desc + ' (Vencedor)', pts: (regrasAoVivo.acertouVencedor || 2), grupo: 'MM', ordem: 2 });
        }
      }
    }
    if (of.gols1 === of.gols2 && of.penaltis && (of.penaltis === 1 || of.penaltis === 2)) {
      if (p.penaltis === of.penaltis) {
        total += (regrasAoVivo.acertouClassificado || 2);
        extrato.push({ icone: '🥅', texto: desc + ' (Classificado nos pênaltis)', pts: (regrasAoVivo.acertouClassificado || 2), grupo: 'MM', ordem: 3 });
      }
    }
  });
  return { total, extrato };
}

export function calcularPontos(nome, palpites, extrasP, oficiais, regras) {
  let ptJ=0, ptC=0, ptE=0, extrato=[];

  palpites.forEach(p => {
    const of = oficiais[p.grupo + '-' + p.jogoIdx]; if (!of) return;
    const t1 = GRUPOS[p.grupo]?.jogos[p.jogoIdx]?.[0] || 'Jogo ' + p.jogoIdx;
    const t2 = GRUPOS[p.grupo]?.jogos[p.jogoIdx]?.[1] || 'Mata-Mata';
    const desc = t1 + ' vs ' + t2;
    if (p.gols1 === of.gols1 && p.gols2 === of.gols2) {
      ptJ += (regras.placarExato||10);
      extrato.push({ icone:'🎯', texto:desc+' (Placar Exato)', pts:(regras.placarExato||10), grupo:p.grupo, ordem:1 });
    } else {
      const resP = p.gols1>p.gols2?1:p.gols1<p.gols2?-1:0;
      const resO = of.gols1>of.gols2?1:of.gols1<of.gols2?-1:0;
      if (resP === resO) {
        ptJ += (regras.acertouVencedor||5);
        extrato.push({ icone:'✅', texto:desc+' (Vencedor/Empate)', pts:(regras.acertouVencedor||5), grupo:p.grupo, ordem:2 });
      }
    }
  });

  Object.keys(GRUPOS).forEach(letra => {
    const grupo = GRUPOS[letra];
    const jogosComResultado = grupo.jogos.filter((_,i) => oficiais[letra+'-'+i] !== undefined).length;
    if (jogosComResultado === 6) {
      const t2Ofi = getTop2(calcStats(grupo, oficiais, letra));
      const t2Pal = getTop2(calcStatsPalpite(grupo, palpites, letra));
      if (t2Pal[0]===t2Ofi[0]) { ptC+=(regras.classifExata||10); extrato.push({icone:'📍',texto:`1º Grupo ${letra} (${t2Pal[0]})`,pts:(regras.classifExata||10),grupo:letra,ordem:3}); }
      else if (t2Pal[0]===t2Ofi[1]) { ptC+=(regras.classifPassou||5); extrato.push({icone:'🔄',texto:`${t2Pal[0]} Classificou`,pts:(regras.classifPassou||5),grupo:letra,ordem:4}); }
      if (t2Pal[1]===t2Ofi[1]) { ptC+=(regras.classifExata||10); extrato.push({icone:'📍',texto:`2º Grupo ${letra} (${t2Pal[1]})`,pts:(regras.classifExata||10),grupo:letra,ordem:3}); }
      else if (t2Pal[1]===t2Ofi[0]) { ptC+=(regras.classifPassou||5); extrato.push({icone:'🔄',texto:`${t2Pal[1]} Classificou`,pts:(regras.classifPassou||5),grupo:letra,ordem:4}); }
    }
  });

  Object.keys(extrasP).forEach(k => {
    if (extrasP[k].pontuou) {
      ptE += (regras[k]||0);
      extrato.push({icone:'⭐',texto:`${k}: ${extrasP[k].palpite}`,pts:(regras[k]||0),grupo:'ZZZ',ordem:5});
    }
  });

  extrato.sort((a,b) => a.grupo!==b.grupo ? a.grupo.localeCompare(b.grupo) : a.ordem-b.ordem);
  return { total: ptJ+ptC+ptE, extrato };
}
