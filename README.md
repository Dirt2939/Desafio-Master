# Playground JS

**Colégio ULBRA São Lucas - Curso Técnico em Informática**  
_Projeto desenvolvido para o módulo de Lógica e Programação Web._

---

## Sobre o Projeto

O **Playground JS** é uma aplicação web interativa feita com HTML, CSS e JavaScript puro. O projeto funciona como um hub de minijogos com visual arcade neon, navegação por teclado e mouse, efeitos sonoros, animações em canvas e controle de estado no front-end.

A tela inicial organiza a experiência em três hubs:

- **Clássicos:** jogos rápidos de sorte, escolha e placar.
- **Arcade:** jogos de ação, reflexo, sobrevivência e boss fight.
- **Cassino:** jogos com saldo fictício, apostas simuladas e verificação de idade.

O objetivo principal é aplicar conceitos fundamentais de desenvolvimento front-end, como manipulação do DOM, eventos, funções, objetos, arrays, condicionais, temporizadores, `requestAnimationFrame`, Canvas API e Web Audio API.

---

## Funcionalidades

- Tela inicial com hubs **Clássicos**, **Arcade** e **Cassino**.
- Cards com descrições curtas para cada hub e jogo.
- Navegação por teclado e mouse.
- Feedback visual de foco, seleção, vitória, derrota e estados de bloqueio.
- Efeitos sonoros gerados com Web Audio API.
- Animações e jogos renderizados com Canvas API.
- Visual retrofuturista com grid, brilho neon, cards, HUDs e painéis temáticos.
- Layout responsivo.
- Chat de ajuda acessível pela tecla `I`.
- Modal de verificação de idade antes de acessar o Cassino.
- Sistema de saldo fictício nos jogos de cassino.

---

## Jogos Disponíveis

### Clássicos

**Jokenpô**

- O jogador escolhe entre pedra, papel ou tesoura.
- O computador faz uma escolha aleatória.
- O sistema compara as jogadas e atualiza o placar de vitórias, derrotas e empates.

**Batalha de Dados**

- O jogador e o computador lançam dados.
- Vence quem tirar o maior número.
- O jogo registra rodadas, placar e empates.

**Cara ou Coroa**

- O jogador escolhe um lado da moeda.
- O sistema sorteia o resultado.
- A moeda recebe animação e o placar é atualizado.

### Arcade

**Undertale**

- Hub de bosses com combates inspirados em Undertale.
- Inclui movimentação em arena, ataques, ações, spare/kill e estados de progresso.
- O boss final fica bloqueado até os requisitos serem cumpridos.

**Geometry Race**

- Corrida split-screen inspirada em Geometry Dash.
- Dois jogadores competem no mesmo mapa.
- Quem sobreviver por mais tempo vence.
- Inclui contagem regressiva, contador de metros e modos como cube, ship, gravity e wave.

**CupShock**

- Boss fight lateral inspirada na leitura de padrões de jogos como Cuphead e Undertale.
- O jogador se aproxima do Sentinela Nexus, passa por uma introdução curta e entra na luta.
- A luta usa fases progressivas, tiros, pulo, dash direcional, especial e padrões de ataque desviáveis.
- Os ataques incluem lasers rasantes, orbes em arco, drones, impactos verticais e investida do núcleo.
- A dificuldade aumenta por fase, mas os golpes possuem ritmo e aviso visual para o jogador reagir.
- Ao vencer, o jogador desativa o núcleo e volta para o hub Arcade com `Enter`.

### Cassino

**Caça-Níquel**

- O jogador usa saldo fictício para girar os rolos.
- O resultado é calculado a partir das combinações sorteadas.
- Prêmios variam conforme os símbolos obtidos.

**Roleta**

- O jogador escolhe uma cor e define o valor da aposta.
- A roleta gira e sorteia um número.
- O resultado atualiza saldo, histórico e mensagem da rodada.

**Crash**

- O jogador aposta em um multiplicador crescente.
- É necessário sacar antes do multiplicador quebrar.
- O jogo possui auto-saque e histórico de multiplicadores.

---

## Controles

### Navegação Geral

- **Seta para esquerda / direita:** navegar entre cards e opções.
- **Seta para cima / baixo:** mover em jogos ou ajustar controles específicos.
- **Enter:** confirmar seleção, iniciar rodada, avançar diálogo ou reiniciar quando aplicável.
- **Espaço:** ação principal em alguns jogos.
- **Esc:** voltar para a tela anterior.
- **F5:** recarregar a página.
- **I:** abrir o chat de ajuda.
- **Mouse:** clicar em cards, botões e opções.

