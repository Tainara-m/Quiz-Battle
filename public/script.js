// script.js
// Este é o JavaScript que roda DENTRO DO NAVEGADOR (front-end).
// Ele cuida da interface do quiz e conversa com o back-end (server.js)
// usando fetch() para salvar e consultar o ranking.

// ---------------------------------------------------------------
// 1. Banco de perguntas (fica só na memória do navegador)
// ---------------------------------------------------------------
const PERGUNTAS = [
  {
    pergunta: "Qual linguagem roda diretamente no navegador?",
    alternativas: ["Java", "Python", "JavaScript", "C++"],
    correta: 2,
  },
  {
    pergunta: "O que o HTML descreve em uma página web?",
    alternativas: ["A aparência visual", "A estrutura do conteúdo", "A lógica do servidor", "O banco de dados"],
    correta: 1,
  },
  {
    pergunta: "Qual dessas linguagens é usada para estilizar páginas?",
    alternativas: ["CSS", "SQL", "HTTP", "JSON"],
    correta: 0,
  },
  {
    pergunta: "O que significa a sigla API?",
    alternativas: [
      "Aplicativo Interno de Programação",
      "Interface de Programação de Aplicações",
      "Arquivo de Programação Interno",
      "Análise de Processos de Internet",
    ],
    correta: 1,
  },
  {
    pergunta: "Qual método HTTP é usado para ENVIAR dados novos ao servidor?",
    alternativas: ["GET", "POST", "DELETE", "HEAD"],
    correta: 1,
  },
  {
    pergunta: "Qual método HTTP é usado para CONSULTAR dados no servidor?",
    alternativas: ["POST", "PUT", "GET", "PATCH"],
    correta: 2,
  },
  {
    pergunta: "No projeto Quiz Battle, quem executa o server.js?",
    alternativas: ["O navegador", "O Node.js", "O CSS", "O HTML"],
    correta: 1,
  },
  {
    pergunta: "Por que o ranking precisa ficar salvo em um arquivo, e não só em uma variável JavaScript?",
    alternativas: [
      "Porque variáveis são mais lentas",
      "Porque uma variável desaparece quando a página fecha",
      "Porque arquivos JSON rodam mais rápido",
      "Não há diferença",
    ],
    correta: 1,
  },
  {
    pergunta: "Qual função transforma um objeto JavaScript em texto JSON?",
    alternativas: ["JSON.parse()", "JSON.stringify()", "fetch()", "JSON.toText()"],
    correta: 1,
  },
  {
    pergunta: "O que a rota GET /ranking devolve para o navegador?",
    alternativas: [
      "A lista de pontuações salvas",
      "O código-fonte do server.js",
      "Uma nova pergunta do quiz",
      "O arquivo style.css",
    ],
    correta: 0,
  },
];

// ---------------------------------------------------------------
// 2. Estado do jogo (o que muda enquanto o jogador joga)
// ---------------------------------------------------------------
const estado = {
  nome: "",
  indiceAtual: 0,
  pontos: 0,
  respondeuAtual: false,
};

// ---------------------------------------------------------------
// 3. Referências aos elementos da tela
// ---------------------------------------------------------------
const telas = document.querySelectorAll("[data-tela]");

const inputNome = document.getElementById("input-nome");
const erroNome = document.getElementById("erro-nome");
const botaoIniciar = document.getElementById("botao-iniciar");
const botaoVerRankingInicio = document.getElementById("botao-ver-ranking-inicio");

const progressoBarra = document.getElementById("progresso-barra");
const progressoTexto = document.getElementById("progresso-texto");
const quizJogador = document.getElementById("quiz-jogador");
const quizPontos = document.getElementById("quiz-pontos");
const perguntaTexto = document.getElementById("pergunta-texto");
const alternativasContainer = document.getElementById("alternativas");
const botaoProxima = document.getElementById("botao-proxima");

const resultadoJogador = document.getElementById("resultado-jogador");
const resultadoPontos = document.getElementById("resultado-pontos");
const resultadoLegenda = document.getElementById("resultado-legenda");
const botaoSalvar = document.getElementById("botao-salvar");
const erroSalvar = document.getElementById("erro-salvar");
const botaoJogarDeNovo = document.getElementById("botao-jogar-de-novo");

const rankingLista = document.getElementById("ranking-lista");
const rankingVazio = document.getElementById("ranking-vazio");
const botaoVoltarInicio = document.getElementById("botao-voltar-inicio");

// ---------------------------------------------------------------
// 4. Navegação entre telas
// ---------------------------------------------------------------
function mostrarTela(idTela) {
  telas.forEach((tela) => {
    tela.hidden = tela.id !== idTela;
  });
}

// ---------------------------------------------------------------
// 5. Fluxo do quiz
// ---------------------------------------------------------------
function iniciarQuiz() {
  const nomeDigitado = inputNome.value.trim();

  if (!nomeDigitado) {
    erroNome.textContent = "Digite um nome antes de começar.";
    return;
  }

  erroNome.textContent = "";
  estado.nome = nomeDigitado.slice(0, 20);
  estado.indiceAtual = 0;
  estado.pontos = 0;

  quizJogador.textContent = estado.nome;
  mostrarTela("tela-quiz");
  renderizarPergunta();
}

