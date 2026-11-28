import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Cabecalho from '../components/Cabecalho';
import HistoricoPrecosModal from '../components/HistoricoPrecosModal';
import JogoCard from '../components/JogoCard';
import { cores } from '../components/cores';
import {
  getHistorico,
  getJogosMonitorados,
  limparTudo,
  removerJogoMonitorado,
} from '../repository/HistoricoRepository';
import { horaAtualizacao, reais } from '../services/formatacao';
import {
  atualizarPrecosMonitorados,
  menoresPrecosPorDia,
  montarMeusJogos,
  obterCotacaoDolar,
} from '../services/PrecosService';

export default function MeusJogosScreen() {
  const [historico, setHistorico] = useState([]);
  const [jogosMonitorados, setJogosMonitorados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [limpando, setLimpando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [erro, setErro] = useState('');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [emReais, setEmReais] = useState(false);
  const [cotacao, setCotacao] = useState(null);
  const [buscandoCotacao, setBuscandoCotacao] = useState(false);

  const carregarDados = useCallback(async () => {
    setErro('');
    try {
      const [jogos, registros] = await Promise.all([getJogosMonitorados(), getHistorico()]);
      setJogosMonitorados(jogos);
      setHistorico(registros);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar seus jogos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregarDados();
  }, [carregarDados]));

  async function alternarReais(ativo) {
    setEmReais(ativo);
    if (!ativo || cotacao) return;

    setBuscandoCotacao(true);
    setErro('');
    try {
      setCotacao(await obterCotacaoDolar());
    } catch (error) {
      setEmReais(false);
      setErro(error.message || 'Não foi possível buscar a cotação do dólar.');
    } finally {
      setBuscandoCotacao(false);
    }
  }

  async function atualizarPrecos() {
    setAtualizando(true);
    setErro('');
    try {
      const ofertas = await atualizarPrecosMonitorados();
      if (ofertas === null) {
        setErro('Adicione jogos na aba Pesquisa antes de atualizar os preços.');
        return;
      }
      await carregarDados();
      if (emReais) {
        try {
          setCotacao(await obterCotacaoDolar());
        } catch {
          setErro('Preços atualizados, mas a cotação do dólar não. Os valores em reais usam a cotação anterior.');
        }
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível atualizar os preços. Tente novamente.');
    } finally {
      setAtualizando(false);
    }
  }

  async function removerJogo() {
    if (!jogoSelecionado) return;
    setRemovendo(true);
    setErro('');
    try {
      setJogosMonitorados(await removerJogoMonitorado(jogoSelecionado.gameId));
      setJogoSelecionado(null);
    } catch (error) {
      setErro(error.message || 'Não foi possível remover esse jogo.');
    } finally {
      setRemovendo(false);
    }
  }

  async function apagarTudo() {
    setLimpando(true);
    setErro('');
    try {
      await limparTudo();
      await carregarDados();
    } catch (error) {
      setErro(error.message || 'Não foi possível apagar os jogos e o histórico.');
    } finally {
      setLimpando(false);
    }
  }

  const ocupado = atualizando || limpando;
  const cotacaoExibida = emReais ? cotacao : null;
  const jogos = montarMeusJogos(jogosMonitorados, historico);
  const ultimaAtualizacao = historico[0]?.consultadoEm;
  const diasDoJogo = jogoSelecionado ? menoresPrecosPorDia(historico, jogoSelecionado.gameId) : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Cabecalho
          titulo="Meus jogos"
          subtitulo="Preço atual e menor valor registrado de cada jogo. Toque em um jogo para ver o histórico."
        />

        <Pressable
          accessibilityRole="button"
          disabled={ocupado}
          onPress={atualizarPrecos}
          style={({ pressed }) => [styles.updateButton, pressed && styles.pressed, ocupado && styles.disabled]}
        >
          {atualizando ? (
            <ActivityIndicator color={cores.onPrimary} />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color={cores.onPrimary} />
              <Text style={styles.updateButtonText}>Atualizar preços</Text>
            </>
          )}
        </Pressable>
        {ultimaAtualizacao ? (
          <Text style={styles.updateText}>Última atualização às {horaAtualizacao(ultimaAtualizacao)}</Text>
        ) : null}

        <View style={styles.currencyRow}>
          <Ionicons name="cash-outline" size={20} color={cores.muted} style={styles.currencyIcon} />
          <Text style={styles.currencyLabel}>Mostrar em reais (aproximado)</Text>
          {buscandoCotacao ? <ActivityIndicator color={cores.primary} style={styles.currencyLoader} /> : null}
          <Switch
            accessibilityLabel="Mostrar preços em reais aproximados"
            disabled={buscandoCotacao}
            onValueChange={alternarReais}
            thumbColor={cores.text}
            trackColor={{ false: cores.border, true: cores.primary }}
            value={emReais}
          />
        </View>
        {cotacaoExibida ? (
          <View style={styles.currencyNotice}>
            <Ionicons name="information-circle-outline" size={18} color={cores.warning} />
            <Text style={styles.currencyNoticeText}>
              Valores convertidos pela cotação do dólar ({reais(cotacaoExibida)}). Não correspondem aos preços das lojas no Brasil, que costumam ter preço regional.
            </Text>
          </View>
        ) : null}

        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        {carregando ? <ActivityIndicator color={cores.primary} style={styles.loader} /> : null}

        {!carregando && jogos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="game-controller-outline" size={40} color={cores.border} />
            <Text style={styles.emptyTitle}>Você ainda não tem jogos</Text>
            <Text style={styles.emptyText}>Adicione jogos na aba Pesquisa para começar a acompanhar os preços.</Text>
          </View>
        ) : null}

        {jogos.map(({ atual, menorPreco }) => (
          <JogoCard
            key={atual.gameId}
            jogo={atual}
            menorPreco={menorPreco}
            cotacao={cotacaoExibida}
            onPress={() => setJogoSelecionado(atual)}
          />
        ))}

        {jogos.length > 0 || historico.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            disabled={ocupado}
            onPress={apagarTudo}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed, ocupado && styles.disabled]}
          >
            <Text style={styles.clearButtonText}>
              {limpando ? 'Apagando...' : 'Apagar todos os jogos e histórico'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <HistoricoPrecosModal
        jogo={jogoSelecionado}
        dias={diasDoJogo}
        cotacao={cotacaoExibida}
        removendo={removendo}
        onClose={() => setJogoSelecionado(null)}
        onRemove={removerJogo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  content: { padding: 20, paddingBottom: 32 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
  updateButton: { flexDirection: 'row', minHeight: 52, borderRadius: 14, backgroundColor: cores.primary, alignItems: 'center', justifyContent: 'center' },
  updateButtonText: { color: cores.onPrimary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  updateText: { color: cores.muted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: cores.card, borderRadius: 14, borderWidth: 1, borderColor: cores.border, paddingHorizontal: 14, paddingVertical: 8, marginTop: 16, marginBottom: 8 },
  currencyIcon: { marginRight: 10 },
  currencyLabel: { flex: 1, color: cores.text, fontSize: 14, fontWeight: '600' },
  currencyLoader: { marginRight: 8 },
  currencyNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: cores.warningSuave, padding: 12, borderRadius: 12, marginBottom: 8 },
  currencyNoticeText: { flex: 1, color: cores.warning, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  error: { color: cores.danger, backgroundColor: cores.dangerSuave, padding: 12, borderRadius: 10, marginVertical: 8, overflow: 'hidden' },
  loader: { marginTop: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, marginTop: 16, backgroundColor: cores.card, borderRadius: 16, borderWidth: 1, borderColor: cores.border },
  emptyTitle: { color: cores.text, fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  emptyText: { color: cores.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  clearButton: { alignSelf: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 28 },
  clearButtonText: { color: cores.danger, fontSize: 13, fontWeight: '600' },
});