### Jogos Específicos

- **Undertale:** setas para navegar/mover, `Enter` para selecionar e `Esc` para voltar.
- **Geometry Race:** `W` ou `Espaço` para o Player 1; `Seta para cima` para o Player 2.
- **CupShock:** `A/D` ou setas para mover; `W`, `Seta para cima` ou `Espaço` para pular; `J/Z` para atirar; `Shift` para dash direcional; `K/X` para especial; `Enter` para avançar diálogo, voltar após vencer ou reiniciar após perder.

---

## Tecnologias Utilizadas

- **HTML5:** estrutura das telas, hubs, jogos, modais, SVGs e canvases.
- **CSS3:** layout, responsividade, animações, variáveis visuais e estilo neon.
- **JavaScript:** regras dos jogos, navegação, eventos, estado, placares, sons e animações.
- **Canvas API:** renderização de jogos e efeitos visuais.
- **Web Audio API:** efeitos sonoros gerados no navegador.
- **Socket.IO:** dependência disponível no projeto para recursos com servidor.
- **Node.js:** servidor local opcional via `server.js`.

---

## Estrutura do Projeto

```text
Desafio-Master/
|-- config/
|-- css/
|   `-- style.css
|-- data/
|-- js/
|   `-- script.js
|-- node_modules/
|-- index.html
|-- package.json
|-- package-lock.json
|-- README.md
`-- server.js
```

### Responsabilidade dos Arquivos

- `index.html`: estrutura HTML das telas, hubs, jogos, modais, SVGs e canvases.
- `css/style.css`: visual do projeto, incluindo layout, cores, responsividade e animações.
- `js/script.js`: lógica de navegação, jogos, placares, controles, sons e renderização em canvas.
- `server.js`: servidor Node.js opcional.
- `config/`: arquivos de configuração do projeto.
- `data/`: dados auxiliares usados pela aplicação.
- `README.md`: documentação do projeto.

---

## Como Executar

### Abrindo direto no navegador

1. Abra a pasta do projeto.
2. Abra o arquivo `index.html` no navegador.

### Usando o servidor local

1. Instale as dependências, se necessário:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

3. Acesse o endereço mostrado no terminal ou acesse https://dirt2939.github.io/Desafio-Master/.

---

## Como Jogar

1. Acesse a tela inicial do **Playground JS**.
2. Escolha um hub: **Clássicos**, **Arcade** ou **Cassino**.
3. Em **Clássicos**, insira a moeda para liberar os jogos.
4. Em **Arcade**, escolha entre Undertale, Geometry Race ou CupShock.
5. Em **Cassino**, confirme a idade e insira o ticket.
6. Use teclado ou mouse para jogar.

---

## Conceitos de Programação Aplicados

- Declaração e chamada de funções.
- Variáveis de controle de estado.
- Objetos para placares, configurações e entidades dos jogos.
- Arrays para opções, mapas, obstáculos, históricos e resultados.
- Estruturas condicionais para definir regras, estados e vencedores.
- Sorteios e geração dinâmica com `Math.random()`.
- Manipulação de classes CSS com `classList`.
- Manipulação de conteúdo com `textContent` e `innerHTML`.
- Eventos com `addEventListener`.
- Temporizadores com `setTimeout` e `setInterval`.
- Loops de animação com `requestAnimationFrame`.
- Renderização 2D com Canvas API.
- Efeitos sonoros com Web Audio API.

- - Apresentação de principais conceitos em:[ https://www.canva.com/design/DAHJeeXVn-s/QdmbhgV8kYZv5kT0r53w5A/edit](https://canva.link/l6rtkru1izvh2o2)

---

## Organização do Código

O projeto separa responsabilidades de forma simples:

- A estrutura fica em `index.html`.
- A aparência fica em `css/style.css`.
- O comportamento fica em `js/script.js`.

O JavaScript é dividido em blocos comentados para facilitar manutenção:

- Áudio e efeitos.
- Sistema de telas.
- Hub principal.
- Hub Clássicos.
- Hub Arcade.
- Jogos Clássicos.
- Geometry Race.
- CupShock.
- Cassino e seus jogos.
- Undertale.
- Chat de ajuda.

Essa organização facilita leitura, apresentação e evolução do projeto.
