# CheckIn App — Apresentação Final

App de check-in por geolocalização usando `expo-location`.

## Bounty resolvido

> "O cliente precisava garantir que o usuário só pudesse fazer check-in se estivesse fisicamente no local correto."

## Como rodar

### Pré-requisitos
- Node.js 18+
- Expo Go instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o projeto
npx expo start
```

Escaneie o QR Code com o Expo Go.

## Estrutura do projeto

```
checkin-app/
├── app/
│   ├── _layout.tsx       # Roteamento (expo-router)
│   └── index.tsx         # Tela principal
├── constants/
│   ├── locations.ts      # Locais-alvo e raio de tolerância
│   └── haversine.ts      # Fórmula de distância GPS
└── app.json              # Configuração do Expo
```

## Como funciona

1. Usuário abre o app e vê o local-alvo
2. Toca em **Fazer Check-in**
3. App solicita permissão de localização (`expo-location`)
4. Obtém coordenadas GPS com alta precisão
5. Calcula a distância usando a **fórmula de Haversine**
6. Compara com o raio permitido do local
7. Exibe resultado: ✅ liberado ou ❌ bloqueado

## Trocar o local-alvo

Edite `constants/locations.ts` e altere `ACTIVE_LOCATION`:

```ts
export const ACTIVE_LOCATION = LOCATIONS.orla_atalaia; // por exemplo
```

## API utilizada

- [`expo-location`](https://docs.expo.dev/versions/latest/sdk/location/) — obter permissão e coordenadas GPS
  - `requestForegroundPermissionsAsync()` — solicita permissão
  - `getCurrentPositionAsync({ accuracy: High })` — retorna lat/lon
