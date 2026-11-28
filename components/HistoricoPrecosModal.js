import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dataCurta, dinheiro } from '../services/formatacao';
import { cores } from './cores';

export default function HistoricoPrecosModal({ jogo, dias, onClose }) {
  const menorDeTodos = dias.length ? Math.min(...dias.map((dia) => dia.preco)) : null;

  return (
    <Modal
      visible={jogo !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>MENOR PREÇO POR DIA</Text>
              <Text numberOfLines={2} style={styles.title}>{jogo?.title}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {dias.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum preço registrado para este jogo.</Text>
            ) : null}
            {dias.map((dia) => {
              const ehMenor = dia.preco === menorDeTodos;
              return (
                <View key={dia.chave} style={styles.dayRow}>
                  <Text style={styles.dayDate}>{dataCurta(dia.data)}</Text>
                  <View style={styles.dayPriceWrap}>
                    {ehMenor && dias.length > 1 ? (
                      <Text style={styles.dayBadge}>MENOR</Text>
                    ) : null}
                    <Text style={[styles.dayPrice, ehMenor && styles.dayPriceLowest]}>
                      {dinheiro(dia.preco)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  sheet: { backgroundColor: cores.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', paddingTop: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: cores.border },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { color: cores.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginTop: 8 },
  title: { color: cores.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.background, marginLeft: 12 },
  closeButtonPressed: { backgroundColor: cores.border },
  closeButtonText: { color: cores.text, fontSize: 16, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyText: { color: cores.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: cores.border },
  dayDate: { color: cores.text, fontSize: 15, textTransform: 'capitalize' },
  dayPriceWrap: { flexDirection: 'row', alignItems: 'center' },
  dayBadge: { color: cores.primary, backgroundColor: '#ECEAFB', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8, overflow: 'hidden' },
  dayPrice: { color: cores.text, fontSize: 15, fontWeight: '600' },
  dayPriceLowest: { color: cores.primary, fontWeight: '700' },
});
