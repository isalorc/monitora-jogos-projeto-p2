import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import HistoricoPrecosModal from '../components/HistoricoPrecosModal';
import JogoCard from '../components/JogoCard';
import { cores } from '../components/cores';
import { getHistorico, limparTudo } from '../repository/HistoricoRepository';
import { horaAtualizacao } from '../services/formatacao';
import {
  atualizarPrecosMonitorados,
  menoresPrecosPorDia,
  resumirJogos,
} from '../services/PrecosService';

export default function MeusJogosScreen() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [limpando, setLimpando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const atualizarHistorico = useCallback(async () => {
    setErro('');
    try {
      setHistorico(await getHistorico());
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o histórico.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    atualizarHistorico();
  }, [atualizarHistorico]));

  async function atualizarPrecos() {
    setAtualizando(true);
    setErro('');
    try {
      const ofertas = await atualizarPrecosMonitorados();
      if (ofertas === null) {
        setErro('Adicione jogos na aba Pesquisa antes de atualizar os preços.');
        return;
      }
      await atualizarHistorico();
    } catch (error) {
      setErro(error.message || 'Não foi possível atualizar os preços. Tente novamente.');
    } finally {
      setAtualizando(false);
    }
  }

  async function apagarTudo() {
    setLimpando(true);
    setErro('');
    try {
      await limparTudo();
      await atualizarHistorico();
    } catch (error) {
      setErro(error.message || 'Não foi possível apagar os jogos e o histórico.');
    } finally {
      setLimpando(false);
    }
  }

  const ocupado = atualizando || limpando;
  const jogos = resumirJogos(historico);
  const ultimaAtualizacao = historico[0]?.consultadoEm;
  const diasDoJogo = jogoSelecionado ? menoresPrecosPorDia(historico, jogoSelecionado.gameId) : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SEUS REGISTROS</Text>
        <Text style={styles.title}>Meus jogos</Text>
        <Text style={styles.subtitle}>Preço atual e menor valor registrado de cada jogo. Toque em um jogo para ver o menor preço de cada dia.</Text>
        <Pressable
          accessibilityRole="button"
          disabled={ocupado}
          onPress={atualizarPrecos}
          style={({ pressed }) => [styles.updateButton, pressed && styles.updateButtonPressed, ocupado && styles.updateButtonDisabled]}
        >
          {atualizando
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.updateButtonText}>Atualizar preços</Text>}
        </Pressable>

        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        {carregando ? <ActivityIndicator color={cores.primary} style={styles.loader} /> : null}
        {ultimaAtualizacao ? (
          <Text style={styles.updateText}>Atualizado às {horaAtualizacao(ultimaAtualizacao)}</Text>
        ) : null}

        {!carregando && historico.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Você ainda não tem jogos</Text>
            <Text style={styles.emptyText}>Adicione jogos na aba Pesquisa para começar a acompanhar os preços.</Text>
          </View>
        ) : null}

        {jogos.map(({ atual, menorPreco }) => (
          <JogoCard
            key={atual.gameId}
            jogo={atual}
            menorPreco={menorPreco}
            onPress={() => setJogoSelecionado(atual)}
          />
        ))}

        {historico.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            disabled={ocupado}
            onPress={apagarTudo}
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed, ocupado && styles.clearButtonDisabled]}
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
        onClose={() => setJogoSelecionado(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: cores.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginTop: 8 },
  title: { color: cores.text, fontSize: 30, fontWeight: '700', marginTop: 6 },
  subtitle: { color: cores.muted, fontSize: 15, marginTop: 6, marginBottom: 20 },
  updateButton: { minHeight: 50, borderRadius: 12, backgroundColor: cores.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  updateButtonPressed: { opacity: 0.85 },
  updateButtonDisabled: { opacity: 0.7 },
  updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  clearButton: { alignSelf: 'center', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10, marginTop: 28 },
  clearButtonPressed: { backgroundColor: '#FEECEB' },
  clearButtonDisabled: { opacity: 0.6 },
  clearButtonText: { color: cores.danger, fontSize: 13, fontWeight: '600' },
  loader: { marginTop: 24 },
  error: { color: cores.danger, backgroundColor: '#FEECEB', padding: 12, borderRadius: 10, marginVertical: 8 },
  emptyState: { alignItems: 'center', padding: 24, marginTop: 16, backgroundColor: cores.card, borderRadius: 14, borderWidth: 1, borderColor: cores.border },
  emptyTitle: { color: cores.text, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptyText: { color: cores.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  updateText: { color: cores.muted, fontSize: 12, textAlign: 'center', marginBottom: 14 },
});
