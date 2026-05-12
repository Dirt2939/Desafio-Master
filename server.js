const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT || 3000);
const GROK_MODEL = "x-ai/grok-4-1-fast";

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

function handleChatContext(res) {
  sendJson(res, 200, {
    model: GROK_MODEL,
    rules: getRules(),
    siteContext: getSiteContext(),
  });
}

async function handleDifficulty(req, res) {
  const body = await parseJsonBody(req);
  const dificuldade = String(body.dificuldade || body.difficulty || "")
    .trim()
    .toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(DIFFICULTY_VALUES, dificuldade)) {
    sendJson(res, 400, { error: "Dificuldade invalida." });
    return;
  }

  const state = updateDifficulty(dificuldade);
  sendJson(res, 200, {
    message: `Facilidade alterada para ${dificuldade}`,
    state,
  });
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const safePath = path
    .normalize(decodeURIComponent(requestUrl.pathname))
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = path.join(ROOT_DIR, safePath || "index.html");
  const rootPath = ROOT_DIR.endsWith(path.sep) ? ROOT_DIR : ROOT_DIR + path.sep;

  if (filePath !== ROOT_DIR && !filePath.startsWith(rootPath)) {
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

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && requestUrl.pathname === "/api/state") {
      sendJson(res, 200, { state: readDb() });
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/chat-context") {
      handleChatContext(res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/difficulty") {
      await handleDifficulty(req, res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/chat") {
      sendJson(res, 410, {
        error:
          "O chatbot agora usa Grok via Puter.js diretamente no navegador.",
      });
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
const io = new Server(server);

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
