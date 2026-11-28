import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from './cores';

export default function Cabecalho({ titulo, subtitulo }) {
  return (
    <View style={styles.container}>
      <View style={styles.marca}>
        <View style={styles.logo}>
          <Ionicons name="game-controller" size={14} color={cores.onPrimary} />
        </View>
        <Text style={styles.nomeApp}>MONITORA JOGOS</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 20 },
  marca: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 24, height: 24, borderRadius: 7, backgroundColor: cores.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  nomeApp: { color: cores.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  titulo: { color: cores.text, fontSize: 30, fontWeight: '800', marginTop: 12 },
  subtitulo: { color: cores.muted, fontSize: 15, lineHeight: 21, marginTop: 6 },
});
