const STORES_URL = 'https://www.cheapshark.com/api/1.0/stores';
const GAMES_URL = 'https://www.cheapshark.com/api/1.0/games';

async function buscarJson(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error('Sem conexão com a internet. Confira sua rede e tente novamente.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível consultar as promoções agora. Tente novamente em instantes.');
  }

  try {
    return await response.json();
  } catch {
    throw new Error('A resposta do serviço de promoções veio inválida. Tente novamente.');
  }
}

export async function buscarLojas() {
  const lojas = await buscarJson(STORES_URL);
  if (!Array.isArray(lojas)) {
    throw new Error('Não foi possível carregar a lista de lojas.');
  }

  return Object.fromEntries(lojas.map((loja) => [String(loja.storeID), loja.storeName]));
}

function formatarOferta(oferta, lojas) {
  return {
    gameId: String(oferta.gameID),
    dealId: String(oferta.dealID),
    title: oferta.title,
    salePrice: Number(oferta.salePrice),
    normalPrice: Number(oferta.normalPrice),
    discount: Math.round(Number(oferta.savings)),
    store: lojas[String(oferta.storeID)] || 'Loja desconhecida',
    image: oferta.thumb,
    dealUrl: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(oferta.dealID)}`,
  };
}

export async function buscarJogos(termo) {
  const [jogos, lojas] = await Promise.all([
    buscarJson(`${GAMES_URL}?title=${encodeURIComponent(termo)}&limit=5`),
    buscarLojas(),
  ]);
  if (!Array.isArray(jogos)) {
    throw new Error('O serviço não retornou uma lista de jogos válida.');
  }

  return Promise.all(jogos.map(async (jogo) => {
    const gameId = String(jogo.gameID);
    const detalhes = await buscarJson(`${GAMES_URL}?id=${encodeURIComponent(gameId)}`);
    const menorOferta = (detalhes.deals || [])
      .filter((oferta) => Number.isFinite(Number(oferta.price)))
      .sort((a, b) => Number(a.price) - Number(b.price))[0];

    return {
      gameId,
      title: jogo.external,
      image: jogo.thumb,
      salePrice: menorOferta ? Number(menorOferta.price) : Number(jogo.cheapest),
      store: menorOferta ? lojas[String(menorOferta.storeID)] || 'Loja desconhecida' : null,
    };
  }));
}

async function buscarOfertasDoJogo(gameId, lojas) {
  const jogo = await buscarJson(`${GAMES_URL}?id=${encodeURIComponent(gameId)}`);
  if (!jogo || !jogo.info || !Array.isArray(jogo.deals)) {
    throw new Error('Não foi possível carregar os preços desse jogo.');
  }

  return jogo.deals.map((oferta) => formatarOferta({
    ...oferta,
    gameID: gameId,
    title: jogo.info.title,
    salePrice: oferta.price,
    normalPrice: oferta.retailPrice,
    savings: oferta.savings,
    thumb: jogo.info.thumb,
  }, lojas));
}

export async function buscarMenorOfertaDoJogo(gameId) {
  const lojas = await buscarLojas();
  const ofertas = await buscarOfertasDoJogo(gameId, lojas);
  return ofertas
    .filter((oferta) => Number.isFinite(oferta.salePrice))
    .sort((a, b) => a.salePrice - b.salePrice)[0] || null;
}

export async function buscarPromocoes(jogosMonitorados = []) {
  const listaJogos = Array.isArray(jogosMonitorados)
    ? jogosMonitorados
    : jogosMonitorados && typeof jogosMonitorados === 'object'
      ? Array.isArray(jogosMonitorados.jogos)
        ? jogosMonitorados.jogos
        : Object.values(jogosMonitorados)
      : [];

  if (listaJogos.length === 0) return [];

  const lojas = await buscarLojas();
  const jogosPesquisados = await Promise.all(
    listaJogos
      .filter((jogo) => jogo && (typeof jogo.gameId === 'string' || typeof jogo.gameId === 'number'))
      .map((jogo) => buscarOfertasDoJogo(String(jogo.gameId), lojas)),
  );
  const menorOfertaPorJogo = new Map();

  jogosPesquisados.flat().forEach((oferta) => {
    const atual = menorOfertaPorJogo.get(oferta.gameId);
    if (!atual || oferta.salePrice < atual.salePrice) {
      menorOfertaPorJogo.set(oferta.gameId, oferta);
    }
  });

  return [...menorOfertaPorJogo.values()];
}
