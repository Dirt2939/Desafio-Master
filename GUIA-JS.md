# Guia de Estudo do JavaScript do Playground JS

Este material foi feito para servir como guia de estudo do projeto. A ideia é explicar **como o JavaScript organiza o site**, **como o servidor funciona**, **como a dificuldade do cassino é aplicada** e **quais funções sustentam a navegação, os jogos e a interação por teclado**.

---

## 1. Visão Geral da Arquitetura

O projeto é dividido em quatro partes principais:

- `index.html`: estrutura das telas e dos elementos.
- `css/style.css`: aparência, layout e animações visuais.
- `js/script.js`: lógica da aplicação, jogos, controles, HUDs, sons e canvas.
- `server.js`: servidor Node.js para servir arquivos, guardar dificuldade e fornecer contexto ao chat.

Na prática:

- O HTML cria os elementos.
- O CSS define como tudo parece.
- O JavaScript transforma a página em uma aplicação interativa.
- O Node.js adiciona persistência simples e endpoints de apoio.

---

## 2. Como o `server.js` Funciona

O arquivo `server.js` cria um servidor HTTP com Node.js:

```js
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
```

### O que ele faz

1. Define a porta do servidor:

```js
const PORT = Number(process.env.PORT || 3000);
```

Se nada for informado, o projeto roda na porta `3000`.

2. Define arquivos importantes:

```js
const CONFIG_FILE = path.join(ROOT_DIR, "config", "chatbot-rules.txt");
const DB_FILE = path.join(ROOT_DIR, "data", "chatbot-state.json");
```

Esses arquivos guardam:

- regras do chatbot;
- estado da dificuldade do cassino.

3. Define tipos MIME:

```js
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};
```

Isso permite que o navegador entenda corretamente o tipo de cada arquivo servido.

---

## 3. Persistência da Dificuldade

O servidor mantém um pequeno “banco” em JSON:

```json
{
  "dificuldade": "medio",
  "winDifficulty": 0.5,
  "updatedAt": "..."
}
```

Esse arquivo fica em:

- `data/chatbot-state.json`

### Funções principais

#### `ensureDb()`

Garante que o arquivo de estado exista.

Se não existir, cria com valores padrão:

- dificuldade média;
- `winDifficulty = 0.5`.

#### `readDb()`

Lê o arquivo JSON e devolve o estado atual.

#### `updateDifficulty(dificuldade)`

Atualiza o arquivo com a nova dificuldade.

O servidor trabalha com este mapa:

```js
const DIFFICULTY_VALUES = {
  facil: 1,
  medio: 0.5,
  dificil: 0.08,
};
```

Interpretação:

- `1`: forte vantagem para o jogador;
- `0.5`: equilíbrio;
- `0.08`: forte vantagem para a casa.

---

## 4. Endpoints do Servidor

O servidor expõe algumas rotas:

### `GET /api/state`

Retorna o estado atual da dificuldade.

Uso:

```js
fetch("/api/state")
```

### `POST /api/difficulty`

Recebe algo como:

```json
{
  "dificuldade": "facil"
}
```

E salva o novo estado.

### `GET /api/chat-context`

Entrega ao chat:

- regras do chatbot;
- trechos do README;
- texto extraído do HTML;
- variáveis visuais do CSS.

Isso ajuda o assistente do site a responder com base no próprio projeto.

---

## 5. O Nome Correto da Variável do Cassino

Você citou `win_difficult`, mas no código a variável real é:

```js
var WIN_DIFFICULTY = 1;
```

Ela é central para alterar a “sorte” do jogador no cassino.

---

## 6. Como `WIN_DIFFICULTY` Afeta o Cassino

O valor de `WIN_DIFFICULTY` interfere em três jogos:

- Caça-Níquel;
- Roleta;
- Crash.

---

## 7. A Função `calcWinChance(base)`

No cassino existe esta função:

```js
function calcWinChance(base) {
  if (WIN_DIFFICULTY <= 0) return 0;
  if (WIN_DIFFICULTY >= 1) return 1;
  return base + (WIN_DIFFICULTY - 0.5) * 2 * (1 - base) * 0.8;
}
```

### Ideia da função

Ela recebe uma chance base e ajusta conforme a dificuldade.

Exemplo na roleta:

```js
if (Math.random() < calcWinChance(0.46)) {
  // escolhe um resultado favorável ao jogador
}
```

