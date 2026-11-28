import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Cabecalho from '../components/Cabecalho';
import { cores } from '../components/cores';
import { buscarJogos } from '../integrations/CheapSharkApi';
import { adicionarJogoMonitorado, getJogosMonitorados } from '../repository/HistoricoRepository';
import { dinheiro } from '../services/formatacao';
import { registrarPrecoAtual } from '../services/PrecosService';

export default function PesquisaScreen() {
  const [erro, setErro] = useState('');
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [jogosMonitorados, setJogosMonitorados] = useState([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [adicionando, setAdicionando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const listaAlterada = useRef(0);

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
    setAdicionando(jogo.gameId);
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
    } finally {
      setAdicionando(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Cabecalho
          titulo="Pesquisa"
          subtitulo="Encontre jogos de PC e adicione à sua lista para acompanhar os preços em Meus jogos."
        />

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Ionicons name="search" size={18} color={cores.muted} style={styles.searchIcon} />
            <TextInput
              accessibilityLabel="Nome do jogo"
              onChangeText={setTermo}
              onSubmitEditing={pesquisarJogo}
              placeholder="Ex.: Hades"
              placeholderTextColor={cores.muted}
              returnKeyType="search"
              selectionColor={cores.primary}
              style={styles.searchInput}
              value={termo}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={pesquisando}
            onPress={pesquisarJogo}
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
          >
            {pesquisando
              ? <ActivityIndicator color={cores.onPrimary} size="small" />
              : <Text style={styles.searchButtonText}>Buscar</Text>}
          </Pressable>
        </View>

        {mensagem ? <Text accessibilityRole="status" style={styles.success}>{mensagem}</Text> : null}
        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}

        {resultados.length === 0 && !pesquisando && !erro ? (
          <View style={styles.emptyState}>
            <Ionicons name="game-controller-outline" size={40} color={cores.border} />
            <Text style={styles.emptyText}>Pesquise pelo nome de um jogo para ver o menor preço atual.</Text>
          </View>
        ) : null}

        {resultados.map((jogo) => {
          const monitorado = jogosMonitorados.some((item) => item.gameId === jogo.gameId);
          const carregando = adicionando === jogo.gameId;
          return (
            <View key={jogo.gameId} style={styles.resultCard}>
              {jogo.image ? <Image source={{ uri: jogo.image }} style={styles.image} /> : null}
              <View style={styles.gameInfo}>
                <Text numberOfLines={2} style={styles.gameTitle}>{jogo.title}</Text>
                <Text style={styles.salePrice}>{dinheiro(jogo.salePrice)}</Text>
                <Text numberOfLines={1} style={styles.store}>{jogo.store || 'Loja indisponível'}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={monitorado ? `${jogo.title} já está na lista` : `Adicionar ${jogo.title}`}
                disabled={monitorado || carregando}
                onPress={() => adicionarJogo(jogo)}
                style={({ pressed }) => [styles.addButton, monitorado && styles.addButtonDone, pressed && styles.pressed]}
              >
                {carregando
                  ? <ActivityIndicator color={cores.primary} size="small" />
                  : <Ionicons name={monitorado ? 'checkmark' : 'add'} size={20} color={monitorado ? cores.green : cores.primary} />}
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  content: { padding: 20, paddingBottom: 32 },
  searchRow: { flexDirection: 'row', marginBottom: 16 },
  searchField: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 50, borderRadius: 12, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.card, paddingHorizontal: 12, marginRight: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: cores.text, fontSize: 15, paddingVertical: 10 },
  searchButton: { minWidth: 86, borderRadius: 12, backgroundColor: cores.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  searchButtonText: { color: cores.onPrimary, fontWeight: '700', fontSize: 15 },
  pressed: { opacity: 0.8 },
  success: { color: cores.green, backgroundColor: cores.greenSuave, padding: 12, borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
  error: { color: cores.danger, backgroundColor: cores.dangerSuave, padding: 12, borderRadius: 10, marginBottom: 12, overflow: 'hidden' },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyText: { color: cores.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 12 },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: cores.card, borderRadius: 14, borderWidth: 1, borderColor: cores.border, padding: 12, marginBottom: 10 },
  image: { width: 72, height: 54, borderRadius: 8, backgroundColor: cores.cardElevado, marginRight: 12 },
  gameInfo: { flex: 1, minWidth: 0 },
  gameTitle: { color: cores.text, fontSize: 15, fontWeight: '600' },
  salePrice: { color: cores.green, fontWeight: '700', fontSize: 15, marginTop: 4 },
  store: { color: cores.muted, fontSize: 12, marginTop: 2 },
  addButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: cores.primarySuave, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  addButtonDone: { backgroundColor: cores.greenSuave },
});
