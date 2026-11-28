import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { dinheiro } from '../services/formatacao';
import { cores } from './cores';

export default function JogoCard({ jogo, menorPreco, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre o menor preço de cada dia"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {jogo.image ? <Image source={{ uri: jogo.image }} style={styles.image} /> : null}
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{jogo.title}</Text>
        <Text style={styles.store}>Loja: {jogo.store}</Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Preço atual</Text>
            <Text style={styles.salePrice}>{dinheiro(jogo.salePrice)}</Text>
          </View>
          <View style={styles.lowPrice}>
            <Text style={styles.priceLabel}>Menor registrado</Text>
            <Text style={styles.lowestPrice}>{menorPreco === null ? '-' : dinheiro(menorPreco)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: cores.card, borderRadius: 14, borderWidth: 1, borderColor: cores.border, padding: 14, marginTop: 12 },
  cardPressed: { opacity: 0.75 },
  image: { width: 110, height: 82, borderRadius: 9, backgroundColor: cores.border, marginRight: 14 },
  info: { flex: 1, justifyContent: 'center', minWidth: 0 },
  title: { color: cores.text, fontSize: 16, fontWeight: '600' },
  store: { color: cores.muted, fontSize: 12, marginTop: 3 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  priceLabel: { color: cores.muted, fontSize: 11, marginBottom: 2 },
  salePrice: { color: cores.green, fontSize: 14, fontWeight: '700' },
  lowPrice: { marginLeft: 24 },
  lowestPrice: { color: cores.primary, fontSize: 14, fontWeight: '700' },
});
