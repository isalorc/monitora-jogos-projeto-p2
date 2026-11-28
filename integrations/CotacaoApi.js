const COTACAO_DOLAR_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

export async function buscarCotacaoDolar() {
  let response;

  try {
    response = await fetch(COTACAO_DOLAR_URL);
  } catch {
    throw new Error('Sem conexão com a internet para buscar a cotação do dólar.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível buscar a cotação do dólar agora. Tente novamente em instantes.');
  }

  let dados;
  try {
    dados = await response.json();
  } catch {
    throw new Error('A resposta da cotação do dólar veio inválida. Tente novamente.');
  }

  const valor = Number(dados?.USDBRL?.bid);
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('A cotação do dólar veio inválida. Tente novamente.');
  }

  return { valor, atualizadaEm: dados.USDBRL.create_date };
}
