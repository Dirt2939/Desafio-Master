const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const GOOGLE_AI_API_KEY =
  process.env.GOOGLE_AI_API_KEY || "COLOQUE_SUA_API_KEY_AQUI";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const ROOT_DIR = __dirname;
const CONFIG_FILE = path.join(ROOT_DIR, "config", "chatbot-rules.txt");
const DB_FILE = path.join(ROOT_DIR, "data", "chatbot-state.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const DIFFICULTY_VALUES = {
  facil: 1,
  medio: 0.5,
  dificil: 0.08,
};

const CLASSIFIER_SYSTEM_PROMPT = `
Voce e um classificador de intencao para o chatbot do site Playground JS.

Use as regras do site e o contexto abaixo apenas para entender o pedido do usuario.
Sua resposta DEVE ser somente um objeto JSON valido, sem markdown, sem texto antes, sem texto depois.

Schema obrigatorio:
{"eh_pergunta": boolean, "mudanca_dificuldade": "facil" | "medio" | "dificil" | "nao_detectado"}

Regras de decisao:
- "eh_pergunta" deve ser true quando o usuario fizer uma pergunta, pedir explicacao, pedir ajuda, perguntar como jogar, perguntar sobre regras, controles, jogos, saldo, cassino, arcade ou qualquer parte do site.
- "mudanca_dificuldade" deve ser "facil" quando o usuario pedir para deixar facil, mais facil, ganhar mais, aumentar facilidade, modo facil ou vantagem para o jogador.
- "mudanca_dificuldade" deve ser "medio" quando o usuario pedir medio, normal, balanceado, justo ou padrao.
- "mudanca_dificuldade" deve ser "dificil" quando o usuario pedir dificil, mais dificil, casa vencer mais, reduzir chance, modo hard ou impossivel.
- Se nao houver pedido de mudanca de dificuldade, use "nao_detectado".
- Mesmo que haja pergunta e mudanca de dificuldade na mesma frase, preencha os dois campos corretamente.
- Nunca invente chaves extras.
- Nunca responda em linguagem natural nessa etapa.
`.trim();

function readTextFile(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return fallback;
  }
}

function ensureDb() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          dificuldade: "medio",
          winDifficulty: DIFFICULTY_VALUES.medio,
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  }
}

function readDb() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (error) {
    return {
      dificuldade: "medio",
      winDifficulty: DIFFICULTY_VALUES.medio,
      updatedAt: new Date().toISOString(),
    };
  }
}