Se a dificuldade estiver:

- fácil: a chance sobe;
- média: fica mais próxima do valor original;
- difícil: a chance cai.

### Como explicar no guia

Você pode dizer:

> “A função `calcWinChance` transforma uma chance normal em uma chance dinâmica. Em vez de o jogo usar sempre a mesma probabilidade, ele adapta o resultado ao nível de dificuldade selecionado.”

---

## 8. Efeito da Dificuldade em Cada Jogo do Cassino

### Caça-Níquel

A função `slotRandom()` muda os pesos dos símbolos.

Em dificuldade maior para o jogador:

- símbolos raros ficam mais prováveis;
- o jackpot aparece com mais frequência.

Em dificuldade difícil:

- símbolos comuns ganham mais peso;
- símbolos valiosos aparecem menos.

Ou seja, o jogo não altera só “ganha ou perde”; ele altera a distribuição dos resultados.

---

### Roleta

A roleta usa:

```js
Math.random() < calcWinChance(0.46)
```

Se o teste for verdadeiro, o número sorteado vem de um grupo favorável à cor escolhida pelo jogador.

Se for falso, ele vem do grupo desfavorável.

Isso deixa o comportamento da dificuldade muito claro de explicar.

---

### Crash

O Crash usa:

```js
function genCrashPt() {
  var mn = 1.05 + WIN_DIFFICULTY * 0.8,
      mx = 1.5 + WIN_DIFFICULTY * 25;
  return parseFloat((mn + Math.random() * (mx - mn)).toFixed(2));
}
```

Essa função decide em qual multiplicador a rodada vai “quebrar”.

Quanto maior `WIN_DIFFICULTY`:

- maior tende a ser o multiplicador final;
- o jogador ganha mais tempo para sacar.

Quanto menor:

- o crash acontece cedo;
- o risco aumenta.

---

## 9. Como a Dificuldade Sai do Chat e Chega ao Cassino

O fluxo é:

1. O usuário pede no chat:
   - “deixa o cassino fácil”;
   - “modo difícil”;
   - “quero dificuldade média”.

2. O chatbot classifica o pedido.

3. O JavaScript chama:

```js
saveDifficulty(level)
```

4. Essa função faz:

```js
fetch("/api/difficulty", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ dificuldade: level }),
})
```

5. O servidor salva a dificuldade.

6. O front-end sincroniza a nova configuração com:

```js
window.applyCasinoDifficulty(...)
```

### Como explicar em uma frase

> “O chat não muda o jogo diretamente. Ele identifica a intenção do usuário, envia a nova dificuldade ao servidor, e o front-end aplica esse estado no cassino.”

---

## 10. Sistema de Telas: `TELA` e `irPara()`

O `script.js` guarda os IDs das telas em um objeto:

```js
var TELA = {
  HUB: "hub",
  ARCADE: "arcade-hub",
  ARCADE_GAMES: "arcade-games-hub",
  CASINO: "casino",
  SLOTS: "slots",
  ROULETTE: "roulette-game",
  CRASH: "crash-game",
  UT_HUB: "undertale-hub",
  UT_BATTLE: "undertale-battle",
};
```

Depois usa:

```js
var telaAtiva = TELA.HUB;
```

### Função `irPara(id)`

Essa é uma das funções mais importantes do projeto.

Ela:

1. remove `.active` de todas as telas;
2. ativa a nova tela;
3. atualiza `telaAtiva`;
4. reposiciona focos de teclado;
5. inicia ou encerra jogos conforme necessário.

Exemplos:

- ao entrar em Geometry Race, chama `geoEnter()`;
- ao sair, chama `geoStop()`;
- ao entrar no CupShock, chama `cyberEnter()`;
- ao sair, chama `cyberStop()`.

### Como explicar

> “A navegação do site é feita como uma máquina de estados simples. O valor de `telaAtiva` diz onde o usuário está, e `irPara()` faz a troca de contexto.”

---

## 11. O Listener Global de Teclado

Uma das partes mais importantes do projeto é:

```js
document.addEventListener("keydown", function (e) {
  ...
}, true);
```

Esse listener decide o que fazer com cada tecla com base em:

- `e.key`;
- `telaAtiva`;
- estado do jogo atual.

### Exemplo de raciocínio

Se o usuário está no hub:

- `ArrowLeft` muda o foco para a esquerda;
- `ArrowRight` muda o foco para a direita;
- `Enter` seleciona o card.

