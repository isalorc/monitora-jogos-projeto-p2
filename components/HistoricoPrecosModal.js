import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dataCurta, precoFormatado } from '../services/formatacao';
import { cores } from './cores';

export default function HistoricoPrecosModal({ jogo, dias, cotacao, removendo, onClose, onRemove }) {
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
          <View style={styles.handle} />
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
              <Ionicons name="close" size={20} color={cores.text} />
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
                      {precoFormatado(dia.preco, cotacao)}
                    </Text>
                  </View>
                </View>
              );
            })}

            <Pressable
              accessibilityRole="button"
              disabled={removendo}
              onPress={onRemove}
              style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed, removendo && styles.removeButtonDisabled]}
            >
              <Ionicons name="trash-outline" size={16} color={cores.danger} />
              <Text style={styles.removeButtonText}>{removendo ? 'Removendo...' : 'Remover da lista'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: cores.overlay },
  sheet: { backgroundColor: cores.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: cores.border, maxHeight: '75%', paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: cores.border, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: cores.border },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { color: cores.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: cores.text, fontSize: 20, fontWeight: '800', marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.cardElevado, marginLeft: 12 },
  closeButtonPressed: { backgroundColor: cores.border },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyText: { color: cores.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 16 },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: cores.border },
  dayDate: { color: cores.text, fontSize: 15, textTransform: 'capitalize' },
  dayPriceWrap: { flexDirection: 'row', alignItems: 'center' },
  dayBadge: { color: cores.primary, backgroundColor: cores.primarySuave, fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8, overflow: 'hidden' },
  dayPrice: { color: cores.text, fontSize: 15, fontWeight: '600' },
  dayPriceLowest: { color: cores.primary, fontWeight: '800' },
  removeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: cores.dangerSuave, paddingVertical: 12, marginTop: 20 },
  removeButtonPressed: { opacity: 0.8 },
  removeButtonDisabled: { opacity: 0.6 },
  removeButtonText: { color: cores.danger, fontSize: 14, fontWeight: '700', marginLeft: 6 },
});