function updateDifficulty(dificuldade) {
  if (!Object.prototype.hasOwnProperty.call(DIFFICULTY_VALUES, dificuldade)) {
    throw new Error("Dificuldade invalida");
  }

  const state = {
    ...readDb(),
    dificuldade,
    winDifficulty: DIFFICULTY_VALUES[dificuldade],
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  return state;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "-")
    .replace(/&larr;/g, "<-")
    .replace(/&rarr;/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

function getSiteContext() {
  const readme = readTextFile(path.join(ROOT_DIR, "README.md"));
  const index = stripHtml(readTextFile(path.join(ROOT_DIR, "index.html")));
  const css = readTextFile(path.join(ROOT_DIR, "css", "style.css"));
  const colorVars = (css.match(/--[a-z-]+:\s*[^;]+;/g) || [])
    .slice(0, 24)
    .join("\n");

  return [
    "CONTEXTO DO SITE:",
    "Nome: Playground JS, com areas Arcade JS, Casino JS e Undertale.",
    "Resumo extraido do README:",
    readme.slice(0, 5000),
    "Texto extraido da pagina:",
    index.slice(0, 5000),
    "Identidade visual extraida do CSS:",
    colorVars,
  ].join("\n\n");
}

function getRules() {
  return readTextFile(
    CONFIG_FILE,
    "Responda em portugues do Brasil. Seja direto, util e fiel ao funcionamento do site.",
  );
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Payload muito grande"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON invalido"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function callGemini(systemPrompt, userText, options = {}) {
  if (!GOOGLE_AI_API_KEY || GOOGLE_AI_API_KEY === "COLOQUE_SUA_API_KEY_AQUI") {
    throw new Error("Configure GOOGLE_AI_API_KEY no ambiente ou em server.js.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL,
  )}:generateContent`;

  const body = {
    system_instruction: {
      role: "system",
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxOutputTokens ?? 600,
    },
  };

  if (options.json) {
    body.generationConfig.temperature = 0;
    body.generationConfig.response_mime_type = "application/json";
    body.generationConfig.maxOutputTokens = 120;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GOOGLE_AI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  console.log("STATUS:", response.status);
  console.log("RESPOSTA BRUTA:");
  console.log(responseText);
  let payload = null;
  try {
    payload = JSON.parse(responseText);
  } catch (error) {
    if (!response.ok) {
      throw new Error(
        `Erro na API do Google AI Studio: ${response.status} ${response.statusText} - ${responseText}`,
      );
    }
    throw new Error(
      `Resposta invalida da API do Google AI Studio: ${responseText}`,
    );
  }

  if (!response.ok) {
    const message =
      payload.error && payload.error.message
        ? payload.error.message
        : response.statusText;
    throw new Error(`Erro na API do Google AI Studio: ${message}`);
  }

  const text = extractTextFromPayload(payload);
  if (!text) {
    throw new Error(
      `A IA nao retornou texto. Payload: ${JSON.stringify(payload)}`,
    );
  }

  return text;
}

function extractTextFromPayload(payload) {
  try {
    // O caminho padrão da API REST do Gemini é:
    // candidates[0] -> content -> parts[0] -> text
    return payload.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    console.error(
      "Erro ao extrair texto. Estrutura recebida:",
      JSON.stringify(payload),
    );
    return "";
  }
}

function parseClassifierJson(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  const difficulty = ["facil", "medio", "dificil", "nao_detectado"].includes(
    parsed.mudanca_dificuldade,
  )
    ? parsed.mudanca_dificuldade
    : "nao_detectado";

  return {
    eh_pergunta: Boolean(parsed.eh_pergunta),
    mudanca_dificuldade: difficulty,
  };
}

async function handleChat(req, res) {
  const body = await parseJsonBody(req);
  const message = String(body.message || "").trim();

  if (!message) {
    sendJson(res, 400, { error: "Mensagem vazia." });
    return;
  }

  const rules = getRules();
  const siteContext = getSiteContext();
  const classifierPrompt = [
    CLASSIFIER_SYSTEM_PROMPT,
    "REGRAS DO SITE:",
    rules,
    siteContext,
  ].join("\n\n");
  const rawClassifier = await callGemini(classifierPrompt, message, {
    json: true,
  });
  const classification = parseClassifierJson(rawClassifier);

  if (classification.mudanca_dificuldade !== "nao_detectado") {
    const state = updateDifficulty(classification.mudanca_dificuldade);
    sendJson(res, 200, {
      message: `Facilidade alterada para ${classification.mudanca_dificuldade}`,
      classification,
      state,
    });
    return;
  }

  if (classification.eh_pergunta) {
    const answerPrompt = [
      "Voce e o assistente do site Playground JS.",
      "Responda em portugues do Brasil, em texto natural, com frases curtas.",
      "Use somente as regras e o contexto fornecidos. Se nao souber, diga que nao encontrou essa informacao no site.",
      "Nao altere dificuldade nesta etapa.",
      "REGRAS DO SITE:",
      rules,
      siteContext,
    ].join("\n\n");
    const answer = await callGemini(answerPrompt, message, {
      temperature: 0.35,
      maxOutputTokens: 500,
    });
    sendJson(res, 200, {
      message: answer,
      classification,
      state: readDb(),
    });
    return;
  }

  sendJson(res, 200, {
    message:
      "Posso responder perguntas sobre o Playground JS ou mudar a facilidade para facil, medio ou dificil.",
    classification,
    state: readDb(),
  });
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const safePath = path
    .normalize(decodeURIComponent(requestUrl.pathname))
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = path.join(ROOT_DIR, safePath || "index.html");

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Arquivo nao encontrado");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/state") {
      sendJson(res, 200, { state: readDb() });
      return;
    }

    if (req.method === "POST" && req.url === "/api/chat") {
      await handleChat(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Metodo nao permitido." });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Erro interno." });
  }
});

ensureDb();
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Usando modelo do Google AI: ${GEMINI_MODEL}`);
  console.log("Configure sua chave com: $env:GOOGLE_AI_API_KEY='SUA_CHAVE'");
});