Se está na roleta:

- setas trocam o botão em foco;
- `Enter` ativa o botão atual.

Se está no Undertale:

- o evento é enviado para `utBattleKey(k)`.

---

## 12. Funções de Foco e Seleção

Há um padrão que se repete no projeto:

- `pgSetFoco()`
- `arcadeGamesSetFoco()`
- `casinoSetFoco()`
- `jkpSetFoco()`
- `ccSetFoco()`
- `rltSetFoco()`
- `crashSetFoco()`

Essas funções:

1. removem a classe de foco anterior;
2. calculam o novo índice;
3. adicionam a classe visual de foco;
4. atualizam a variável de índice correspondente.

Depois entram as funções de seleção:

- `pgSelect()`
- `arcadeGamesSelect()`
- `casinoSelect()`

### Padrão arquitetural

Esse padrão separa:

- navegação;
- foco visual;
- ação de confirmar.

É uma boa prática porque evita misturar toda a lógica em um bloco gigante.

---

## 13. Exemplo Completo: Playground Hub

No hub inicial:

```js
function pgSetFoco(idx) {
  ...
}

function pgSelect() {
  ...
}
```

No teclado:

```js
if (telaAtiva === TELA.HUB) {
  if (k === "ArrowLeft") pgSetFoco(pgIdx - 1);
  else if (k === "ArrowRight") pgSetFoco(pgIdx + 1);
  else if (k === "Enter" || k === " ") pgSelect();
}
```

### O que isso mostra no guia

- existe um índice atual;
- existe um foco visual;
- existe uma ação de confirmar;
- as teclas reutilizam a mesma lógica do clique.

---

## 14. Proteções no Teclado

O listener também evita alguns problemas:

```js
if (e.repeat) return;
```

Isso impede que segurar uma tecla dispare dezenas de ações não desejadas.

Também há o `guard`, que evita duplicações no mesmo ciclo.

E há tratamento especial para inputs:

- quando o usuário está digitando em campos;
- quando usa `F5` ou `F12`;
- quando abre o chat com `I`.

---

## 15. Como Funciona o Chat com a Tecla `I`

Quando o usuário pressiona:

```js
i ou I
```

O código chama:

```js
window.openAiChat()
```

Esse comportamento é interceptado antes da navegação normal, para o chat funcionar de qualquer tela.

---

## 16. Uso de Canvas nos Jogos

O projeto usa Canvas em várias partes:

- confete;
- Geometry Race;
- CupShock;
- roleta;
- Crash;
- Undertale.

### Estrutura comum de um jogo em canvas

1. estado do jogo em um objeto;
2. função de atualização;
3. função de desenho;
4. loop com `requestAnimationFrame`.

Exemplo geral:

```js
function loop(now) {
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
```

---

## 17. Geometry Race: Loop e Controle

O Geometry Race possui:

- dois jogadores;
- obstáculos gerados;
- distância acumulada;
- vencedor definido por sobrevivência.

Ele usa:

- `geoEnter()`;
- `geoRestart()`;
- `geoLoop()`;
- `geoUpdate(dt)`;
- `geoDraw()`.

Também existe um `keyup` separado para soltar as teclas de salto.

---

## 18. CupShock: Estados da Boss Fight

O CupShock é um bom exemplo de jogo baseado em estado.

Ele usa:

- `intro`;
- `dialog`;
- `transform`;
- `fight`;
- `win`;
- `lose`.

O estado atual fica em:

```js
cyberState.status
```

### Fluxo

1. jogador entra na arena;
2. aproxima-se do boss;
3. inicia diálogo;
4. boss se transforma;
5. começa a luta;
6. vence ou perde.

### Funções centrais

- `cyberEnter()`
- `cyberRestart()`
- `cyberConfirm()`
- `cyberStartDialog()`
- `cyberStartTransform()`
- `cyberStartFight()`
- `cyberWin()`
- `cyberLose()`

Isso mostra bem a diferença entre:

- navegação de tela;
- progressão interna do jogo.

---

## 19. Como os Controles do CupShock Funcionam

A função:

```js
cyberHandleKey(k, down)
```

transforma teclas físicas em ações internas:

- esquerda;
- direita;
- pulo;
- tiro;
- dash;
- especial.

Exemplo:

```js
if (k === "ArrowLeft" || k === "a" || k === "A") key = "left";
```

