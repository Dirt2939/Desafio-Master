# Playground JS | Arcade JS e Casino JS

**Colégio ULBRA São Lucas - Curso Técnico em Informática**  
_Projeto desenvolvido para o módulo de Lógica e Programação Web._

---

## Sobre o Projeto

O **Playground JS** é uma aplicação web interativa criada com HTML, CSS e JavaScript puro. O projeto
funciona como um hub de minijogos, dividido em duas áreas principais:

- **Arcade JS:** jogos clássicos e rápidos, com foco em lógica, sorte e placar.
- **Casino JS:** jogos com saldo, apostas fictícias, multiplicadores e animações.

O objetivo principal é aplicar conceitos fundamentais de desenvolvimento Front-End, como manipulação
do DOM, eventos de teclado e mouse, controle de estados, funções, condicionais, sorteios com
`Math.random()` e atualização dinâmica da interface.

---

## Funcionalidades

- Tela inicial com seleção entre **Arcade JS** e **Casino JS**.
- Navegação por teclado.
- Feedback visual para seleção, foco e resultados.
- Efeitos sonoros gerados com a Web Audio API.
- Animação de confete para vitórias.
- Interface em estilo arcade neon.
- Placar dinâmico nos jogos competitivos.
- Sistema de saldo fictício nos jogos de cassino.
- Modal de verificação de idade antes de acessar a área Casino JS.
- Layout responsivo para diferentes tamanhos de tela.

---

## Jogos Disponíveis

### Arcade JS

**Jokenpô**

- O jogador escolhe entre pedra, papel ou tesoura.
- O computador faz uma escolha aleatória.
- O sistema compara as jogadas e informa vitória, derrota ou empate.
- O placar de vitórias, derrotas e empates é atualizado na tela.

**Batalha de Dados**

- O jogador e o computador lançam dados.
- Vence quem tirar o maior número.
- O jogo registra rodadas, placar e empates.

**Cara ou Coroa**

- O jogador escolhe um lado da moeda.
- O sistema sorteia o resultado.
- A moeda recebe animação e o placar é atualizado.

### Casino JS

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
- É necessário sacar antes do multiplicador "crashar".
- O jogo possui opção de auto-saque e histórico de multiplicadores.

---

## Tecnologias Utilizadas

- **HTML5:** estrutura da página, seções dos jogos, SVGs e elementos interativos.
- **CSS3:** layout, responsividade, animações, variáveis visuais e estilo arcade.
- **JavaScript:** lógica dos jogos, manipulação do DOM, eventos e controle de estados.
- **Canvas API:** animações de confete, roleta e gráfico do jogo Crash.
- **Web Audio API:** efeitos sonoros gerados diretamente no navegador.
- **Google Fonts:** fontes com estilo retrô e arcade.

---

## Estrutura do Projeto

```text
DESAFIOFINAL/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── script.js
```

### Responsabilidade dos Arquivos

- `index.html`: contém a estrutura HTML das telas, hubs, jogos, modais, SVGs e canvases.
- `css/style.css`: concentra todo o visual do projeto, incluindo cores, layout, animações e
  responsividade.
- `js/script.js`: concentra a lógica de navegação, eventos, jogos, placares, apostas, sons e
  animações.
- `modelo.md`: arquivo de referência usado como base para documentação.
- `README.md`: documentação completa do projeto.

---

## Como Executar o Projeto Localmente

1. Abra a pasta do projeto:

```bash
cd Academico/web/DESAFIOFINAL
```

2. Abra o arquivo `index.html` no navegador.

Também é possível executar com uma extensão como **Live Server** no VS Code, se desejar testar o
projeto por um servidor local.

---

## Como Jogar

1. Acesse a tela inicial do **Playground JS**.
2. Escolha entre **Arcade JS** ou **Casino JS**.
3. No Arcade JS, insira a moeda para liberar os jogos.
4. No Casino JS, confirme a idade e insira o ticket para liberar os jogos.
5. Use mouse ou teclado para navegar e confirmar as escolhas.
6. Acompanhe o placar, o saldo e as mensagens de resultado exibidas na tela.

---

## Controles

- **Seta para esquerda:** navegar para a opção anterior.
- **Seta para direita:** navegar para a próxima opção.
- **Seta para cima / baixo:** ajustar valores em campos específicos.
- **Enter:** confirmar seleção, jogar, girar ou acionar botão em foco.
- **Esc:** voltar para a tela anterior.
- **Mouse:** clicar nos cards, botões e opções dos jogos.

---

## Conceitos de Programação Aplicados

- Declaração e chamada de funções.
- Variáveis de controle de estado.
- Objetos para armazenar placares e configurações.
- Arrays para opções de jogos, símbolos e resultados.
- Estruturas condicionais para definir vencedores.
- Sorteios com `Math.random()`.
- Manipulação de classes CSS com `classList`.
- Manipulação de conteúdo com `textContent` e `innerHTML`.
- Eventos com `addEventListener`.
- Temporizadores com `setTimeout` e `setInterval`.
- Animações com `requestAnimationFrame`.

---

## Organização do Código

O projeto foi organizado para separar responsabilidades:

- A marcação principal fica no HTML.
- A aparência fica em um arquivo CSS dedicado.
- O comportamento fica em um arquivo JavaScript dedicado.

O JavaScript está dividido por blocos comentados, facilitando a localização de cada parte do
sistema:

- Áudio e efeitos.
- Sistema de telas.
- Hub principal.
- Arcade JS.
- Jogos do Arcade.
- Casino JS.
- Jogos do Casino.
- Controles globais de teclado.

Essa organização torna o código mais fácil de ler, manter e apresentar.
