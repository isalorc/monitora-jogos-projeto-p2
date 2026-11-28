import AsyncStorage from '@react-native-async-storage/async-storage';
import { chaveDia } from '../services/formatacao';

const STORAGE_KEY = 'historico_precos';
const JOGOS_MONITORADOS_KEY = 'jogos_monitorados';

async function lerRegistros() {
  const conteudo = await AsyncStorage.getItem(STORAGE_KEY);
  if (conteudo === null) return [];

  try {
    const registros = JSON.parse(conteudo);
    if (!Array.isArray(registros)) throw new Error('Formato inválido');
    return registros;
  } catch {
    throw new Error('O histórico salvo está inválido. Limpe os dados do histórico para continuar.');
  }
}

export async function getJogosMonitorados() {
  const conteudo = await AsyncStorage.getItem(JOGOS_MONITORADOS_KEY);
  if (conteudo === null) return [];

  try {
    const dados = JSON.parse(conteudo);
    const jogos = Array.isArray(dados)
      ? dados
      : dados && typeof dados === 'object' && Array.isArray(dados.jogos)
        ? dados.jogos
        : dados && typeof dados === 'object'
          ? Object.values(dados).filter((item) => item && typeof item === 'object' && item.gameId)
          : null;

    if (!jogos) throw new Error('Formato inválido');
    if (!Array.isArray(dados)) {
      await AsyncStorage.setItem(JOGOS_MONITORADOS_KEY, JSON.stringify(jogos));
    }
    return jogos;
  } catch {
    throw new Error('A lista de jogos monitorados está inválida.');
  }
}

export async function adicionarJogoMonitorado(jogo) {
  const jogos = await getJogosMonitorados();
  if (jogos.some((item) => item.gameId === jogo.gameId)) return jogos;

  const atualizados = [...jogos, jogo];
  await AsyncStorage.setItem(JOGOS_MONITORADOS_KEY, JSON.stringify(atualizados));
  return atualizados;
}

export async function removerJogoMonitorado(gameId) {
  const jogos = await getJogosMonitorados();
  const atualizados = jogos.filter((jogo) => jogo.gameId !== String(gameId));
  await AsyncStorage.setItem(JOGOS_MONITORADOS_KEY, JSON.stringify(atualizados));
  return atualizados;
}

export async function salvarConsulta(jogos) {
  const anteriores = await lerRegistros();
  const consultadoEm = new Date().toISOString();
  const chaveDataNova = chaveDia(consultadoEm);
  const novos = jogos.map((jogo) => {
    const anteriorDoDia = anteriores.find((registro) => (
      String(registro.gameId) === String(jogo.gameId) && chaveDia(registro.consultadoEm) === chaveDataNova
    ));
    const precos = [
      Number(jogo.salePrice),
      Number(anteriorDoDia?.menorPrecoDia ?? anteriorDoDia?.salePrice),
    ].filter((preco) => Number.isFinite(preco) && preco >= 0);

    return {
      ...jogo,
      consultadoEm,
      consultaId: consultadoEm,
      origem: 'api',
      menorPrecoDia: precos.length ? Math.min(...precos) : jogo.salePrice,
    };
  });

  const jogosNovos = new Set(novos.map((jogo) => String(jogo.gameId)));
  const restantes = anteriores.filter((registro) => (
    !jogosNovos.has(String(registro.gameId)) || chaveDia(registro.consultadoEm) !== chaveDataNova
  ));

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...novos, ...restantes]));
  return novos;
}

export async function getHistorico() {
  const registros = await lerRegistros();
  return registros.sort((a, b) => new Date(b.consultadoEm) - new Date(a.consultadoEm));
}

export async function getHistoricoDoJogo(gameId) {
  const registros = await lerRegistros();
  return registros
    .filter((registro) => String(registro.gameId) === String(gameId))
    .sort((a, b) => new Date(a.consultadoEm) - new Date(b.consultadoEm));
}

export async function limparHistorico() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function limparTudo() {
  await AsyncStorage.multiRemove([STORAGE_KEY, JOGOS_MONITORADOS_KEY]);
}
