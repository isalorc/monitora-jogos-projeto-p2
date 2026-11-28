# Monitora Jogos

App em Expo/React Native para acompanhar preços de jogos de PC usando a API da [CheapShark](https://apidocs.cheapshark.com/) e a cotação do dólar da [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas).

## Funcionalidades

- **Pesquisa**: busca jogos pelo nome e adiciona jogos à sua lista.
- **Meus jogos**: atualiza os preços dos jogos da lista, mostra o preço atual e o menor preço registrado, e abre o menor preço de cada dia ao tocar em um jogo, onde também é possível removê-lo da lista.
- **Valores em reais**: um interruptor em Meus jogos converte os preços para reais pela cotação do dólar do dia. Os valores são aproximados e não correspondem aos preços das lojas no Brasil, que usam preço regional.

## Estrutura

```
App.js           # entrada do app e navegação por abas (React Navigation)
screens/         # telas
components/      # componentes visuais reutilizáveis e cores
services/        # regras de negócio e formatação
integrations/    # acesso às APIs da CheapShark e de cotação
repository/      # armazenamento local (AsyncStorage)
assets/          # ícones e imagens
```

## Como rodar

```bash
npm install
npx expo start
```
