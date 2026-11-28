# Monitora Jogos

App em Expo/React Native para acompanhar preços de jogos de PC usando a API da [CheapShark](https://apidocs.cheapshark.com/).

## Funcionalidades

- **Pesquisa**: busca jogos pelo nome e adiciona ou remove jogos da sua lista.
- **Meus jogos**: atualiza os preços dos jogos da lista, mostra o preço atual e o menor preço registrado, e abre o menor preço de cada dia ao tocar em um jogo.

## Estrutura

```
App.js           # entrada do app e navegação por abas (React Navigation)
screens/         # telas
components/      # componentes visuais reutilizáveis e cores
services/        # regras de negócio e formatação
integrations/    # acesso à API da CheapShark
repository/      # armazenamento local (AsyncStorage)
assets/          # ícones e imagens
```

## Como rodar

```bash
npm install
npx expo start
```
