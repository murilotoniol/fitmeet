# Fitmeet Mobile — Bootcamp SysMap

Este é o aplicativo mobile do Fitmeet, desenvolvido utilizando **React Native** com **TypeScript**. Ele se integra ao backend em Spring Boot para fornecer a melhor experiência mobile para descoberta, criação, gerenciamento e participação de atividades esportivas e de lazer.

## Tecnologias e Dependências Principais

- **React Native & TypeScript**: Estrutura principal da aplicação.
- **React Navigation (Stack)**: Navegação fluida entre telas.
- **React Native Maps**: Integração de mapas interativos para definir e exibir pontos de encontro.
- **React Native Geolocation**: Obtenção automática da geolocalização do usuário para centrar o mapa na criação de atividades.
- **React Native Keychain**: Armazenamento seguro de credenciais de login e tokens JWT.
- **Phosphor Icons**: Pacote moderno de ícones de interface.
- **React Native Image Picker**: Upload e seleção de avatar do perfil e imagens para atividades.
- **Axios**: Cliente HTTP para chamadas das APIs REST do backend.
- **React Native Toast Message**: Alertas visuais e notificações elegantes de sucesso/erro.

## Pré-requisitos

Certifique-se de possuir instalado em seu ambiente:
1. Node.js (versão 22 LTS recomendada)
2. Ambiente de desenvolvimento React Native configurado para Android (Android SDK / Emulador) ou iOS (Xcode / Simulador)
3. Backend rodando localmente (porta `8080`)

## Como Executar o Projeto

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicialize o Bundler (Metro)**:
   ```bash
   npm run start
   ```

3. **Execute o App no Dispositivo/Emulador**:
   - **Android**:
     ```bash
     npm run android
     ```
   - **iOS**:
     ```bash
     npm run ios
     ```

## Qualidade de Código e Testes

O projeto conta com scripts dedicados para validação técnica e testes de integridade:

- **TypeScript (Verificação estática)**:
  ```bash
  npx tsc --noEmit
  ```
- **Linter (ESLint)**:
  ```bash
  npm run lint
  ```
- **Testes Automatizados (Jest)**:
  ```bash
  npm run test
  ```