function renderizarPergunta() {
  const pergunta = PERGUNTAS[estado.indiceAtual];
  estado.respondeuAtual = false;

  // Atualiza barra e texto de progresso
  const percentual = ((estado.indiceAtual + 1) / PERGUNTAS.length) * 100;
  progressoBarra.style.width = percentual + "%";
  progressoTexto.textContent = `Pergunta ${estado.indiceAtual + 1} de ${PERGUNTAS.length}`;
  quizPontos.textContent = `${estado.pontos} pts`;

  perguntaTexto.textContent = pergunta.pergunta;
  alternativasContainer.innerHTML = "";
  botaoProxima.hidden = true;

  pergunta.alternativas.forEach((texto, indice) => {
    const botao = document.createElement("button");
    botao.className = "alternativa";
    botao.textContent = texto;
    botao.addEventListener("click", () => responder(indice));
    alternativasContainer.appendChild(botao);
  });
}

function responder(indiceEscolhido) {
  if (estado.respondeuAtual) return; // impede clicar duas vezes
  estado.respondeuAtual = true;

  const pergunta = PERGUNTAS[estado.indiceAtual];
  const botoes = alternativasContainer.querySelectorAll(".alternativa");

  botoes.forEach((botao, indice) => {
    botao.disabled = true;
    if (indice === pergunta.correta) {
      botao.classList.add("correta");
    } else if (indice === indiceEscolhido) {
      botao.classList.add("errada");
    }
  });

  if (indiceEscolhido === pergunta.correta) {
    estado.pontos += 10;
    quizPontos.textContent = `${estado.pontos} pts`;
  }

  const ultimaPergunta = estado.indiceAtual === PERGUNTAS.length - 1;
  botaoProxima.hidden = false;
  botaoProxima.textContent = ultimaPergunta ? "Ver resultado" : "Próxima pergunta";
}

function avancar() {
  const ultimaPergunta = estado.indiceAtual === PERGUNTAS.length - 1;

  if (ultimaPergunta) {
    mostrarResultado();
    return;
  }

  estado.indiceAtual += 1;
  renderizarPergunta();
}

function mostrarResultado() {
  resultadoJogador.textContent = estado.nome;
  resultadoPontos.textContent = estado.pontos;

  const acertos = estado.pontos / 10;
  resultadoLegenda.textContent = `${acertos} de ${PERGUNTAS.length} perguntas corretas.`;

  botaoSalvar.disabled = false;
  botaoSalvar.textContent = "Salvar pontuação";
  erroSalvar.textContent = "";

  mostrarTela("tela-resultado");
}

// ---------------------------------------------------------------
// 6. Comunicação com o BACK-END (fetch)
// ---------------------------------------------------------------

// Envia a pontuação final para o servidor salvar em ranking.json.
async function salvarPontuacao() {
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";
  erroSalvar.textContent = "";

  try {
    const resposta = await fetch("/ranking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: estado.nome,
        pontos: estado.pontos,
      }),
    });

    if (!resposta.ok) {
      throw new Error("O servidor recusou os dados.");
    }

    botaoSalvar.textContent = "Pontuação salva!";
    await abrirRanking();
  } catch (erro) {
    erroSalvar.textContent = "Não foi possível salvar. O servidor está rodando?";
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar pontuação";
  }
}

// Busca o ranking atualizado no servidor e desenha a lista na tela.
async function abrirRanking() {
  mostrarTela("tela-ranking");
  rankingLista.innerHTML = "";
  rankingVazio.hidden = true;

  try {
    const resposta = await fetch("/ranking");
    const ranking = await resposta.json();

    if (ranking.length === 0) {
      rankingVazio.hidden = false;
      return;
    }

    ranking.forEach((jogador, indice) => {
      const item = document.createElement("li");
      item.className = "ranking-item" + (indice === 0 ? " ranking-item--top1" : "");
      item.innerHTML = `
        <span class="ranking-item__posicao">${indice + 1}º</span>
        <span class="ranking-item__nome">${escaparTexto(jogador.nome)}</span>
        <span class="ranking-item__pontos">${jogador.pontos} pts</span>
      `;
      rankingLista.appendChild(item);
    });
  } catch (erro) {
    rankingVazio.hidden = false;
    rankingVazio.textContent = "Não foi possível carregar o ranking. O servidor está rodando?";
  }
}

// Evita que um nome de jogador com HTML dentro quebre a página.
function escaparTexto(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------------------------------------------------------------
// 7. Ligações dos botões (event listeners)
// ---------------------------------------------------------------
botaoIniciar.addEventListener("click", iniciarQuiz);
inputNome.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") iniciarQuiz();
});

botaoProxima.addEventListener("click", avancar);
botaoSalvar.addEventListener("click", salvarPontuacao);

botaoVerRankingInicio.addEventListener("click", abrirRanking);
botaoVoltarInicio.addEventListener("click", () => mostrarTela("tela-nome"));

botaoJogarDeNovo.addEventListener("click", () => {
  inputNome.value = "";
  mostrarTela("tela-nome");
});
