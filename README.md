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

---

## Limitações do expo-location

### 1. Permissão pode ser negada pelo usuário
O app depende totalmente da autorização concedida pelo sistema operacional. Se o usuário negar o acesso à localização, não é possível obter as coordenadas por nenhum meio alternativo — o único caminho é orientar o usuário a habilitar manualmente nas configurações do celular.

### 2. Precisão variável dependendo do dispositivo e ambiente
Mesmo configurando `accuracy: High`, a precisão real pode variar entre 5m e 50m ou mais, dependendo da qualidade do GPS do dispositivo, da força do sinal de satélite e das condições do ambiente. Isso impacta diretamente na definição do raio de tolerância — razão pela qual o projeto usa 200m em vez de valores menores.

### 3. Degradação em ambientes fechados
Dentro de prédios, shoppings ou locais cobertos, o sinal GPS deteriora significativamente. O `expo-location` não possui fallback automático para posicionamento via Wi-Fi ou Bluetooth beacons, retornando apenas uma posição menos precisa ou demorando mais para adquirir o sinal.

### 4. Lentidão na primeira leitura (cold start)
A função `getCurrentPositionAsync` pode levar vários segundos na primeira chamada enquanto o dispositivo adquire o sinal dos satélites GPS — especialmente se o app não foi usado recentemente. Isso tornou necessário implementar um estado de loading explícito na interface.

### 5. Não funciona em emuladores/simuladores
Em ambientes de desenvolvimento virtuais (Android Emulator ou iOS Simulator), a localização é completamente simulada com coordenadas falsas. Não é possível testar o comportamento real de "fora do raio" sem um dispositivo físico.

### 6. Sem suporte para web
O `expo-location` funciona apenas em iOS e Android. Para uma versão web do app, seria necessário usar a API nativa do navegador (`navigator.geolocation`), que tem comportamento e limitações distintas.

### 7. Snapshot único — sem monitoramento contínuo
Este app utiliza `getCurrentPositionAsync`, que captura a posição apenas no momento do check-in. Caso fosse necessário verificar se o usuário permanece no local após o check-in, seria preciso usar `watchPositionAsync` — que, por sua vez, consome significativamente mais bateria do dispositivo.