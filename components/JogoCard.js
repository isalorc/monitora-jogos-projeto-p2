import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { precoFormatado } from '../services/formatacao';
import { cores } from './cores';

export default function JogoCard({ jogo, menorPreco, cotacao, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre o menor preço de cada dia"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {jogo.image ? <Image source={{ uri: jogo.image }} style={styles.image} /> : null}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{jogo.title}</Text>
          <Ionicons name="chevron-forward" size={18} color={cores.muted} />
        </View>
        {jogo.store ? <Text numberOfLines={1} style={styles.store}>{jogo.store}</Text> : null}
        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Atual</Text>
            <Text style={styles.salePrice}>{precoFormatado(jogo.salePrice, cotacao)}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Menor registrado</Text>
            <Text style={styles.lowestPrice}>{menorPreco === null ? '-' : precoFormatado(menorPreco, cotacao)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: cores.card, borderRadius: 16, borderWidth: 1, borderColor: cores.border, padding: 12, marginTop: 12 },
  cardPressed: { backgroundColor: cores.cardElevado },
  image: { width: 96, height: 72, borderRadius: 10, backgroundColor: cores.cardElevado, marginRight: 12 },
  info: { flex: 1, justifyContent: 'center', minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, color: cores.text, fontSize: 16, fontWeight: '700', marginRight: 4 },
  store: { color: cores.muted, fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  priceBox: { marginRight: 20 },
  priceLabel: { color: cores.muted, fontSize: 11, marginBottom: 2 },
  salePrice: { color: cores.green, fontSize: 15, fontWeight: '700' },
  lowestPrice: { color: cores.primary, fontSize: 15, fontWeight: '700' },
});
