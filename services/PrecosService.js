import { buscarMenorOfertaDoJogo, buscarPromocoes } from '../integrations/CheapSharkApi';
import { getJogosMonitorados, salvarConsulta } from '../repository/HistoricoRepository';
import { chaveDia } from './formatacao';

export function precoMinimoDoRegistro(registro) {
  const precos = [Number(registro.menorPrecoDia), Number(registro.salePrice)]
    .filter((preco) => Number.isFinite(preco) && preco >= 0);
  return precos.length ? Math.min(...precos) : null;
}

export function resumirJogos(registros) {
  const jogos = new Map();
  registros.forEach((registro) => {
    const id = String(registro.gameId);
    const atual = jogos.get(id);
    const preco = precoMinimoDoRegistro(registro);

    if (!atual) {
      jogos.set(id, { atual: registro, menorPreco: preco });
      return;
    }

    if (new Date(registro.consultadoEm) > new Date(atual.atual.consultadoEm)) {
      atual.atual = registro;
    }
    if (preco !== null && (atual.menorPreco === null || preco < atual.menorPreco)) {
      atual.menorPreco = preco;
    }
  });

  return [...jogos.values()]
    .sort((a, b) => new Date(b.atual.consultadoEm) - new Date(a.atual.consultadoEm));
}

export function menoresPrecosPorDia(registros, gameId) {
  const dias = new Map();
  registros
    .filter((registro) => String(registro.gameId) === String(gameId))
    .forEach((registro) => {
      const preco = precoMinimoDoRegistro(registro);
      if (preco === null) return;
      const chave = chaveDia(registro.consultadoEm);
      const atual = dias.get(chave);
      if (!atual || preco < atual.preco) {
        dias.set(chave, { chave, data: registro.consultadoEm, preco });
      }
    });

  return [...dias.values()].sort((a, b) => new Date(b.data) - new Date(a.data));
}

export async function atualizarPrecosMonitorados() {
  const jogosMonitorados = await getJogosMonitorados();
  if (jogosMonitorados.length === 0) return null;

  const ofertas = await buscarPromocoes(jogosMonitorados);
  await salvarConsulta(ofertas);
  return ofertas;
}

export async function registrarPrecoAtual(gameId) {
  const oferta = await buscarMenorOfertaDoJogo(gameId);
  if (!oferta) return null;

  await salvarConsulta([oferta]);
  return oferta;
}
