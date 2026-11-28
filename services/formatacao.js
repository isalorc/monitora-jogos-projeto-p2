export function dinheiro(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'USD' });
}

export function reais(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function precoFormatado(valorEmDolar, cotacao) {
  if (!cotacao) return dinheiro(valorEmDolar);
  return `≈ ${reais(Number(valorEmDolar) * cotacao)}`;
}

export function chaveDia(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

export function dataCurta(valor) {
  return new Date(valor).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function horaAtualizacao(valor) {
  return new Date(valor).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
