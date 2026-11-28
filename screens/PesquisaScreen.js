import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { cores } from '../components/cores';
import { buscarJogos } from '../integrations/CheapSharkApi';
import {
  adicionarJogoMonitorado,
  getJogosMonitorados,
  removerJogoMonitorado,
} from '../repository/HistoricoRepository';
import { dinheiro } from '../services/formatacao';
import { registrarPrecoAtual } from '../services/PrecosService';

export default function PesquisaScreen() {
  const [erro, setErro] = useState('');
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [jogosMonitorados, setJogosMonitorados] = useState([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const listaAlterada = useRef(0);
  const listaJogos = Array.isArray(jogosMonitorados)
    ? jogosMonitorados
    : jogosMonitorados && typeof jogosMonitorados === 'object'
      ? Object.values(jogosMonitorados).filter((jogo) => jogo && typeof jogo === 'object' && jogo.gameId)
      : [];

  useFocusEffect(useCallback(() => {
    let ativo = true;
    const versaoLista = listaAlterada.current;

    getJogosMonitorados()
      .then((jogos) => {
        if (!ativo || listaAlterada.current !== versaoLista) return;
        setJogosMonitorados(jogos);
      })
      .catch((error) => {
        if (ativo) setErro(error.message || 'Não foi possível carregar seus jogos.');
      });

    return () => {
      ativo = false;
    };
  }, []));

  async function pesquisarJogo() {
    const busca = termo.trim();
    setMensagem('');
    if (!busca) {
      setErro('Digite o nome de um jogo para pesquisar.');
      return;
    }

    setPesquisando(true);
    setErro('');
    try {
      const jogos = await buscarJogos(busca);
      setResultados(jogos);
      if (jogos.length === 0) setErro('Nenhum jogo encontrado. Tente outro nome.');
    } catch (error) {
      setErro(error.message || 'Não foi possível pesquisar jogos agora.');
    } finally {
      setPesquisando(false);
    }
  }

  async function adicionarJogo(jogo) {
    setErro('');
    try {
      const listaAtualizada = await adicionarJogoMonitorado(jogo);
      listaAlterada.current += 1;
      setJogosMonitorados(listaAtualizada);
      setMensagem(`${jogo.title} foi adicionado. Buscando o menor preço atual...`);

      try {
        const oferta = await registrarPrecoAtual(jogo.gameId);
        if (oferta) {
          setMensagem(`${jogo.title} foi adicionado e o preço atual foi salvo em Meus jogos.`);
        } else {
          setMensagem(`${jogo.title} foi adicionado, mas não há ofertas atuais para registrar.`);
        }
      } catch (error) {
        setErro(`Jogo adicionado, mas não foi possível registrar o preço: ${error.message}`);
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível adicionar esse jogo.');
    }
  }

  async function removerJogo(gameId) {
    try {
      const listaAtualizada = await removerJogoMonitorado(gameId);
      listaAlterada.current += 1;
      setJogosMonitorados(listaAtualizada);
      setMensagem('Jogo removido da sua lista.');
    } catch (error) {
      setErro(error.message || 'Não foi possível remover esse jogo.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MONITOR DE JOGOS</Text>
        <Text style={styles.title}>Pesquisa</Text>
        <Text style={styles.subtitle}>Encontre jogos de PC e adicione à sua lista para acompanhar os preços em Meus jogos.</Text>

        <Text style={styles.sectionTitle}>Adicionar um jogo</Text>
        {mensagem ? <Text accessibilityRole="status" style={styles.success}>{mensagem}</Text> : null}
        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        <View style={styles.searchRow}>
          <TextInput
            accessibilityLabel="Nome do jogo"
            onChangeText={setTermo}
            onSubmitEditing={pesquisarJogo}
            placeholder="Ex.: Hades"
            placeholderTextColor={cores.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={termo}
          />
          <Pressable
            accessibilityRole="button"
            disabled={pesquisando}
            onPress={pesquisarJogo}
            style={({ pressed }) => [styles.searchButton, pressed && styles.buttonPressed]}
          >
            {pesquisando
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.searchButtonText}>Buscar</Text>}
          </Pressable>
        </View>
        {resultados.map((jogo) => {
          const monitorado = listaJogos.some((item) => item.gameId === jogo.gameId);
          return (
            <View key={jogo.gameId} style={styles.resultCard}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{jogo.title}</Text>
                <Text style={styles.salePrice}>{dinheiro(jogo.salePrice)}</Text>
                <Text style={styles.store}>
                  {jogo.store ? `Loja: ${jogo.store}` : 'Loja indisponível'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={monitorado}
                onPress={() => adicionarJogo(jogo)}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>{monitorado ? 'Adicionado' : 'Adicionar'}</Text>
              </Pressable>
            </View>
          );
        })}
        {listaJogos.length > 0 ? (
          <View style={styles.watchedSection}>
            <Text style={styles.sectionTitle}>Meus jogos ({listaJogos.length})</Text>
            {listaJogos.map((jogo) => (
              <View key={jogo.gameId} style={styles.watchedRow}>
                <Text numberOfLines={1} style={styles.watchedTitle}>{jogo.title}</Text>
                <Pressable accessibilityRole="button" onPress={() => removerJogo(jogo.gameId)}>
                  <Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: cores.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginTop: 8 },
  title: { color: cores.text, fontSize: 30, fontWeight: '700', marginTop: 6 },
  subtitle: { color: cores.muted, fontSize: 15, marginTop: 6, marginBottom: 20 },
  sectionTitle: { color: cores.text, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  searchInput: { flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.card, paddingHorizontal: 12, color: cores.text, marginRight: 8 },
  searchButton: { minWidth: 82, borderRadius: 10, backgroundColor: cores.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  searchButtonText: { color: '#FFFFFF', fontWeight: '700' },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: cores.card, borderRadius: 12, borderWidth: 1, borderColor: cores.border, padding: 12, marginBottom: 8 },
  addButton: { backgroundColor: '#EEEAFE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, marginLeft: 8 },
  addButtonText: { color: cores.primary, fontSize: 12, fontWeight: '700' },
  success: { color: cores.green, backgroundColor: '#E8F6EE', padding: 10, borderRadius: 9, marginBottom: 10 },
  watchedSection: { marginBottom: 16 },
  watchedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: cores.card, borderBottomWidth: 1, borderBottomColor: cores.border, padding: 12 },
  watchedTitle: { flex: 1, color: cores.text, fontSize: 14, marginRight: 12 },
  removeText: { color: cores.danger, fontSize: 12, fontWeight: '600' },
  buttonPressed: { opacity: 0.85 },
  error: { color: cores.danger, backgroundColor: '#FEECEB', padding: 12, borderRadius: 10, marginTop: 14 },
  gameInfo: { flex: 1, justifyContent: 'center' },
  gameTitle: { color: cores.text, fontSize: 15, fontWeight: '600' },
  store: { color: cores.muted, fontSize: 12, marginTop: 3 },
  salePrice: { color: cores.green, fontWeight: '700', fontSize: 15, marginRight: 8 },
});