### Vantagem desse modelo

O jogo deixa de depender diretamente da tecla original e passa a trabalhar com ações semânticas:

- `left`;
- `shoot`;
- `dash`.

Isso melhora organização e facilita mudanças futuras.

---

## 20. Colisões e Dano

O CupShock possui funções específicas para colisão:

- `cyberRectHit(a, b)`
- `cyberCircleHitRect(c, r)`

E funções de dano:

- `cyberDamagePlayer(amount)`
- `cyberDamageBoss(amount)`

Essas funções concentram efeitos importantes:

- redução de HP;
- invencibilidade temporária;
- knockback;
- particles;
- sons;
- transição para vitória ou derrota.

---

## 21. Sons com Web Audio API

O projeto não depende só de arquivos de áudio.

Ele gera sons com:

```js
AudioContext
OscillatorNode
GainNode
```

Funções como:

- `somOk()`
- `somErro()`
- `somNav()`
- `somEsc()`
- `somMoeda()`

encapsulam padrões sonoros reutilizáveis.

### Como explicar

> “Em vez de tocar um `.mp3` pronto, o projeto sintetiza sons rápidos em tempo real com a Web Audio API.”

---

## 22. Funções Que Vale a Pena Citar no Guia

### Navegação e telas

- `irPara(id)`
- `pgSetFoco(idx)`
- `arcadeGamesSetFoco(idx)`
- `casinoSetFoco(idx)`

### Cassino

- `calcWinChance(base)`
- `slotRandom()`
- `genCrashPt()`
- `atualizarSaldo(delta)`

### Chat e dificuldade

- `loadState()`
- `saveDifficulty(level)`
- `syncDifficulty(state)`

### CupShock

- `cyberConfirm()`
- `cyberHandleKey(k, down)`
- `cyberDamagePlayer(amount)`
- `cyberDamageBoss(amount)`

---

## 23. Como Explicar o Projeto em 1 Minuto

Um resumo possível:

> “O Playground JS é uma aplicação front-end com múltiplos jogos organizados por hubs. O JavaScript controla a navegação entre telas, o foco por teclado, os loops de animação em canvas, os sons e a lógica de cada jogo. O `server.js` complementa isso servindo os arquivos, salvando a dificuldade do cassino em JSON e oferecendo APIs para o chat. A variável `WIN_DIFFICULTY` conecta essa dificuldade aos jogos de cassino, alterando probabilidades e comportamento dos resultados.”

---

## 24. Perguntas Que Podem Cair Durante o Estudo

### “Por que usar `telaAtiva`?”

Porque o site tem muitas áreas e cada uma responde às teclas de um jeito diferente. `telaAtiva` centraliza esse contexto.

### “Por que usar `requestAnimationFrame`?”

Porque ele sincroniza a renderização com a taxa de atualização do navegador e é mais adequado para animações de jogo.

### “Por que guardar dificuldade em JSON?”

Porque é uma persistência simples, suficiente para o escopo acadêmico do projeto e fácil de demonstrar.

### “Qual é a diferença entre front-end e server nesse projeto?”

O front-end executa os jogos e interações. O server entrega arquivos e gerencia dados auxiliares como estado e contexto do chat.

### “A dificuldade muda somente texto?”

Não. Ela altera matematicamente as probabilidades dos jogos do cassino.

---

## 25. Observações Úteis para Estudo

- O projeto usa bastante o padrão “estado + renderização”.
- O código reutiliza muitas funções de foco visual.
- A lógica de teclado é centralizada em um único listener grande, mas distribuída por blocos conforme a tela ativa.
- O cassino tem uma mecânica interessante para explicar probabilidade e pesos.
- O CupShock é bom para explicar máquina de estados, colisão, HUD e loop de jogo.

---

## 26. Arquivos Importantes para Revisar no Guia

- `server.js`
- `js/script.js`
- `data/chatbot-state.json`
- `config/chatbot-rules.txt`
- `README.md`

---

## 27. Sugestão de Ordem para Estudar

1. Leia o sistema de telas e `irPara()`.
2. Leia o listener global de `keydown`.
3. Entenda `WIN_DIFFICULTY` e o cassino.
4. Veja o fluxo do chat alterando a dificuldade.
5. Estude um jogo simples, como Cara ou Coroa.
6. Estude um jogo complexo, como CupShock ou Geometry Race.
