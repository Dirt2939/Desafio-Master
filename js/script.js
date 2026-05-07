(function () {
  "use strict";

  /*
   * Playground JS - script principal.
   * Responsavel por navegacao entre telas, regras dos jogos, placares,
   * efeitos sonoros, animacoes em canvas e controles de teclado/mouse.
   */

  /* =====================================================================
   ÁUDIO
   ===================================================================== */
  var audioCtx = null;
  function getAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AC) audioCtx = new AC();
    return audioCtx;
  }
  function bipe(freq, tipo, dur, vol) {
    try {
      var ctx = getAudio();
      if (!ctx) return;
      var osc = ctx.createOscillator(),
        g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = tipo || "sine";
      osc.frequency.value = freq || 440;
      g.gain.setValueAtTime(vol || 0.13, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.12));
      osc.start();
      osc.stop(ctx.currentTime + (dur || 0.12));
    } catch (e) {}
  }
  function somOk() {
    bipe(523, "sine", 0.08, 0.14);
    setTimeout(function () {
      bipe(659, "sine", 0.08, 0.14);
    }, 110);
    setTimeout(function () {
      bipe(784, "sine", 0.18, 0.14);
    }, 220);
  }
  function somErro() {
    bipe(220, "sawtooth", 0.17, 0.09);
    setTimeout(function () {
      bipe(175, "sawtooth", 0.2, 0.09);
    }, 155);
  }
  function somDraw() {
    bipe(440, "triangle", 0.24, 0.11);
  }
  function somNav() {
    bipe(600, "square", 0.05, 0.06);
  }
  function somEsc() {
    bipe(300, "square", 0.06, 0.05);
    setTimeout(function () {
      bipe(220, "square", 0.08, 0.05);
    }, 60);
  }
  function somMoeda() {
    bipe(660, "sine", 0.07, 0.17);
    setTimeout(function () {
      bipe(990, "sine", 0.14, 0.17);
    }, 85);
  }
  function somGiro() {
    for (var i = 0; i < 7; i++)
      (function (n) {
        setTimeout(function () {
          bipe(260 + Math.random() * 480, "square", 0.04, 0.04);
        }, n * 72);
      })(i);
  }

  /* =====================================================================
   CONFETTI
   ===================================================================== */
  var cvs = document.getElementById("cc-canvas"),
    cx2 = cvs.getContext("2d"),
    pts = [];
  function resizeCvs() {
    cvs.width = innerWidth;
    cvs.height = innerHeight;
  }
  resizeCvs();
  window.addEventListener("resize", resizeCvs);
  function confetti() {
    var C = ["#f9e84d", "#ff2d78", "#00f5c4", "#9d5cff", "#ff8c00", "#00b4ff"];
    pts = [];
    for (var i = 0; i < 140; i++)
      pts.push({
        x: Math.random() * cvs.width,
        y: -10,
        w: 5 + Math.random() * 9,
        h: 7 + Math.random() * 12,
        c: C[~~(Math.random() * C.length)],
        vx: (Math.random() - 0.5) * 5,
        vy: 2.5 + Math.random() * 4,
        r: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        a: 1,
      });
    drawC();
  }
  function drawC() {
    cx2.clearRect(0, 0, cvs.width, cvs.height);
    var alive = false;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.a -= 0.008;
      if (p.a <= 0) continue;
      alive = true;
      cx2.save();
      cx2.translate(p.x, p.y);
      cx2.rotate((p.r * Math.PI) / 180);
      cx2.globalAlpha = p.a;
      cx2.fillStyle = p.c;
      cx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx2.restore();
    }
    if (alive) requestAnimationFrame(drawC);
    else cx2.clearRect(0, 0, cvs.width, cvs.height);
  }

  /* =====================================================================
   SISTEMA DE TELAS
   ===================================================================== */
  var TELA = {
    HUB: "hub",
    ARCADE: "arcade-hub",
    JKP: "jokenpo",
    DADOS: "dados",
    CC: "caraCoroa",
    CASINO: "casino",
    SLOTS: "slots",
    ROULETTE: "roulette-game",
    CRASH: "crash-game",
    UNDERTALE: "undertale-hub",
    UT_BATTLE: "ut-battle",
  };
  var telaAtiva = TELA.HUB;

  function irPara(id) {
    if (id !== TELA.UT_BATTLE) stopUtBattle();
    document.querySelectorAll(".screen").forEach(function (s) {
      s.classList.remove("active");
    });
    var t = document.getElementById(id);
    if (!t) return;
    t.classList.add("active");
    telaAtiva = id;
    t.scrollTop = 0;
    if (id === TELA.JKP)
      setTimeout(function () {
        jkpSetFoco(0);
      }, 60);
    if (id === TELA.CC)
      setTimeout(function () {
        ccSetFoco(0);
      }, 60);
    if (id === TELA.CASINO)
      setTimeout(function () {
        casinoSetFocoInicial();
      }, 60);
    if (id === TELA.SLOTS)
      setTimeout(function () {
        var b = document.getElementById("btn-spin");
        if (b) b.classList.add("kb-focus");
      }, 60);
    if (id === TELA.ROULETTE)
      setTimeout(function () {
        var b = document.getElementById("btn-spin-rlt");
        if (b) b.classList.add("kb-focus");
      }, 60);
    if (id === TELA.CRASH)
      setTimeout(function () {
        crashSetFoco(3);
      }, 60);
    if (id === TELA.DADOS)
      setTimeout(function () {
        document.getElementById("btn-dados").classList.add("kb-focus");
      }, 60);
    if (id === TELA.UNDERTALE)
      setTimeout(function () {
        updateUtHub();
        utSetFoco(utIdx);
      }, 60);
  }

  /* =====================================================================
   PLAYGROUND HUB
   ===================================================================== */
  var pgIdx = 0;

  function getPgCards() {
    return Array.from(document.querySelectorAll("#pg-grid .gcard"));
  }

  function pgSetFoco(idx) {
    var cards = getPgCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    pgIdx = idx;
  }

  document.getElementById("pg-arcade").addEventListener("click", function () {
    somNav();
    irPara(TELA.ARCADE);
  });

  var pendingCasinoEntry = false;
  var casinoTicketUsado = false;
  function abrirModalIdade(isCasinoEntry) {
    somNav();
    pendingCasinoEntry = !!isCasinoEntry;
    document.getElementById("age-modal").classList.add("show");
    telaAtiva = "modal-idade";
    modalIdadeIdx = 0;
    modalIdadeSetFoco(0);
  }

  function abrirCasinoEntrada() {
    showCasinoTicketEntry();
    irPara(TELA.CASINO);
  }

  function showCasinoTicketEntry() {
    var panel = document.getElementById("casino-ticket-panel");
    var grid = document.getElementById("casino-game-grid");
    var hero = document.getElementById("casino-hero");
    var hint = document.getElementById("casino-hint");
    casinoTicketUsado = false;
    if (hero) hero.classList.remove("compacted");
    if (hint) {
      hint.innerHTML =
        '<span class="key">ENTER</span> inserir ticket &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
    }
    if (panel) {
      panel.style.display = "flex";
      panel.classList.remove("used");
      panel.setAttribute("aria-hidden", "false");
    }
    if (grid) {
      grid.classList.remove("show");
      grid.classList.add("hidden");
      grid.setAttribute("aria-hidden", "true");
    }
    casinoFocusTicket();
  }

  function revealCasinoGames() {
    if (casinoTicketUsado) return;
    var panel = document.getElementById("casino-ticket-panel");
    var grid = document.getElementById("casino-game-grid");
    var hero = document.getElementById("casino-hero");
    var hint = document.getElementById("casino-hint");
    casinoTicketUsado = true;
    if (hero) hero.classList.add("compacted");
    if (hint) {
      hint.innerHTML =
        '<span class="key">&larr;</span><span class="key">&rarr;</span> navegar &nbsp;|&nbsp; <span class="key">ENTER</span> selecionar &nbsp;|&nbsp; <span class="key">ESC</span> voltar';
    }
    if (panel) panel.classList.add("used");
    setTimeout(function () {
      if (panel) {
        panel.style.display = "none";
        panel.setAttribute("aria-hidden", "true");
      }
      if (grid) {
        grid.classList.remove("hidden");
        grid.classList.add("show");
        grid.setAttribute("aria-hidden", "false");
      }
      casinoSetFoco(0);
      somNav();
    }, 560);
  }

  document.getElementById("pg-casino").addEventListener("click", function () {
    abrirModalIdade(true);
  });
  document.getElementById("pg-undertale").addEventListener("click", function () {
    somNav();
    irPara(TELA.UNDERTALE);
  });

  function pgSelect() {
    var card = getPgCards()[pgIdx];
    if (!card) return;
    if (card.id === "pg-arcade") {
      somNav();
      irPara(TELA.ARCADE);
    } else if (card.id === "pg-casino") {
      abrirModalIdade(true);
    } else if (card.id === "pg-undertale") {
      somNav();
      irPara(TELA.UNDERTALE);
    }
  }

  setTimeout(function () {
    pgSetFoco(0);
  }, 100);

  var slotBet = 10;
  var slotIdx = 0;
  function updateSlotBetUI() {
    var amt = document.getElementById("slot-bet-amount");
    if (amt) amt.textContent = "$" + slotBet;
    var btn = document.getElementById("btn-spin");
    if (btn) btn.textContent = "GIRAR — $" + slotBet;
  }
  function slotsSetFoco(idx) {
    var controls = [
      document.getElementById("slot-bet-amount"),
      document.getElementById("btn-spin"),
    ];
    if (!controls[0] || !controls[1]) return;
    idx = ((idx % controls.length) + controls.length) % controls.length;
    controls.forEach(function (el) {
      el.classList.remove("kb-focus");
    });
    controls[idx].classList.add("kb-focus");
    slotIdx = idx;
  }
  function adjustSlotBet(delta) {
    slotBet = Math.max(10, Math.min(1000, slotBet + delta));
    updateSlotBetUI();
  }
  updateSlotBetUI();

  var casinoIdx = 0;
  function casinoFocusTicket() {
    var ticket = document.getElementById("btn-ticket");
    var ticketCard = ticket ? ticket.closest(".ticket-card") : null;
    getCasinoCards().forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    if (ticket) ticket.classList.add("kb-focus");
    if (ticketCard) ticketCard.classList.add("kb-focus");
  }
  function casinoBlurTicket() {
    var ticket = document.getElementById("btn-ticket");
    var ticketCard = ticket ? ticket.closest(".ticket-card") : null;
    if (ticket) ticket.classList.remove("kb-focus");
    if (ticketCard) ticketCard.classList.remove("kb-focus");
  }
  function casinoSetFocoInicial() {
    if (casinoTicketUsado) {
      casinoBlurTicket();
      casinoSetFoco(0);
    } else {
      casinoFocusTicket();
    }
  }
  function getCasinoCards() {
    var grid = document.getElementById("casino-game-grid");
    if (!grid || !grid.classList.contains("show")) return [];
    return Array.from(grid.querySelectorAll(".ccard"));
  }
  function casinoSetFoco(idx) {
    var cards = getCasinoCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    casinoBlurTicket();
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    casinoIdx = idx;
  }
  function casinoSelect() {
    if (!casinoTicketUsado) {
      somMoeda();
      revealCasinoGames();
      return;
    }
    var cards = getCasinoCards();
    var card = cards[casinoIdx];
    if (card) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  }
  Array.from(document.querySelectorAll("#casino-game-grid .ccard")).forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      casinoSetFoco(index);
    });
  });

  var rltIdx = 0;
  var rltControls = ["rlt-bet-input", "rc-red", "rc-black", "rc-green", "btn-spin-rlt"];
  function rltSetFoco(idx) {
    idx = ((idx % rltControls.length) + rltControls.length) % rltControls.length;
    rltControls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
    var el = document.getElementById(rltControls[idx]);
    if (!el) return;
    el.classList.add("kb-focus");
    if (rltControls[idx] !== "rlt-bet-input") {
      hideInputNumpad();
    }
    rltIdx = idx;
  }

  var crashIdx = 0;
  var crashControls = [
    "crash-bet-input",
    "crash-auto-toggle",
    "crash-auto-input",
    "btn-crash-bet",
    "btn-crash-out",
  ];
  function crashSetFoco(idx) {
    idx = ((idx % crashControls.length) + crashControls.length) % crashControls.length;
    crashControls.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("kb-focus");
    });
    var el = document.getElementById(crashControls[idx]);
    if (!el) return;
    el.classList.add("kb-focus");
    if (crashControls[idx] !== "crash-bet-input" && crashControls[idx] !== "crash-auto-input") {
      hideInputNumpad();
    }
    crashIdx = idx;
  }

  var inputNumpadInput = null;
  var inputNumpadBuffer = "";
  var inputNumpadFresh = false;
  var SPECIAL_INPUTS = ["rlt-bet-input", "crash-bet-input", "crash-auto-input"];

  function isSpecialInput(el) {
    return el && el.tagName === "INPUT" && SPECIAL_INPUTS.indexOf(el.id) !== -1;
  }
  function clampNumber(value, min, max) {
    var n = parseFloat(value);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }
  function updateInputNumpadDisplay(input) {
    var label = "$0";
    if (!input) return;
    if (input.id === "crash-auto-input") {
      label = "×" + (input.value ? parseFloat(input.value).toFixed(1) : "0.0");
    } else {
      label = "$" + (input.value ? parseInt(input.value, 10) : 0);
    }
    var el = document.getElementById("numpad-value");
    if (el) el.textContent = label;
  }
  function showInputNumpad(input) {
    var panel = document.getElementById("global-input-numpad");
    var alreadyOpen = panel && !panel.classList.contains("hidden") && inputNumpadInput === input;
    inputNumpadInput = input;
    if (!alreadyOpen) {
      inputNumpadBuffer = input.value || "";
      inputNumpadFresh = true;
    }
    updateInputNumpadDisplay(input);
    if (panel) panel.classList.remove("hidden");
  }
  function hideInputNumpad() {
    inputNumpadInput = null;
    inputNumpadFresh = false;
    var panel = document.getElementById("global-input-numpad");
    if (panel) panel.classList.add("hidden");
  }
  function getPresetValues(input) {
    if (!input) return [];
    if (input.id === "crash-auto-input") return [1.1, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0, 100.0];
    return [10, 20, 50, 100, 200, 500, 1000];
  }
  function settleSpecialInputValue(input, value) {
    if (!input) return;
    if (input.id === "crash-auto-input") {
      input.value = clampNumber(
        value,
        parseFloat(input.min) || 1.1,
        parseFloat(input.max) || 100,
      ).toFixed(1);
    } else {
      input.value = Math.round(
        clampNumber(value, parseInt(input.min, 10) || 1, parseInt(input.max, 10) || 1000),
      );
    }
    inputNumpadBuffer = input.value;
    updateInputNumpadDisplay(input);
  }
  function adjustSpecialInputValue(input, delta) {
    if (!input) return;
    var options = getPresetValues(input);
    var current = parseFloat(input.value) || options[0];
    var closest = 0;
    for (var i = 0; i < options.length; i++) {
      if (options[i] === current) {
        closest = i;
        break;
      }
      if (options[i] > current) {
        closest = i;
        break;
      }
    }
    if (options[closest] !== current) {
      if (delta < 0) closest = Math.max(0, closest - 1);
    } else {
      closest = Math.max(0, Math.min(options.length - 1, closest + delta));
    }
    settleSpecialInputValue(input, options[closest]);
  }
  function applyNumpadBuffer(input) {
    if (!input) return;
    var raw = inputNumpadBuffer || "";
    if (input.id === "crash-auto-input") {
      raw = raw.replace(/[^0-9.]/g, "");
      if ((raw.match(/\./g) || []).length > 1) {
        raw = raw.slice(0, raw.lastIndexOf("."));
      }
      if (raw.indexOf(".") >= 0) {
        var parts = raw.split(".");
        raw = parts[0] + "." + (parts[1] || "").slice(0, 1);
      }
      if (raw === "" || raw === ".") {
        input.value = "";
      } else {
        input.value = raw;
      }
    } else {
      raw = raw.replace(/\D/g, "");
      if (raw === "") {
        input.value = "";
      } else {
        input.value = Math.round(
          clampNumber(
            parseInt(raw, 10),
            parseInt(input.min, 10) || 1,
            parseInt(input.max, 10) || 1000,
          ),
        );
      }
    }
    inputNumpadBuffer = input.value || raw;
    updateInputNumpadDisplay(input);
  }
  function confirmSpecialInput(input) {
    if (!input) return;
    if (!input.value) {
      settleSpecialInputValue(
        input,
        parseFloat(input.min) || (input.id === "crash-auto-input" ? 1.1 : 10),
      );
    } else if (input.id === "crash-auto-input") {
      settleSpecialInputValue(input, parseFloat(input.value));
    }
    if (input.id === "rlt-bet-input") {
      rltSetFoco(4);
    } else {
      crashSetFoco(3);
    }
    input.blur();
    hideInputNumpad();
  }
  function flashKeyHint(key) {
    var selector = '#key-feedback [data-key="' + key + '"]';
    var keyEl = document.querySelector(selector);
    if (keyEl) {
      keyEl.classList.add("active");
      setTimeout(function () {
        keyEl.classList.remove("active");
      }, 120);
    }
    var numpadKey = key.toLowerCase();
    if (numpadKey === "backspace") numpadKey = "backspace";
    if (numpadKey === "enter") numpadKey = "enter";
    var inputKey = document.querySelector('#global-input-numpad [data-key="' + numpadKey + '"]');
    if (inputKey) {
      inputKey.classList.add("active");
      setTimeout(function () {
        inputKey.classList.remove("active");
      }, 120);
    }
  }
  function handleSpecialInputKey(input, key) {
    if (!input) return false;
    if (key === "ArrowUp" || key === "ArrowDown") {
      inputNumpadFresh = false;
      adjustSpecialInputValue(input, key === "ArrowUp" ? 1 : -1);
      return true;
    }
    if (key === "Backspace") {
      inputNumpadFresh = false;
      inputNumpadBuffer = inputNumpadBuffer.slice(0, -1);
      applyNumpadBuffer(input);
      return true;
    }
    if (key === "Enter") {
      confirmSpecialInput(input);
      return true;
    }
    if (key === "Escape") {
      input.blur();
      hideInputNumpad();
      return true;
    }
    if (/^[0-9.]$/.test(key)) {
      if (key === "." && input.id !== "crash-auto-input") return false;
      if (inputNumpadFresh) {
        inputNumpadBuffer = key === "." ? "0" : "";
        inputNumpadFresh = false;
      }
      if (key === "." && inputNumpadBuffer.indexOf(".") !== -1) return true;
      inputNumpadBuffer += key;
      applyNumpadBuffer(input);
      return true;
    }
    return false;
  }

  function isCrashAutoEnabled() {
    var cb = document.getElementById("crash-auto-enabled");
    return !!(cb && cb.checked);
  }
  function syncCrashAutoToggle() {
    var cb = document.getElementById("crash-auto-enabled");
    var toggle = document.getElementById("crash-auto-toggle");
    if (!cb || !toggle) return;
    toggle.setAttribute("aria-checked", cb.checked ? "true" : "false");
    toggle.classList.toggle("auto-on", cb.checked);
    var grp = toggle.closest(".crash-input-grp");
    if (grp) grp.classList.toggle("auto-on", cb.checked);
  }
  var crashAutoToggle = document.getElementById("crash-auto-toggle");
  if (crashAutoToggle) {
    crashAutoToggle.addEventListener("click", function (e) {
      if (e) e.preventDefault();
      var cb = document.getElementById("crash-auto-enabled");
      if (!cb) return;
      cb.checked = !cb.checked;
      syncCrashAutoToggle();
      somNav();
    });
  }
  syncCrashAutoToggle();

  SPECIAL_INPUTS.forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.readOnly = true;
    input.addEventListener("focus", function () {
      showInputNumpad(input);
    });
    input.addEventListener("blur", function () {
      setTimeout(function () {
        if (document.activeElement && isSpecialInput(document.activeElement)) return;
        hideInputNumpad();
      }, 120);
    });
  });

  var numpadOverlay = document.getElementById("global-input-numpad");
  if (numpadOverlay) {
    numpadOverlay.addEventListener("click", function (e) {
      var button = e.target.closest(".numpad-key");
      if (!button || !inputNumpadInput) return;
      var key = button.dataset.key;
      if (!key) return;
      var physical = key === "backspace" ? "Backspace" : key === "enter" ? "Enter" : key;
      handleSpecialInputKey(inputNumpadInput, physical);
      flashKeyHint(physical);
      inputNumpadInput.focus();
    });
  }

  /* Controle de teclado do modal de idade */
  var modalIdadeIdx = 0; // 0 = SIM, 1 = NAO

  function modalIdadeSetFoco(idx) {
    var btns = [document.getElementById("age-yes"), document.getElementById("age-no")];
    btns.forEach(function (b) {
      b.classList.remove("kb-focus");
    });
    btns[idx].classList.add("kb-focus");
    modalIdadeIdx = idx;
  }

  document.getElementById("age-yes").addEventListener("mouseenter", function () {
    modalIdadeSetFoco(0);
  });
  document.getElementById("age-no").addEventListener("mouseenter", function () {
    modalIdadeSetFoco(1);
  });

  /* =====================================================================
   ARCADE HUB
   ===================================================================== */
  var btnCoin = document.getElementById("btn-coin");
  var hubHint = document.getElementById("hub-hint");
  var gameGrid = document.getElementById("game-grid");
  var mCoin = document.getElementById("mario-coin");
  var arcHero = document.getElementById("arc-hero");
  var coinUsada = false;
  var hubIdx = 0;

  function getHubCards() {
    return Array.from(document.querySelectorAll("#game-grid .gcard"));
  }

  function hubSetFoco(idx) {
    var cards = getHubCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    hubIdx = idx;
  }

  function hubSelect() {
    var cards = getHubCards();
    var card = cards[hubIdx];
    if (card) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  }

  function inserirMoeda() {
    if (coinUsada) return;
    coinUsada = true;
    somMoeda();
    btnCoin.classList.add("kb-sel");
    var r = btnCoin.getBoundingClientRect();
    mCoin.style.left = r.left + r.width / 2 - 26 + "px";
    mCoin.style.top = r.top + r.height / 2 - 26 + "px";
    mCoin.style.opacity = "1";
    mCoin.classList.remove("coin-rise");
    void mCoin.offsetWidth;
    mCoin.classList.add("coin-rise");
    setTimeout(function () {
      btnCoin.classList.add("gone");
      arcHero.classList.add("compacted");
      gameGrid.classList.add("show");
      hubHint.classList.add("show");
      setTimeout(function () {
        hubSetFoco(0);
        somNav();
      }, 380);
    }, 870);
  }

  function resetArcade() {
    coinUsada = false;
    if (btnCoin) {
      btnCoin.classList.remove("gone", "kb-sel");
    }
    if (arcHero) {
      arcHero.classList.remove("compacted");
    }
    if (gameGrid) {
      gameGrid.classList.remove("show");
    }
    if (hubHint) {
      hubHint.classList.remove("show");
    }
  }

  btnCoin.addEventListener("click", inserirMoeda);

  document.getElementById("game-grid").addEventListener("click", function (e) {
    var card = e.target.closest(".gcard");
    if (card && coinUsada) {
      somNav();
      irPara(card.getAttribute("data-goto"));
    }
  });

  /* Nav-back centralizado */
  document.addEventListener("click", function (e) {
    var back = e.target.closest(".nav-back");
    if (!back) return;
    somEsc();
    var id = back.id;
    if (id === "jkp-back" || id === "dados-back" || id === "cc-back") {
      irPara(TELA.ARCADE);
    } else if (id === "casino-back") {
      irPara(TELA.HUB);
    } else if (id === "slots-back" || id === "rlt-back" || id === "crash-back") {
      irPara(TELA.CASINO);
    } else if (id === "ut-hub-back") {
      irPara(TELA.HUB);
    } else if (id === "ut-battle-back") {
      irPara(TELA.UNDERTALE);
    }
  });

  /* =====================================================================
   JOKENPÔ — Navegação com teclado
   ===================================================================== */
  var jkpIdx = 0;

  function getJkpCards() {
    return Array.from(document.querySelectorAll(".jkp-card"));
  }

  function jkpSetFoco(idx) {
    var cards = getJkpCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (c) {
      c.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    jkpIdx = idx;
  }

  function jkpConfirmar() {
    var c = getJkpCards()[jkpIdx];
    if (c) jogarJkp(c.getAttribute("data-jkp"));
  }

  /* Clique nos cards de jkp via mouse */
  getJkpCards().forEach(function (card) {
    card.addEventListener("click", function () {
      jogarJkp(card.getAttribute("data-jkp"));
    });
  });

  /* Clique NOVA RODADA via mouse */
  document.getElementById("jkp-new").addEventListener("click", function () {
    reiniciarJkp();
  });

  /* =====================================================================
   CARA OU COROA — Navegação com teclado
   ===================================================================== */
  var ccIdx = 0;

  function ccSetFoco(idx) {
    idx = ((idx % 2) + 2) % 2;
    document.getElementById("btn-cara").classList.remove("kb-focus");
    document.getElementById("btn-coroa").classList.remove("kb-focus");
    (idx === 0
      ? document.getElementById("btn-cara")
      : document.getElementById("btn-coroa")
    ).classList.add("kb-focus");
    ccIdx = idx;
  }

  function ccConfirmar() {
    var btn =
      ccIdx === 0 ? document.getElementById("btn-cara") : document.getElementById("btn-coroa");
    if (!btn.classList.contains("disabled")) jogarCc(ccIdx === 0 ? "cara" : "coroa");
  }

  /* Clique nos botões cara/coroa via mouse */
  document.getElementById("btn-cara").addEventListener("click", function () {
    jogarCc("cara");
  });
  document.getElementById("btn-coroa").addEventListener("click", function () {
    jogarCc("coroa");
  });

  /* =====================================================================
   UNDERTALE -- Hub e sobrevivencia
   ===================================================================== */
  var utIdx = 0;
  var utWins = { bone: false, queen: false, final: false };
  var utKeys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  var UT_BOX = { x: 92, y: 190, w: 336, h: 126 };
  var UT_BOSSES = {
    bone: {
      name: "BOSS 1 - OSSADA",
      sub: "Chuva de magia e ossos no chao.",
      duration: 60000,
      playerHp: 5,
      color: "#ffffff",
      accent: "#00b4ff",
      damage: 1,
    },
    queen: {
      name: "BOSS 2 - RAINHA",
      sub: "Correntes de esferas e tridente.",
      duration: 60000,
      playerHp: 5,
      color: "#f9e84d",
      accent: "#ff2d78",
      damage: 1,
    },
    final: {
      name: "FINAL - BARREIRA",
      sub: "Ossos finais em tres formas.",
      duration: 120000,
      playerHp: 5,
      color: "#ff2d78",
      accent: "#00f5c4",
      damage: 2,
    },
  };
  var utCanvas = document.getElementById("ut-canvas");
  var utCtx = utCanvas ? utCanvas.getContext("2d") : null;
  var utBattle = null;
  var utLoopToken = 0;

  window.__utDebug = {
    unlockFinal: function () {
      utWins.bone = true;
      utWins.queen = true;
      updateUtHub();
    },
    startFinal: function () {
      startUtBattle("final");
    },
    startBoss: function (bossId) {
      startUtBattle(bossId);
    },
    state: function () {
      return {
        wins: {
          bone: utWins.bone,
          queen: utWins.queen,
          final: utWins.final,
        },
        battle: utBattle
          ? {
              bossId: utBattle.bossId,
              running: utBattle.running,
              ended: utBattle.ended,
              phase: utBattle.phase,
              elapsed: utBattle.elapsed,
            }
          : null,
      };
    },
  };

  function utFinalUnlocked() {
    return utWins.bone && utWins.queen;
  }
  function getUtCards() {
    return Array.from(document.querySelectorAll("#ut-boss-grid .ut-card"));
  }
  function utSetFoco(idx) {
    var cards = getUtCards();
    if (!cards.length) return;
    idx = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(function (card) {
      card.classList.remove("kb-focus");
    });
    cards[idx].classList.add("kb-focus");
    utIdx = idx;
  }
  function updateUtHub() {
    var finalCard = document.getElementById("ut-card-final");
    var lockMsg = document.getElementById("ut-lock-msg");
    var unlocked = utFinalUnlocked();
    ["bone", "queen"].forEach(function (id) {
      var chip = document.getElementById("ut-chip-" + id);
      if (chip) chip.classList.toggle("done", !!utWins[id]);
    });
    getUtCards().forEach(function (card) {
      var id = card.getAttribute("data-ut-boss");
      card.classList.toggle("cleared", !!utWins[id]);
      if (id !== "final") return;
      card.classList.toggle("locked", !unlocked);
      card.classList.toggle("unlocked", unlocked);
      card.setAttribute("aria-label", unlocked ? "Final liberado" : "Final bloqueado");
      var cta = card.querySelector(".ut-card-cta");
      if (cta) cta.textContent = unlocked ? "JOGAR" : "BLOQUEADO";
    });
    if (finalCard && unlocked && lockMsg) {
      lockMsg.textContent = utWins.final
        ? "Final concluido. Voce venceu a rota de sobrevivencia."
        : "FINAL liberado. Entre quando estiver pronto.";
    } else if (lockMsg) {
      lockMsg.textContent = "Derrote BOSS 1 e BOSS 2 para abrir o FINAL.";
    }
  }
  function utFlashLock() {
    var msg = document.getElementById("ut-lock-msg");
    if (!msg) return;
    msg.classList.add("warn");
    msg.textContent = "FINAL bloqueado: derrote os dois chefes primeiro.";
    somErro();
    setTimeout(function () {
      msg.classList.remove("warn");
      updateUtHub();
    }, 1100);
  }
  function utSelect() {
    var card = getUtCards()[utIdx];
    if (!card) return;
    var bossId = card.getAttribute("data-ut-boss");
    if (bossId === "final" && !utFinalUnlocked()) {
      utFlashLock();
      return;
    }
    somNav();
    startUtBattle(bossId);
  }
  getUtCards().forEach(function (card, index) {
    card.addEventListener("mouseenter", function () {
      utSetFoco(index);
    });
    card.addEventListener("click", function () {
      utSetFoco(index);
      utSelect();
    });
  });
  updateUtHub();

  function stopUtBattle() {
    utLoopToken++;
    if (utBattle) {
      utBattle.active = false;
      utBattle.ended = false;
      utBattle = null;
    }
    if (utKeys) {
      Object.keys(utKeys).forEach(function (k) {
        utKeys[k] = false;
      });
    }
  }

  function startUtBattle(bossId) {
    var boss = UT_BOSSES[bossId];
    if (!boss || !utCtx) return;
    if (utBattle) utBattle.active = false;
    var loopToken = ++utLoopToken;
    utBattle = {
      active: true,
      loopToken: loopToken,
      running: false,
      ended: false,
      result: "",
      bossId: bossId,
      boss: boss,
      playerHp: boss.playerHp,
      playerMaxHp: boss.playerHp,
      duration: boss.duration,
      damage: boss.damage,
      heart: { x: UT_BOX.x + UT_BOX.w / 2, y: UT_BOX.y + UT_BOX.h / 2, r: 7 },
      bullets: [],
      lastTs: 0,
      elapsed: 0,
      phase: 1,
      spawnTimer: 0,
      invuln: 0,
      shake: 0,
    };
    var title = document.getElementById("ut-battle-title");
    var name = document.getElementById("ut-boss-name");
    var sub = document.getElementById("ut-boss-sub");
    var status = document.getElementById("ut-status");
    if (title) title.textContent = boss.name;
    if (name) name.textContent = boss.name;
    if (sub) sub.textContent = boss.sub;
    if (status) status.textContent = "Pressione ENTER para comecar.";
    updateUtBattleUi();
    irPara(TELA.UT_BATTLE);
    requestAnimationFrame(function (ts) {
      utLoop(ts, loopToken);
    });
  }

  function updateUtBattleUi() {
    if (!utBattle) return;
    var hp = document.getElementById("ut-player-hp-label");
    if (hp) hp.textContent = Math.max(0, Math.ceil(utBattle.playerHp)) + " / " + utBattle.playerMaxHp;
  }

  function utLoop(ts, token) {
    var st = utBattle;
    if (!st || !utCtx || st.loopToken !== token) return;
    if (!st.lastTs) st.lastTs = ts;
    var dt = Math.min(34, ts - st.lastTs);
    st.lastTs = ts;
    if (st.active && st.running && !st.ended) utUpdate(st, dt);
    utDraw(st);
    if (st === utBattle && (st.active || st.ended))
      requestAnimationFrame(function (nextTs) {
        utLoop(nextTs, token);
      });
  }

  function utUpdate(st, dt) {
    st.elapsed += dt;
    st.spawnTimer -= dt;
    st.invuln = Math.max(0, st.invuln - dt);
    st.shake = Math.max(0, st.shake - dt * 0.045);
    var nextPhase = getUtPhase(st);
    if (nextPhase !== st.phase) {
      st.phase = nextPhase;
      st.bullets = [];
      st.spawnTimer = 0;
      var status = document.getElementById("ut-status");
      if (status) status.textContent = "O padrao mudou. Continue vivo.";
      somGiro();
    }
    var speed = (utKeys.ArrowUp || utKeys.ArrowDown) && (utKeys.ArrowLeft || utKeys.ArrowRight) ? 0.15 : 0.2;
    if (utKeys.ArrowLeft) st.heart.x -= speed * dt;
    if (utKeys.ArrowRight) st.heart.x += speed * dt;
    if (utKeys.ArrowUp) st.heart.y -= speed * dt;
    if (utKeys.ArrowDown) st.heart.y += speed * dt;
    st.heart.x = Math.max(UT_BOX.x + st.heart.r, Math.min(UT_BOX.x + UT_BOX.w - st.heart.r, st.heart.x));
    st.heart.y = Math.max(UT_BOX.y + st.heart.r, Math.min(UT_BOX.y + UT_BOX.h - st.heart.r, st.heart.y));

    if (st.spawnTimer <= 0) {
      utSpawn(st);
      st.spawnTimer = getUtSpawnDelay(st);
    }

    for (var i = st.bullets.length - 1; i >= 0; i--) {
      var b = st.bullets[i];
      if (b.life != null) b.life -= dt;
      if (b.type === "sinOrb") {
        b.wave += dt * b.waveSpeed;
        b.x += Math.sin(b.wave) * b.sway * dt;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot = (b.rot || 0) + (b.spin || 0) * dt;
      if (utHits(st.heart, b)) utDamage(st, b.damage || st.damage);
      if (
        (b.life != null && b.life <= 0) ||
        b.x < UT_BOX.x - 130 ||
        b.x > UT_BOX.x + UT_BOX.w + 130 ||
        b.y < UT_BOX.y - 130 ||
        b.y > UT_BOX.y + UT_BOX.h + 130
      ) {
        st.bullets.splice(i, 1);
      }
    }
    if (!st.ended && st.elapsed >= st.duration) finishUtBattle(true);
    updateUtBattleUi();
  }

  function getUtPhase(st) {
    if (st.bossId !== "final") return st.elapsed >= st.duration / 2 ? 2 : 1;
    if (st.elapsed >= 90000) return 3;
    if (st.elapsed >= 60000) return 2;
    return 1;
  }

  function getUtSpawnDelay(st) {
    if (st.bossId === "bone") return st.phase === 1 ? 300 : 210;
    if (st.bossId === "queen") return st.phase === 1 ? 360 : 240;
    if (st.phase === 1) return 330;
    if (st.phase === 2) return 280;
    return 230;
  }

  function utSpawn(st) {
    if (st.bossId === "bone") {
      spawnBossOne(st);
    } else if (st.bossId === "queen") {
      spawnBossTwo(st);
    } else {
      spawnFinal(st);
    }
  }

  function spawnBossOne(st) {
    var columns = st.phase === 1 ? 1 : 2;
    for (var c = 0; c < columns; c++) {
      var x = UT_BOX.x + 42 + Math.random() * (UT_BOX.w - 84);
      st.bullets.push({
        type: "orb",
        x: x,
        y: UT_BOX.y - 22 - c * 18,
        vx: (Math.random() - 0.5) * 0.025,
        vy: 0.12 + st.phase * 0.035 + Math.random() * 0.035,
        r: 5,
        damage: st.damage,
        color: c % 2 ? "#ffffff" : "#ff8c00",
      });
    }
    if (Math.random() < (st.phase === 1 ? 0.42 : 0.7)) {
      var count = st.phase === 1 ? 4 : 6;
      var gap = Math.floor(Math.random() * count);
      for (var i = 0; i < count; i++) {
        if (i === gap) continue;
        st.bullets.push({
          type: "boneSpike",
          x: UT_BOX.x + 18 + i * ((UT_BOX.w - 36) / (count - 1)),
          y: UT_BOX.y + UT_BOX.h + 20,
          w: 12,
          h: st.phase === 1 ? 28 : 40,
          vx: 0,
          vy: -0.11 - st.phase * 0.015,
          life: 780,
          damage: st.damage,
          color: "#ffffff",
        });
      }
    }
  }

  function spawnBossTwo(st) {
    if (Math.random() < 0.7) {
      var chainX = UT_BOX.x + 28 + Math.random() * (UT_BOX.w - 56);
      var beads = st.phase === 1 ? 7 : 10;
      for (var i = 0; i < beads; i++) {
        st.bullets.push({
          type: "sinOrb",
          x: chainX,
          y: UT_BOX.y - 30 - i * 17,
          vx: 0,
          vy: 0.15 + st.phase * 0.03,
          r: 5,
          wave: i * 0.8,
          waveSpeed: 0.006 + st.phase * 0.001,
          sway: 0.035 + st.phase * 0.018,
          damage: st.damage,
          color: "#ff8c00",
        });
      }
    }
    if (Math.random() < (st.phase === 1 ? 0.45 : 0.72)) {
      var fromRight = Math.random() < 0.62;
      var y = UT_BOX.y + 20 + Math.random() * (UT_BOX.h - 40);
      st.bullets.push({
        type: "spear",
        x: fromRight ? UT_BOX.x + UT_BOX.w + 44 : UT_BOX.x - 44,
        y: y,
        vx: (fromRight ? -1 : 1) * (0.18 + st.phase * 0.045),
        vy: (Math.random() - 0.5) * 0.05,
        r: 13,
        rot: fromRight ? -Math.PI / 2 : Math.PI / 2,
        damage: st.damage,
        color: "#ff2d78",
      });
    }
  }

  function spawnFinal(st) {
    if (st.phase === 1) {
      spawnFinalBars(st);
    } else if (st.phase === 2) {
      spawnFinalCross(st);
    } else {
      spawnFinalArc(st);
    }
  }

  function spawnFinalBars(st) {
    var bars = 8;
    var gap = Math.floor(Math.random() * bars);
    for (var i = 0; i < bars; i++) {
      if (i === gap) continue;
      st.bullets.push({
        type: "bone",
        x: UT_BOX.x + 22 + i * ((UT_BOX.w - 44) / (bars - 1)),
        y: UT_BOX.y + UT_BOX.h + 46,
        w: 10,
        h: 88,
        vx: 0,
        vy: -0.13,
        life: 1050,
        damage: st.damage,
        color: "#ffffff",
      });
    }
  }

  function spawnFinalCross(st) {
    var opening = 76 + Math.random() * 30;
    st.bullets.push({
      type: "wall",
      x: UT_BOX.x + UT_BOX.w / 2,
      y: UT_BOX.y + 22,
      w: UT_BOX.w - opening,
      h: 16,
      vx: (Math.random() < 0.5 ? -1 : 1) * 0.04,
      vy: 0.04,
      life: 1800,
      damage: st.damage,
      color: "#ffffff",
    });
    st.bullets.push({
      type: "wall",
      x: UT_BOX.x + UT_BOX.w / 2,
      y: UT_BOX.y + UT_BOX.h - 22,
      w: UT_BOX.w - opening,
      h: 16,
      vx: (Math.random() < 0.5 ? -1 : 1) * 0.04,
      vy: -0.04,
      life: 1800,
      damage: st.damage,
      color: "#ffffff",
    });
    st.bullets.push({
      type: "wall",
      x: UT_BOX.x + 22,
      y: UT_BOX.y + UT_BOX.h / 2,
      w: 16,
      h: UT_BOX.h - opening * 0.72,
      vx: 0.05,
      vy: (Math.random() < 0.5 ? -1 : 1) * 0.035,
      life: 1600,
      damage: st.damage,
      color: "#ffffff",
    });
    st.bullets.push({
      type: "wall",
      x: UT_BOX.x + UT_BOX.w - 22,
      y: UT_BOX.y + UT_BOX.h / 2,
      w: 16,
      h: UT_BOX.h - opening * 0.72,
      vx: -0.05,
      vy: (Math.random() < 0.5 ? -1 : 1) * 0.035,
      life: 1600,
      damage: st.damage,
      color: "#ffffff",
    });
    for (var i = 0; i < 3; i++) spawnSkullHead(st, i);
  }

  function spawnFinalArc(st) {
    var cx = UT_BOX.x + UT_BOX.w / 2;
    var cy = UT_BOX.y + UT_BOX.h / 2;
    var start = -Math.PI * 0.95 + Math.random() * 0.3;
    for (var i = 0; i < 7; i++) {
      var a = start + i * 0.22;
      var x = cx + Math.cos(a) * 210;
      var y = cy + Math.sin(a) * 126;
      var dx = cx - x;
      var dy = cy - y;
      var len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      st.bullets.push({
        type: "skull",
        x: x,
        y: y,
        vx: (dx / len) * 0.18,
        vy: (dy / len) * 0.18,
        r: 13,
        rot: a,
        spin: 0.004,
        damage: st.damage,
        color: "#ffffff",
      });
    }
    if (Math.random() < 0.7) {
      st.bullets.push({
        type: "beam",
        x: UT_BOX.x - 90,
        y: UT_BOX.y + UT_BOX.h * (Math.random() < 0.5 ? 0.36 : 0.66),
        w: 150,
        h: 8,
        vx: 0.28,
        vy: 0,
        damage: st.damage,
        color: "#ffffff",
      });
    }
  }

  function spawnSkullHead(st, idx) {
    var side = idx % 2 === 0 ? -1 : 1;
    var x = side < 0 ? UT_BOX.x - 34 : UT_BOX.x + UT_BOX.w + 34;
    var y = UT_BOX.y + 24 + Math.random() * (UT_BOX.h - 48);
    st.bullets.push({
      type: "skull",
      x: x,
      y: y,
      vx: side < 0 ? 0.13 : -0.13,
      vy: (Math.random() - 0.5) * 0.06,
      r: 12,
      rot: side < 0 ? 0 : Math.PI,
      spin: 0.002 * side,
      damage: st.damage,
      color: "#ffffff",
    });
  }

  function utHits(heart, b) {
    if (b.type === "orb" || b.type === "sinOrb" || b.type === "spear" || b.type === "skull") {
      var dx = heart.x - b.x;
      var dy = heart.y - b.y;
      var rr = heart.r + (b.r || 8);
      return dx * dx + dy * dy <= rr * rr;
    }
    var left = b.x - b.w / 2;
    var top = b.y - b.h / 2;
    var nx = Math.max(left, Math.min(heart.x, left + b.w));
    var ny = Math.max(top, Math.min(heart.y, top + b.h));
    var rx = heart.x - nx;
    var ry = heart.y - ny;
    return rx * rx + ry * ry <= heart.r * heart.r;
  }

  function utDamage(st, amount) {
    if (st.invuln > 0 || st.ended) return;
    st.playerHp -= amount;
    st.invuln = 760;
    st.shake = 10;
    somErro();
    var status = document.getElementById("ut-status");
    if (status) status.textContent = "Voce levou dano. Continue desviando.";
    if (st.playerHp <= 0) finishUtBattle(false);
  }

  function utStartOrContinue() {
    var st = utBattle;
    if (!st) return;
    if (st.ended) {
      if (st.result === "lose") startUtBattle(st.bossId);
      else irPara(TELA.UNDERTALE);
      return;
    }
    if (st.running) return;
    st.running = true;
    st.lastTs = 0;
    st.spawnTimer = 0;
    var status = document.getElementById("ut-status");
    if (status) status.textContent = "Sobreviva aos padroes.";
    somOk();
  }

  function finishUtBattle(won) {
    var st = utBattle;
    if (!st) return;
    st.ended = true;
    st.running = false;
    st.result = won ? "win" : "lose";
    st.bullets = [];
    Object.keys(utKeys).forEach(function (k) {
      utKeys[k] = false;
    });
    var status = document.getElementById("ut-status");
    if (won) {
      utWins[st.bossId] = true;
      updateUtHub();
      somOk();
      confetti();
      if (status) {
        status.textContent =
          st.bossId === "final"
            ? "FINAL vencido. Pressione ENTER para voltar."
            : "Voce sobreviveu. Pressione ENTER para voltar.";
      }
    } else {
      somErro();
      if (status) status.textContent = "Voce caiu. Pressione ENTER para tentar de novo.";
    }
    updateUtBattleUi();
  }

  function utDraw(st) {
    if (!utCtx) return;
    var ctx = utCtx;
    ctx.save();
    ctx.clearRect(0, 0, utCanvas.width, utCanvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, utCanvas.width, utCanvas.height);
    if (st.shake > 0) {
      ctx.translate((Math.random() - 0.5) * st.shake, (Math.random() - 0.5) * st.shake);
    }
    drawUtBoss(ctx, st);
    ctx.strokeStyle = st.bossId === "final" && st.phase === 1 ? "#55ff66" : "#fff";
    ctx.lineWidth = 4;
    ctx.strokeRect(UT_BOX.x, UT_BOX.y, UT_BOX.w, UT_BOX.h);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fillRect(UT_BOX.x + 2, UT_BOX.y + 2, UT_BOX.w - 4, UT_BOX.h - 4);
    st.bullets.forEach(function (b) {
      drawUtBullet(ctx, b);
    });
    if (!st.ended || st.result === "lose") drawHeart(ctx, st.heart, st.invuln > 0);
    if (!st.running && !st.ended) drawUtReadyText(ctx);
    if (st.ended) drawUtEndText(ctx, st);
    ctx.restore();
  }

  function drawUtBoss(ctx, st) {
    var cx = 260;
    var y = 76;
    ctx.save();
    ctx.strokeStyle = st.boss.color;
    ctx.fillStyle = st.boss.color;
    ctx.lineWidth = 4;
    if (st.bossId === "bone") {
      ctx.beginPath();
      ctx.arc(cx, y - 8, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 44, y + 4);
      ctx.quadraticCurveTo(cx - 74, y + 24, cx - 42, y + 47);
      ctx.moveTo(cx + 44, y + 4);
      ctx.quadraticCurveTo(cx + 74, y + 24, cx + 42, y + 47);
      ctx.stroke();
      ctx.fillRect(cx - 15, y - 15, 8, 5);
      ctx.fillRect(cx + 7, y - 15, 8, 5);
      ctx.beginPath();
      ctx.moveTo(cx - 14, y + 6);
      ctx.lineTo(cx + 14, y + 6);
      ctx.moveTo(cx - 10, y + 14);
      ctx.lineTo(cx + 10, y + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 28, y + 35);
      ctx.lineTo(cx, y + 62);
      ctx.lineTo(cx + 28, y + 35);
      ctx.stroke();
    } else if (st.bossId === "queen") {
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#f9e84d";
      ctx.beginPath();
      ctx.moveTo(cx - 46, y - 20);
      ctx.lineTo(cx - 28, y - 6);
      ctx.lineTo(cx, y - 36);
      ctx.lineTo(cx + 28, y - 6);
      ctx.lineTo(cx + 46, y - 20);
      ctx.lineTo(cx + 46, y + 2);
      ctx.lineTo(cx - 46, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeRect(cx - 35, y + 18, 70, 52);
      ctx.fillRect(cx - 18, y + 42, 8, 8);
      ctx.fillRect(cx + 10, y + 42, 8, 8);
      ctx.beginPath();
      ctx.moveTo(cx - 14, y + 60);
      ctx.lineTo(cx + 14, y + 60);
      ctx.moveTo(cx + 52, y + 16);
      ctx.lineTo(cx + 94, y + 2);
      ctx.lineTo(cx + 58, y + 28);
      ctx.stroke();
    } else {
      if (st.phase === 1) {
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, y - 8, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillRect(cx - 12, y - 14, 7, 5);
        ctx.fillRect(cx + 5, y - 14, 7, 5);
        ctx.beginPath();
        ctx.moveTo(cx - 18, y + 12);
        ctx.lineTo(cx + 18, y + 12);
        ctx.stroke();
      } else if (st.phase === 2) {
        drawHeart(ctx, { x: cx - 42, y: y + 5, r: 18 }, false, "#ffffff");
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(cx + 14, y - 36, 52, 86);
      } else {
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, y - 12, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillRect(cx - 12, y - 17, 7, 6);
        ctx.fillRect(cx + 5, y - 17, 7, 6);
      }
      ctx.strokeStyle = st.phase === 1 ? "#55ff66" : st.boss.accent;
      ctx.beginPath();
      ctx.moveTo(cx - 64, y + 60);
      ctx.lineTo(cx + 64, y + 60);
      ctx.moveTo(cx, y - 40);
      ctx.lineTo(cx, y + 84);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawUtBullet(ctx, b) {
    ctx.save();
    ctx.fillStyle = b.color || "#fff";
    ctx.strokeStyle = b.color || "#fff";
    ctx.lineWidth = 3;
    if (b.type === "orb" || b.type === "sinOrb") {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffdf6e";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (b.type === "spear") {
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot || 0);
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(9, 9);
      ctx.lineTo(0, 15);
      ctx.lineTo(-9, 9);
      ctx.closePath();
      ctx.fill();
    } else if (b.type === "skull") {
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot || 0);
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(-7, -4, 5, 4);
      ctx.fillRect(2, -4, 5, 4);
      ctx.beginPath();
      ctx.moveTo(-7, 7);
      ctx.lineTo(7, 7);
      ctx.stroke();
    } else if (b.type === "boneSpike") {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - b.h / 2);
      ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2);
      ctx.lineTo(b.x - b.w / 2, b.y + b.h / 2);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.translate(b.x, b.y);
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      if (b.type === "bone" || b.type === "beam") {
        ctx.beginPath();
        ctx.arc(-b.w / 2, 0, Math.min(b.h / 2, 8), Math.PI / 2, Math.PI * 1.5);
        ctx.arc(b.w / 2, 0, Math.min(b.h / 2, 8), Math.PI * 1.5, Math.PI / 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawHeart(ctx, heart, blink, color) {
    if (blink && Math.floor(Date.now() / 90) % 2 === 0) return;
    var x = heart.x;
    var y = heart.y;
    var r = heart.r;
    ctx.save();
    ctx.fillStyle = color || "#ff2d78";
    ctx.shadowColor = color || "#ff2d78";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, y + r * 1.18);
    ctx.bezierCurveTo(x - r * 1.8, y, x - r, y - r * 1.45, x, y - r * 0.52);
    ctx.bezierCurveTo(x + r, y - r * 1.45, x + r * 1.8, y, x, y + r * 1.18);
    ctx.fill();
    ctx.restore();
  }

  function drawUtReadyText(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.72)";
    ctx.fillRect(UT_BOX.x + 8, UT_BOX.y + 38, UT_BOX.w - 16, 50);
    ctx.fillStyle = "#f9e84d";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("APERTE ENTER", UT_BOX.x + UT_BOX.w / 2, UT_BOX.y + 60);
    ctx.fillStyle = "#d8e0ff";
    ctx.font = "11px monospace";
    ctx.fillText("para iniciar", UT_BOX.x + UT_BOX.w / 2, UT_BOX.y + 78);
    ctx.restore();
  }

  function drawUtEndText(ctx, st) {
    ctx.save();
    ctx.fillStyle = st.result === "win" ? "#00f5c4" : "#ff2d78";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(st.result === "win" ? "VICTORY" : "GAME OVER", 260, 252);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#d8e0ff";
    ctx.fillText(st.result === "win" ? "ENTER para voltar" : "ENTER para tentar", 260, 276);
    ctx.restore();
  }

  document.addEventListener(
    "keyup",
    function (e) {
      if (Object.prototype.hasOwnProperty.call(utKeys, e.key)) utKeys[e.key] = false;
    },
    true,
  );

  /* =====================================================================
   LISTENER DE TECLADO
   ===================================================================== */
  var guard = false;

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.repeat) return;
      if (guard) return;
      guard = true;
      setTimeout(function () {
        guard = false;
      }, 0);

      var k = e.key;
      var target = e.target;
      var customInput =
        target && target.tagName === "INPUT" && SPECIAL_INPUTS.indexOf(target.id) !== -1;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        if (k === "F12") return;
        if (customInput) {
          if (handleSpecialInputKey(target, k)) {
            flashKeyHint(k);
            e.preventDefault();
            return;
          }
        }
        if (!customInput) return;
      }
      if (k === "F12") return;
      e.preventDefault();
      flashKeyHint(k);

      /* ── MODAL IDADE ── */
      if (telaAtiva === "modal-idade") {
        if (k === "ArrowLeft" || k === "ArrowRight") {
          modalIdadeSetFoco(1 - modalIdadeIdx);
          somNav();
        } else if (k === "Enter" || k === " ") {
          if (modalIdadeIdx === 0) {
            document.getElementById("age-yes").click();
          } else {
            somEsc();
            document.getElementById("age-modal").classList.remove("show");
            telaAtiva = TELA.HUB;
            pgSetFoco(pgIdx);
          }
        } else if (k === "Escape") {
          somEsc();
          document.getElementById("age-modal").classList.remove("show");
          telaAtiva = TELA.HUB;
          pgSetFoco(pgIdx);
        }
        return;
      }

      /* ── PLAYGROUND HUB ── */
      if (telaAtiva === TELA.HUB) {
        if (k === "ArrowLeft") {
          pgSetFoco(pgIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          pgSetFoco(pgIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          pgSelect();
        }
        return;
      }

      /* ── UNDERTALE HUB ── */
      if (telaAtiva === TELA.UNDERTALE) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.HUB);
          return;
        }
        if (k === "ArrowLeft") {
          utSetFoco(utIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          utSetFoco(utIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          utSelect();
        }
        return;
      }

      /* ── UNDERTALE BATTLE ── */
      if (telaAtiva === TELA.UT_BATTLE) {
        if (Object.prototype.hasOwnProperty.call(utKeys, k)) {
          utKeys[k] = true;
          return;
        }
        if (k === "Escape") {
          somEsc();
          irPara(TELA.UNDERTALE);
          return;
        }
        if (k === "Enter" || k === " ") {
          utStartOrContinue();
        }
        return;
      }

      /* ── CASINO HUB ── */
      if (telaAtiva === TELA.CASINO) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.HUB);
          return;
        }
        if (!casinoTicketUsado) {
          casinoFocusTicket();
          if (k === "Enter" || k === " ") {
            somMoeda();
            revealCasinoGames();
          }
          return;
        }
        if (k === "ArrowLeft") {
          casinoSetFoco(casinoIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          casinoSetFoco(casinoIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          casinoSelect();
        }
        return;
      }

      /* ── CAÇA-NÍQUEL ── */
      if (telaAtiva === TELA.SLOTS) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowUp" || k === "ArrowDown") {
          slotsSetFoco(1 - slotIdx);
          somNav();
          return;
        }
        if (slotIdx === 0 && k === "ArrowLeft") {
          adjustSlotBet(-10);
          somNav();
          return;
        }
        if (slotIdx === 0 && k === "ArrowRight") {
          adjustSlotBet(10);
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var btn = document.getElementById("btn-spin");
          if (btn && !btn.classList.contains("disabled")) btn.click();
        }
        return;
      }

      /* ── ROLETA ── */
      if (telaAtiva === TELA.ROULETTE) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowRight") {
          rltSetFoco(rltIdx + (k === "ArrowRight" ? 1 : -1));
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var id = rltControls[rltIdx];
          if (rltIdx === 0) {
            var input = document.getElementById(id);
            if (input) input.focus();
          } else {
            var btn = document.getElementById(id);
            if (btn) btn.click();
          }
          return;
        }
        return;
      }

      /* ── CRASH GAME ── */
      if (telaAtiva === TELA.CRASH) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.CASINO);
          return;
        }
        if (k === "ArrowLeft" || k === "ArrowRight") {
          crashSetFoco(crashIdx + (k === "ArrowRight" ? 1 : -1));
          somNav();
          return;
        }
        if (k === "Enter" || k === " ") {
          var id = crashControls[crashIdx];
          if (id === "crash-bet-input" || id === "crash-auto-input") {
            var input = document.getElementById(id);
            if (input) input.focus();
          } else if (id === "crash-auto-toggle") {
            var tog = document.getElementById(id);
            if (tog) tog.click();
          } else {
            var btn = document.getElementById(id);
            if (btn) btn.click();
          }
        }
        return;
      }

      /* ── ARCADE HUB ── */
      if (telaAtiva === TELA.ARCADE) {
        if (k === "Escape") {
          somEsc();
          resetArcade();
          irPara(TELA.HUB);
          return;
        }
        if (!coinUsada) {
          if (k === "Enter" || k === " ") inserirMoeda();
          return;
        }
        if (k === "ArrowLeft") {
          hubSetFoco(hubIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          hubSetFoco(hubIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          hubSelect();
        }
        return;
      }

      /* ── JOKENPÔ ─── */
      if (telaAtiva === TELA.JKP) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "Enter" && jkpEst.locked) {
          reiniciarJkp();
          return;
        }
        if (k === "ArrowLeft") {
          jkpSetFoco(jkpIdx - 1);
          somNav();
        } else if (k === "ArrowRight") {
          jkpSetFoco(jkpIdx + 1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          jkpConfirmar();
        }
        return;
      }

      /* ── DADOS ─── */
      if (telaAtiva === TELA.DADOS) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "Enter" || k === " ") {
          jogarDados();
        }
        return;
      }

      /* ── CARA OU COROA ─── */
      if (telaAtiva === TELA.CC) {
        if (k === "Escape") {
          somEsc();
          irPara(TELA.ARCADE);
          return;
        }
        if (k === "ArrowLeft") {
          ccSetFoco(0);
          somNav();
        } else if (k === "ArrowRight") {
          ccSetFoco(1);
          somNav();
        } else if (k === "Enter" || k === " ") {
          ccConfirmar();
        }
        return;
      }
    },
    true,
  );

  /* =====================================================================
   JOKENPÔ — Lógica
   ===================================================================== */
  var jkpEst = { v: 0, d: 0, e: 0, locked: false };
  var jkpOpts = ["pedra", "papel", "tesoura"];
  var jkpNomes = { pedra: "Pedra", papel: "Papel", tesoura: "Tesoura" };

  /* SVGs inline – solid filled para o painel VS */
  var SVG_Q =
    '<svg viewBox="0 0 60 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><text x="30" y="42" text-anchor="middle" font-size="34" font-family="monospace" opacity=".22">?</text></svg>';
  var SVG = {
    pedra:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 38 L15 25 L27 15 L42 18 L52 31 L47 45 L34 53 L18 49 Z" fill="currentColor"/><path d="M17 28 L28 34 M36 20 L31 33 M43 33 L33 45" stroke="rgba(5,3,14,.42)" stroke-width="2.4" stroke-linecap="round"/><path d="M15 25 L27 15 L42 18" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-linecap="round"/></svg>',
    tesoura:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="43" r="8" stroke="currentColor" stroke-width="4"/><circle cx="41" cy="43" r="8" stroke="currentColor" stroke-width="4"/><path d="M25 38 L49 13 M35 38 L11 13" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M30 35 L30 47" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    papel:
      '<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 7 H39 L50 18 V53 H16 Z" fill="rgba(157,92,255,.16)" stroke="currentColor" stroke-width="3"/><path d="M39 7 V19 H50" stroke="currentColor" stroke-width="3"/><path d="M23 29 H42 M23 37 H42 M23 45 H35" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  };

  function jkpWho(j, c) {
    if (j === c) return "draw";
    return { pedra: "tesoura", papel: "pedra", tesoura: "papel" }[j] === c ? "win" : "lose";
  }

  function atualizarJkp() {
    document.getElementById("jw").textContent = jkpEst.v;
    document.getElementById("jl").textContent = jkpEst.d;
    document.getElementById("jd").textContent = jkpEst.e;
  }

  function jogarJkp(escolha) {
    if (jkpEst.locked) return;
    jkpEst.locked = true;
    somNav();
    getJkpCards().forEach(function (c) {
      c.classList.remove("kb-focus");
      c.classList.toggle("selected", c.getAttribute("data-jkp") === escolha);
    });
    var cpu = jkpOpts[~~(Math.random() * 3)];
    var elJ = document.getElementById("jkp-pc");
    var elC = document.getElementById("jkp-ic");
    elJ.innerHTML = SVG[escolha];
    elJ.style.color = "var(--purple)";
    elJ.classList.remove("pop");
    void elJ.offsetWidth;
    elJ.classList.add("pop");
    elC.innerHTML = SVG_Q;
    elC.style.color = "var(--brite)";
    setTimeout(function () {
      elC.innerHTML = SVG[cpu];
      elC.style.color = "var(--pink)";
      elC.classList.remove("pop");
      void elC.offsetWidth;
      elC.classList.add("pop");
      var res = jkpWho(escolha, cpu);
      var elR = document.getElementById("jkp-result");
      elR.className = "result-box " + res;
      if (res === "win") {
        elR.innerHTML =
          "» VITÓRIA! «<div class='result-sub'>" +
          jkpNomes[escolha] +
          " vence " +
          jkpNomes[cpu] +
          "</div>";
        jkpEst.v++;
        somOk();
        confetti();
      } else if (res === "lose") {
        elR.innerHTML =
          "× DERROTA ×<div class='result-sub'>" +
          jkpNomes[cpu] +
          " vence " +
          jkpNomes[escolha] +
          "</div>";
        jkpEst.d++;
        somErro();
      } else {
        elR.innerHTML = "= EMPATE =<div class='result-sub'>Ambos: " + jkpNomes[escolha] + "</div>";
        jkpEst.e++;
        somDraw();
      }
      atualizarJkp();
      document.getElementById("jkp-new").style.display = "";
    }, 740);
  }

  function reiniciarJkp() {
    jkpEst.locked = false;
    somNav();
    getJkpCards().forEach(function (c) {
      c.classList.remove("selected", "kb-focus");
    });
    var elJ = document.getElementById("jkp-pc"),
      elC = document.getElementById("jkp-ic");
    elJ.innerHTML = SVG_Q;
    elJ.style.color = "var(--brite)";
    elC.innerHTML = SVG_Q;
    elC.style.color = "var(--brite)";
    var elR = document.getElementById("jkp-result");
    elR.className = "result-box idle";
    elR.innerHTML = "Faça sua escolha acima";
    document.getElementById("jkp-new").style.display = "none";
    jkpSetFoco(0);
  }

  /* =====================================================================
   DADOS — Lógica
   ===================================================================== */
  var dadoEst = { v: 0, d: 0, e: 0, rod: 0, girando: false };
  var dotMap = {
    1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    2: [1, 0, 0, 0, 0, 0, 0, 0, 1],
    3: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
    5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
    6: [1, 0, 1, 1, 0, 1, 1, 0, 1],
  };

  function renderDado(id, val) {
    var ds = document.getElementById(id).querySelectorAll(".dot"),
      m = dotMap[val];
    for (var i = 0; i < ds.length; i++) ds[i].classList.toggle("on", !!m[i]);
  }
  function atualizarDados() {
    document.getElementById("dw").textContent = dadoEst.v;
    document.getElementById("dl").textContent = dadoEst.d;
    document.getElementById("dd").textContent = dadoEst.e;
    document.getElementById("dr").textContent = dadoEst.rod;
    document.getElementById("ds").textContent = dadoEst.v + " : " + dadoEst.d;
  }
  function jogarDados() {
    if (dadoEst.girando) return;
    dadoEst.girando = true;
    somGiro();
    var btn = document.getElementById("btn-dados"),
      dP = document.getElementById("df-p"),
      dI = document.getElementById("df-i");
    btn.classList.add("disabled");
    dP.classList.remove("winner");
    dI.classList.remove("winner");
    dP.classList.add("rolling");
    dI.classList.add("rolling");
    var rol = setInterval(function () {
      var a = ~~(Math.random() * 6) + 1,
        b = ~~(Math.random() * 6) + 1;
      renderDado("df-p", a);
      renderDado("df-i", b);
      document.getElementById("dn-p").textContent = a;
      document.getElementById("dn-i").textContent = b;
    }, 75);
    setTimeout(function () {
      clearInterval(rol);
      dP.classList.remove("rolling");
      dI.classList.remove("rolling");
      var vJ = ~~(Math.random() * 6) + 1,
        vC = ~~(Math.random() * 6) + 1;
      renderDado("df-p", vJ);
      renderDado("df-i", vC);
      document.getElementById("dn-p").textContent = vJ;
      document.getElementById("dn-i").textContent = vC;
      dadoEst.rod++;
      var elR = document.getElementById("dados-res");
      if (vJ > vC) {
        dadoEst.v++;
        dP.classList.add("winner");
        elR.className = "result-box win";
        elR.innerHTML =
          "» JOGADOR VENCEU! «<div class='result-sub'>" + vJ + " &gt; " + vC + "</div>";
        somOk();
        confetti();
      } else if (vC > vJ) {
        dadoEst.d++;
        dI.classList.add("winner");
        elR.className = "result-box lose";
        elR.innerHTML = "× CPU VENCEU ×<div class='result-sub'>" + vC + " &gt; " + vJ + "</div>";
        somErro();
      } else {
        dadoEst.e++;
        elR.className = "result-box draw";
        elR.innerHTML = "= EMPATE =<div class='result-sub'>Ambos: " + vJ + "</div>";
        somDraw();
      }
      atualizarDados();
      dadoEst.girando = false;
      btn.classList.remove("disabled");
    }, 700);
  }

  /* Clique no botão dados via mouse */
  document.getElementById("btn-dados").addEventListener("click", jogarDados);

  /* =====================================================================
   CARA OU COROA — Lógica
   ===================================================================== */
  var ccEst = { v: 0, d: 0, girando: false };
  function atualizarCc() {
    document.getElementById("cw").textContent = ccEst.v;
    document.getElementById("cl").textContent = ccEst.d;
  }
  function jogarCc(escolha) {
    if (ccEst.girando) return;
    ccEst.girando = true;
    somGiro();
    var bC = document.getElementById("btn-cara"),
      bK = document.getElementById("btn-coroa");
    bC.classList.add("disabled");
    bK.classList.add("disabled");
    bC.classList.remove("kb-focus");
    bK.classList.remove("kb-focus");
    bC.classList.toggle("selected", escolha === "cara");
    bK.classList.toggle("selected", escolha === "coroa");
    var res = Math.random() < 0.5 ? "cara" : "coroa";
    var coin = document.getElementById("coin3d");
    coin.className = "coin3d";
    void coin.offsetWidth;
    coin.classList.add("flip-" + res);
    setTimeout(function () {
      var elR = document.getElementById("cc-result"),
        lbl = res === "cara" ? "CARA" : "COROA";
      if (escolha === res) {
        ccEst.v++;
        elR.className = "result-box win";
        elR.innerHTML = "» ACERTOU! «<div class='result-sub'>Resultado: " + lbl + "</div>";
        somOk();
        confetti();
      } else {
        ccEst.d++;
        elR.className = "result-box lose";
        elR.innerHTML = "× ERROU ×<div class='result-sub'>Resultado: " + lbl + "</div>";
        somErro();
      }
      atualizarCc();
      setTimeout(function () {
        ccEst.girando = false;
        bC.classList.remove("disabled", "selected");
        bK.classList.remove("disabled", "selected");
        coin.className = "coin3d";
        elR.className = "result-box idle";
        elR.innerHTML = "Escolha CARA ou COROA acima";
        ccSetFoco(0);
      }, 2500);
    }, 1600);
  }

  /* =====================================================================
   CASINO JS — VARIAVEL DE DIFICULDADE
   0   = impossivel ganhar (casa sempre vence)
   0.5 = balanceado (resultado justo e aleatorio)
   1   = ganho garantido e alto (jogador sempre vence)
   ===================================================================== */
  var WIN_DIFFICULTY = 0.5;

  function calcWinChance(base) {
    if (WIN_DIFFICULTY <= 0) return 0;
    if (WIN_DIFFICULTY >= 1) return 1;
    return base + (WIN_DIFFICULTY - 0.5) * 2 * (1 - base) * 0.8;
  }

  var casinoSaldo = 500;
  function atualizarSaldo(delta) {
    casinoSaldo = Math.max(0, casinoSaldo + delta);
    var s = "$" + casinoSaldo;
    ["casino-bal-hero", "slots-bal", "slots-bal2", "rlt-bal", "crash-bal"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = s;
    });
  }

  var ageModal = document.getElementById("age-modal");

  var ageYesBtn = document.getElementById("age-yes");
  if (ageYesBtn) {
    ageYesBtn.addEventListener("click", function () {
      somOk();
      ageModal.classList.remove("show");
      atualizarSaldo(0);
      if (pendingCasinoEntry) {
        abrirCasinoEntrada();
        pendingCasinoEntry = false;
      } else {
        abrirCasinoEntrada();
      }
    });
  }
  var ageNoBtn = document.getElementById("age-no");
  if (ageNoBtn) {
    ageNoBtn.addEventListener("click", function () {
      somEsc();
      ageModal.classList.remove("show");
      telaAtiva = TELA.HUB;
      pgSetFoco(pgIdx);
    });
  }
  /* casino-back handled by central nav-back listener */
  /* slots-back handled by central nav-back listener */
  /* rlt-back handled by central nav-back listener */
  /* crash-back handled by central nav-back listener */
  document.querySelectorAll(".ccard").forEach(function (card) {
    card.addEventListener("click", function () {
      if (!casinoTicketUsado) return;
      var g = card.getAttribute("data-goto");
      if (g) {
        somNav();
        irPara(g);
      }
    });
  });
  var btnTicket = document.getElementById("btn-ticket");
  if (btnTicket) {
    btnTicket.addEventListener("click", function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      somMoeda();
      revealCasinoGames();
    });
  }

  /* CACA-NIQUEL */
  var SLOT_SYMS = ["L", "C", "B", "S", "D", "J"];
  var SLOT_DISP = {
    L: String.fromCodePoint(0x1f34b),
    C: String.fromCodePoint(0x1f352),
    B: String.fromCodePoint(0x1f514),
    S: String.fromCodePoint(0x2b50),
    D: String.fromCodePoint(0x1f48e),
    J: String.fromCodePoint(0x1f3b0),
  };
  var SLOT_PAYS = { L: 3, C: 5, B: 10, S: 8, D: 20, J: 50 };
  var slotSpinning = false;
  ["reel-0", "reel-1", "reel-2"].forEach(function (id, idx) {
    var el = document.getElementById(id);
    if (el) el.textContent = SLOT_DISP[["C", "L", "B"][idx]];
  });
  function slotRandom() {
    var w = [30, 24, 18, 13, 9, 6];
    if (WIN_DIFFICULTY > 0.5) {
      var b = (WIN_DIFFICULTY - 0.5) * 2;
      w[5] = Math.round(6 + b * 44);
      w[4] = Math.round(9 + b * 21);
    } else if (WIN_DIFFICULTY < 0.5) {
      var n = (0.5 - WIN_DIFFICULTY) * 2;
      w[5] = Math.max(1, Math.round(6 - n * 5));
      w[0] = Math.round(30 + n * 20);
    }
    var tot = w.reduce(function (a, v) {
        return a + v;
      }, 0),
      r = Math.random() * tot,
      acc = 0;
    for (var i = 0; i < SLOT_SYMS.length; i++) {
      acc += w[i];
      if (r < acc) return SLOT_SYMS[i];
    }
    return SLOT_SYMS[0];
  }
  function jogarSlots() {
    if (slotSpinning) return;
    if (casinoSaldo < slotBet) {
      document.getElementById("slot-msg").textContent = "Saldo insuficiente!";
      return;
    }
    atualizarSaldo(-slotBet);
    slotSpinning = true;
    somGiro();
    document.getElementById("btn-spin").classList.add("disabled");
    var rs = [
      document.getElementById("reel-0"),
      document.getElementById("reel-1"),
      document.getElementById("reel-2"),
    ];
    var res = [];
    var msg = document.getElementById("slot-msg");
    msg.textContent = "Girando...";
    msg.style.color = "var(--muted)";
    rs.forEach(function (r) {
      r.classList.add("spin");
    });
    var iv = setInterval(function () {
      rs.forEach(function (r) {
        r.textContent = SLOT_DISP[SLOT_SYMS[~~(Math.random() * 6)]];
      });
    }, 80);
    [380, 580, 780].forEach(function (delay, idx) {
      setTimeout(function () {
        res[idx] = slotRandom();
        rs[idx].textContent = SLOT_DISP[res[idx]];
        rs[idx].classList.remove("spin");
        bipe(440 + idx * 110, "sine", 0.08, 0.12);
        if (idx === 2) {
          clearInterval(iv);
          setTimeout(function () {
            var r0 = res[0],
              r1 = res[1],
              r2 = res[2],
              payout = 0;
            if (r0 === r1 && r1 === r2) {
              payout = 10 * SLOT_PAYS[r0];
              msg.textContent = (r0 === "J" ? "JACKPOT! +$" : "TRES IGUAIS! +$") + payout;
              msg.style.color = "var(--yellow)";
              confetti();
              somOk();
            } else if (r0 === r1 || r1 === r2 || r0 === r2) {
              payout = 15;
              msg.textContent = "Par! +$" + payout;
              msg.style.color = "var(--cyan)";
              bipe(523, "sine", 0.12, 0.14);
            } else {
              msg.textContent = "Sem sorte!";
              msg.style.color = "var(--muted)";
              somErro();
            }
            if (payout > 0) atualizarSaldo(payout);
            slotSpinning = false;
            document.getElementById("btn-spin").classList.remove("disabled");
          }, 220);
        }
      }, delay);
    });
  }
  document.getElementById("btn-spin").addEventListener("click", jogarSlots);

  /* ROLETA */
  var RLT_NUMS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
    31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];
  var RLT_RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  var RLT_COL = {};
  RLT_NUMS.forEach(function (n) {
    RLT_COL[n] = n === 0 ? "g" : RLT_RED.indexOf(n) >= 0 ? "r" : "b";
  });
  var rltCvs = document.getElementById("roulette-canvas"),
    rltCtx = rltCvs.getContext("2d");
  var rltAngle = 0,
    rltSpin = false,
    rltChoice = null;
  function normAngle(a) {
    var t = Math.PI * 2;
    return ((a % t) + t) % t;
  }
  function resizeRoulette() {
    var wrap = rltCvs.parentElement;
    var size = Math.round((wrap && wrap.clientWidth) || 280);
    rltCvs.width = size;
    rltCvs.height = size;
    drawWheel(rltAngle);
  }
  function drawWheel(a) {
    var size = rltCvs.width || 280,
      cx = size / 2,
      cy = size / 2,
      R = size / 2 - 3,
      ri = size * 0.27,
      seg = (Math.PI * 2) / 37;
    rltCtx.clearRect(0, 0, size, size);
    RLT_NUMS.forEach(function (n, i) {
      var s = a + i * seg - Math.PI / 2,
        e = s + seg,
        col = RLT_COL[n];
      rltCtx.beginPath();
      rltCtx.moveTo(cx, cy);
      rltCtx.arc(cx, cy, R, s, e);
      rltCtx.closePath();
      rltCtx.fillStyle = col === "g" ? "#2e7d32" : col === "r" ? "#c62828" : "#1a1a2e";
      rltCtx.fill();
      rltCtx.strokeStyle = "rgba(255,255,255,.1)";
      rltCtx.lineWidth = 1;
      rltCtx.stroke();
      var ma = s + seg / 2,
        tx = cx + (R - size * 0.1) * Math.cos(ma),
        ty = cy + (R - size * 0.1) * Math.sin(ma);
      rltCtx.save();
      rltCtx.translate(tx, ty);
      rltCtx.rotate(ma + Math.PI / 2);
      rltCtx.fillStyle = "#fff";
      rltCtx.font = "bold " + Math.max(8, Math.round(size * 0.032)) + "px monospace";
      rltCtx.textAlign = "center";
      rltCtx.textBaseline = "middle";
      rltCtx.fillText(n, 0, 0);
      rltCtx.restore();
    });
    rltCtx.beginPath();
    rltCtx.arc(cx, cy, R, 0, Math.PI * 2);
    rltCtx.strokeStyle = "#c8a400";
    rltCtx.lineWidth = 3;
    rltCtx.stroke();
    rltCtx.beginPath();
    rltCtx.arc(cx, cy, ri, 0, Math.PI * 2);
    rltCtx.fillStyle = "#0c0820";
    rltCtx.fill();
    rltCtx.strokeStyle = "#3a2a70";
    rltCtx.lineWidth = 2;
    rltCtx.stroke();
  }
  resizeRoulette();
  window.addEventListener("resize", resizeRoulette);
  ["rc-red", "rc-black", "rc-green"].forEach(function (id) {
    document.getElementById(id).addEventListener("click", function () {
      if (rltSpin) return;
      document.querySelectorAll(".rc-btn").forEach(function (b) {
        b.classList.remove("selected");
      });
      document.getElementById(id).classList.add("selected");
      rltChoice = id === "rc-red" ? "r" : id === "rc-black" ? "b" : "g";
      somNav();
    });
  });
  document.getElementById("btn-spin-rlt").addEventListener("click", function () {
    if (rltSpin || !rltChoice) {
      if (!rltChoice)
        document.getElementById("rlt-result").textContent = "Escolha uma cor primeiro!";
      return;
    }
    var bet = Math.min(parseInt(document.getElementById("rlt-bet-input").value) || 20, casinoSaldo);
    if (casinoSaldo < 1) return;
    atualizarSaldo(-bet);
    rltSpin = true;
    somGiro();
    document.getElementById("btn-spin-rlt").classList.add("disabled");
    document.getElementById("rlt-num").textContent = "...";
    var pool, landed;
    if (Math.random() < calcWinChance(0.46)) {
      pool = RLT_NUMS.filter(function (n) {
        return RLT_COL[n] === rltChoice;
      });
    } else {
      pool = RLT_NUMS.filter(function (n) {
        return RLT_COL[n] !== rltChoice;
      });
    }
    landed = pool[~~(Math.random() * pool.length)];
    var li = RLT_NUMS.indexOf(landed),
      seg = (Math.PI * 2) / 37,
      turn = Math.PI * 2;
    var desired = normAngle(-(li * seg) - seg / 2);
    var delta = desired - normAngle(rltAngle);
    while (delta < 0) delta += turn;
    var totalSpin = turn * 7 + delta,
      targetAngle = rltAngle + totalSpin;
    var dur = 3800,
      st = null,
      sa = rltAngle;
    function animR(ts) {
      if (!st) st = ts;
      var p = Math.min(1, (ts - st) / dur),
        ease = 1 - Math.pow(1 - p, 4);
      rltAngle = sa + totalSpin * ease;
      drawWheel(rltAngle);
      if (p < 1) {
        requestAnimationFrame(animR);
        return;
      }
      rltAngle = targetAngle;
      drawWheel(rltAngle);
      var win = RLT_COL[landed] === rltChoice,
        mult = rltChoice === "g" ? 14 : 2,
        gain = win ? bet * mult : 0;
      if (win) {
        atualizarSaldo(gain);
        confetti();
        somOk();
      } else {
        somErro();
      }
      var clab = RLT_COL[landed] === "r" ? "VERMELHO" : RLT_COL[landed] === "b" ? "PRETO" : "VERDE";
      var el = document.getElementById("rlt-result");
      el.textContent =
        (win ? "GANHOU! +$" + gain + " - " : "PERDEU - ") + clab + " (" + landed + ")";
      el.style.color = win ? "var(--cyan)" : "var(--pink)";
      el.style.borderColor = win ? "var(--cyan)" : "var(--pink)";
      document.getElementById("rlt-num").textContent = landed;
      document.getElementById("rlt-num").style.color =
        RLT_COL[landed] === "r" ? "#e53935" : RLT_COL[landed] === "b" ? "#bbb" : "#43a047";
      var chip = document.createElement("div");
      chip.className = "rh-chip " + RLT_COL[landed];
      chip.textContent = landed;
      var hist = document.getElementById("rlt-history");
      hist.insertBefore(chip, hist.firstChild);
      if (hist.children.length > 14) hist.removeChild(hist.lastChild);
      rltSpin = false;
      document.getElementById("btn-spin-rlt").classList.remove("disabled");
    }
    requestAnimationFrame(animR);
  });

  /* CRASH */
  var crCvs = document.getElementById("crash-canvas"),
    crCtx = crCvs.getContext("2d");
  var crSt = {
    running: false,
    busted: false,
    mult: 1,
    crashAt: 2,
    bet: 0,
    cashedOut: false,
    autoAt: Infinity,
    autoEnabled: false,
  };
  var crPts = [];
  function resizeCr() {
    crCvs.width = crCvs.parentElement.clientWidth || 580;
    crCvs.height = window.innerWidth > 700 ? 300 : 240;
    drawCrash();
  }
  resizeCr();
  window.addEventListener("resize", resizeCr);
  function drawCrash() {
    var W = crCvs.width,
      H = crCvs.height;
    crCtx.clearRect(0, 0, W, H);
    crCtx.fillStyle = "#0c0820";
    crCtx.fillRect(0, 0, W, H);
    crCtx.strokeStyle = "rgba(100,80,255,.07)";
    crCtx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 60) {
      crCtx.beginPath();
      crCtx.moveTo(gx, 0);
      crCtx.lineTo(gx, H);
      crCtx.stroke();
    }
    for (var gy = 0; gy < H; gy += 40) {
      crCtx.beginPath();
      crCtx.moveTo(0, gy);
      crCtx.lineTo(W, gy);
      crCtx.stroke();
    }
    if (crPts.length < 2) return;
    var bust = crSt.busted,
      grad = crCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, bust ? "rgba(255,45,120,.3)" : "rgba(0,245,196,.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    crCtx.beginPath();
    crCtx.moveTo(crPts[0].x, H);
    crPts.forEach(function (p) {
      crCtx.lineTo(p.x, p.y);
    });
    crCtx.lineTo(crPts[crPts.length - 1].x, H);
    crCtx.closePath();
    crCtx.fillStyle = grad;
    crCtx.fill();
    crCtx.beginPath();
    crPts.forEach(function (p, i) {
      i === 0 ? crCtx.moveTo(p.x, p.y) : crCtx.lineTo(p.x, p.y);
    });
    crCtx.strokeStyle = bust ? "#ff2d78" : "#00f5c4";
    crCtx.lineWidth = 3;
    crCtx.lineJoin = "round";
    crCtx.stroke();
    var last = crPts[crPts.length - 1];
    crCtx.beginPath();
    crCtx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    crCtx.fillStyle = bust ? "#ff2d78" : "#00f5c4";
    crCtx.shadowColor = bust ? "#ff2d78" : "#00f5c4";
    crCtx.shadowBlur = 12;
    crCtx.fill();
    crCtx.shadowBlur = 0;
  }
  function genCrashPt() {
    var mn = 1.05 + WIN_DIFFICULTY * 0.8,
      mx = 1.5 + WIN_DIFFICULTY * 25;
    return parseFloat((mn + Math.random() * (mx - mn)).toFixed(2));
  }
  function startCrash() {
    var bet = Math.min(
      parseInt(document.getElementById("crash-bet-input").value) || 50,
      casinoSaldo,
    );
    var autoOn = isCrashAutoEnabled();
    var autoAt = autoOn
      ? clampNumber(parseFloat(document.getElementById("crash-auto-input").value) || 2.0, 1.1, 100)
      : Infinity;
    if (casinoSaldo < 1 || bet < 1) {
      document.getElementById("crash-result").textContent = "Saldo insuficiente!";
      return;
    }
    atualizarSaldo(-bet);
    crSt = {
      running: true,
      busted: false,
      mult: 1.0,
      crashAt: genCrashPt(),
      bet: bet,
      cashedOut: false,
      autoAt: autoAt,
      autoEnabled: autoOn,
    };
    crPts = [];
    document.getElementById("crash-mult").className = "crash-mult-overlay";
    document.getElementById("btn-crash-bet").classList.add("disabled");
    document.getElementById("btn-crash-out").classList.remove("disabled");
    document.getElementById("btn-crash-out").textContent = "SACAR";
    document.getElementById("crash-result").textContent = autoOn
      ? "Multiplicador subindo... auto-saque em " + autoAt.toFixed(1) + "x"
      : "Multiplicador subindo... Saque a tempo!";
    document.getElementById("crash-result").style.color = "var(--muted)";
    document.getElementById("crash-result").style.borderColor = "";
    somGiro();
    var elapsed = 0,
      speed = 40,
      W = crCvs.width,
      H = crCvs.height;
    function tick() {
      if (!crSt.running) return;
      elapsed += speed;
      var t = elapsed / 1000;
      crSt.mult = parseFloat(Math.pow(Math.E, 0.42 * t).toFixed(2));
      var xR = Math.min(elapsed / 8000, 1),
        yR = Math.min((crSt.mult - 1) / Math.max(crSt.crashAt, 3), 1);
      crPts.push({ x: 20 + xR * (W - 40), y: H - 20 - yR * (H - 40) });
      drawCrash();
      document.getElementById("crash-mult").textContent = crSt.mult.toFixed(2) + "x";
      if (
        crSt.autoEnabled &&
        !crSt.cashedOut &&
        crSt.autoAt < crSt.crashAt &&
        crSt.mult >= crSt.autoAt
      ) {
        cashoutCrash(true);
      }
      if (crSt.mult >= crSt.crashAt) {
        crSt.running = false;
        crSt.busted = true;
        drawCrash();
        document.getElementById("crash-mult").classList.add("crashed");
        document.getElementById("crash-mult").textContent = crSt.crashAt.toFixed(2) + "x CRASH!";
        if (!crSt.cashedOut) {
          somErro();
          document.getElementById("crash-result").textContent =
            "CRASH em " + crSt.crashAt.toFixed(2) + "x - Perdeu $" + bet;
          document.getElementById("crash-result").style.color = "var(--pink)";
          document.getElementById("crash-result").style.borderColor = "var(--pink)";
        }
        addCrChip(crSt.crashAt);
        document.getElementById("btn-crash-bet").classList.remove("disabled");
        document.getElementById("btn-crash-out").classList.add("disabled");
        document.getElementById("btn-crash-out").textContent = "SACAR";
        return;
      }
      setTimeout(tick, speed);
    }
    setTimeout(tick, speed);
  }
  function finishCrashRound() {
    crSt.running = false;
    document.getElementById("btn-crash-bet").classList.remove("disabled");
    document.getElementById("btn-crash-out").classList.add("disabled");
  }
  function cashoutCrash(auto) {
    if (!crSt.running || crSt.cashedOut || crSt.busted) return;
    crSt.cashedOut = true;
    var gain = Math.floor(crSt.bet * crSt.mult);
    atualizarSaldo(gain);
    somOk();
    confetti();
    document.getElementById("crash-result").textContent =
      (auto ? "Auto-saque em " : "Sacou em ") + crSt.mult.toFixed(2) + "x - Ganhou $" + gain + "!";
    document.getElementById("crash-result").style.color = "var(--cyan)";
    document.getElementById("crash-result").style.borderColor = "var(--cyan)";
    document.getElementById("btn-crash-bet").classList.add("disabled");
    document.getElementById("btn-crash-out").classList.add("disabled");
    document.getElementById("btn-crash-out").textContent = "SACOU";
  }
  function addCrChip(m) {
    var ch = document.createElement("div");
    ch.className = "cr-chip " + (m < 1.5 ? "low" : m < 3 ? "mid" : "high");
    ch.textContent = m.toFixed(2) + "x";
    var h = document.getElementById("crash-history");
    h.insertBefore(ch, h.firstChild);
    if (h.children.length > 10) h.removeChild(h.lastChild);
  }
  document.getElementById("btn-crash-bet").addEventListener("click", function () {
    if (!crSt.running) startCrash();
  });
  document.getElementById("btn-crash-out").addEventListener("click", cashoutCrash);
  drawCrash();
})();
