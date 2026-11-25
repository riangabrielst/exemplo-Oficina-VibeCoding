/**
 * LuthierAI / Reparo de Cordas
 * Simulador de diagnóstico, orçamento e comparador de peças/ferramentas em JavaScript puro.
 */

const STORAGE_KEY = "luthierai_history_v1";
const THEME_KEY = "luthierai_theme_v1";

// Catálogo base de instrumentos
const INSTRUMENTS = {
  violao: { label: "Violão", laborBase: 140 },
  guitarra: { label: "Guitarra Elétrica", laborBase: 150 },
  baixo: { label: "Contrabaixo", laborBase: 160 },
  ukulele: { label: "Ukulele", laborBase: 95 },
  violino: { label: "Violino", laborBase: 180 },
  viola_caipira: { label: "Viola Caipira", laborBase: 145 },
  cavaquinho: { label: "Cavaquinho", laborBase: 90 },
};

// Catálogo de peças e ferramentas com ofertas comparativas (fáceis de editar/expandir)
const CATALOG = {
  cordas_aco: {
    id: "cordas_aco",
    name: "Jogo de Cordas para Violão Aço (.011 / .012)",
    kind: "Peça",
    priority: 1,
    offers: [
      { store: "Mercado Livre (Busca)", price: 48, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/encordoamento-violao-aco" },
      { store: "Shopee (Busca)", price: 39, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=encordoamento%20violao%20aco" },
      { store: "Amazon Brasil (Busca)", price: 56, rating: "4.9 ★", url: "https://www.amazon.com.br/s?k=encordoamento+violao+aco" },
    ],
  },
  cordas_guitarra: {
    id: "cordas_guitarra",
    name: "Jogo de Cordas para Guitarra (.009 ou .010)",
    kind: "Peça",
    priority: 1,
    offers: [
      { store: "Mercado Livre (Busca)", price: 45, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/cordas-guitarra-010" },
      { store: "Shopee (Busca)", price: 36, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=cordas%20guitarra" },
      { store: "Amazon Brasil (Busca)", price: 52, rating: "4.8 ★", url: "https://www.amazon.com.br/s?k=cordas+guitarra+eletrica" },
    ],
  },
  cola_titebond: {
    id: "cola_titebond",
    name: "Cola Titebond Original / II para Madeira",
    kind: "Peça / Insumo",
    priority: 1,
    offers: [
      { store: "Mercado Livre (Busca)", price: 64, rating: "4.9 ★", url: "https://lista.mercadolivre.com.br/cola-titebond" },
      { store: "Amazon Brasil (Busca)", price: 69, rating: "4.9 ★", url: "https://www.amazon.com.br/s?k=cola+titebond" },
      { store: "Shopee (Busca)", price: 58, rating: "4.7 ★", url: "https://shopee.com.br/search?keyword=cola%20titebond" },
    ],
  },
  nut_rastilho: {
    id: "nut_rastilho",
    name: "Pestana (Nut) e Rastilho (Osso / Tusq / Plástico)",
    kind: "Peça",
    priority: 2,
    offers: [
      { store: "Mercado Livre (Busca)", price: 28, rating: "4.7 ★", url: "https://lista.mercadolivre.com.br/nut-rastilho-violao" },
      { store: "Shopee (Busca)", price: 22, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=nut%20rastilho%20violao" },
      { store: "Amazon Brasil (Busca)", price: 34, rating: "4.7 ★", url: "https://www.amazon.com.br/s?k=nut+rastilho+instrumento" },
    ],
  },
  tarraxas: {
    id: "tarraxas",
    name: "Conjunto de Tarraxas de Reposição",
    kind: "Peça",
    priority: 2,
    offers: [
      { store: "Mercado Livre (Busca)", price: 75, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/tarraxas-reposicao" },
      { store: "Shopee (Busca)", price: 59, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=tarraxas%20reposicao" },
      { store: "Amazon Brasil (Busca)", price: 84, rating: "4.8 ★", url: "https://www.amazon.com.br/s?k=tarraxas+reposicao" },
    ],
  },
  eletrica_kit: {
    id: "eletrica_kit",
    name: "Potenciômetros, Jack e Fio Blindado para Luteria",
    kind: "Peça",
    priority: 2,
    offers: [
      { store: "Mercado Livre (Busca)", price: 55, rating: "4.7 ★", url: "https://lista.mercadolivre.com.br/kit-eletrica-guitarra-baixo" },
      { store: "Shopee (Busca)", price: 42, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=potenciometro%20jack%20guitarra" },
      { store: "Amazon Brasil (Busca)", price: 62, rating: "4.7 ★", url: "https://www.amazon.com.br/s?k=jack+potenciometro+guitarra" },
    ],
  },
  encordoador_alicate: {
    id: "encordoador_alicate",
    name: "Encordoador com Cortador de Cordas",
    kind: "Ferramenta",
    priority: 3,
    offers: [
      { store: "Shopee (Busca)", price: 24, rating: "4.7 ★", url: "https://shopee.com.br/search?keyword=encordoador%20cortador%20cordas" },
      { store: "Mercado Livre (Busca)", price: 32, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/encordoador-alicate-cordas" },
      { store: "Amazon Brasil (Busca)", price: 36, rating: "4.7 ★", url: "https://www.amazon.com.br/s?k=encordoador+cordas" },
    ],
  },
  grampos_lixas: {
    id: "grampos_lixas",
    name: "Grampos Sargento / Tipo C + Kit Lixas Madeira",
    kind: "Ferramenta",
    priority: 3,
    offers: [
      { store: "Mercado Livre (Busca)", price: 68, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/grampo-sargento-lixas-madeira" },
      { store: "Amazon Brasil (Busca)", price: 74, rating: "4.8 ★", url: "https://www.amazon.com.br/s?k=grampo+sargento+marcenaria" },
      { store: "Shopee (Busca)", price: 54, rating: "4.6 ★", url: "https://shopee.com.br/search?keyword=grampo%20sargento%20madeira" },
    ],
  },
  regua_chaves: {
    id: "regua_chaves",
    name: "Régua de Ação de Cordas + Chaves Allen / Luthier",
    kind: "Ferramenta",
    priority: 3,
    offers: [
      { store: "Shopee (Busca)", price: 46, rating: "4.8 ★", url: "https://shopee.com.br/search?keyword=regua%20acao%20cordas%20luthier" },
      { store: "Mercado Livre (Busca)", price: 58, rating: "4.8 ★", url: "https://lista.mercadolivre.com.br/regua-acao-cordas-luthier" },
      { store: "Amazon Brasil (Busca)", price: 63, rating: "4.7 ★", url: "https://www.amazon.com.br/s?k=regua+acao+cordas" },
    ],
  },
};

// Mapeamento de danos para itens recomendados e multiplicadores
const DAMAGE_PROFILES = {
  headstock: {
    label: "Braço / Headstock",
    description: "Trinca ou fratura na região do headstock ou junção do braço.",
    items: ["cola_titebond", "grampos_lixas", "encordoador_alicate"],
    laborMultiplier: 1.6,
  },
  tampo: {
    label: "Tampo / Corpo",
    description: "Rachadura no tampo, emenda aberta ou dano estrutural no corpo.",
    items: ["cola_titebond", "grampos_lixas"],
    laborMultiplier: 1.5,
  },
  ponte: {
    label: "Ponte / Cavalete",
    description: "Cavalete levantando/descolando ou rastilho desgastado.",
    items: ["cola_titebond", "nut_rastilho", "grampos_lixas"],
    laborMultiplier: 1.35,
  },
  trastes: {
    label: "Trastes / Escala",
    description: "Trastes gastos, marcados ou gerando trastejamento.",
    items: ["regua_chaves", "cordas_aco"],
    laborMultiplier: 1.25,
  },
  tarraxas: {
    label: "Tarraxas / Pestana",
    description: "Tarraxas frouxas/engripadas ou sulcos gastos na pestana (nut).",
    items: ["tarraxas", "nut_rastilho", "encordoador_alicate"],
    laborMultiplier: 1.0,
  },
  eletrica: {
    label: "Elétrica / Captadores",
    description: "Mau contato, chiado, potenciômetro ruidoso ou jack solto.",
    items: ["eletrica_kit", "regua_chaves"],
    laborMultiplier: 1.1,
  },
  cordas: {
    label: "Cordas / Regulagem",
    description: "Cordas oxidadas/arrebentadas ou altura de cordas (ação) desregulada.",
    items: ["cordas_aco", "regua_chaves", "encordoador_alicate"],
    laborMultiplier: 0.75,
  },
};

const SEVERITY_CONFIG = {
  leve: { label: "Leve", multiplier: 0.85 },
  moderado: { label: "Moderado", multiplier: 1.15 },
  severo: { label: "Severo", multiplier: 1.55 },
};

// Estado da aplicação
let uploadedFiles = [];
let currentAnalysis = null;
let sortCheapest = false;
let onlyAffordable = false;

// Elementos do DOM
const els = {
  dropZone: document.getElementById("dropZone"),
  fileInput: document.getElementById("fileInput"),
  previewGrid: document.getElementById("previewGrid"),
  imageMetaInfo: document.getElementById("imageMetaInfo"),
  clearImagesBtn: document.getElementById("clearImagesBtn"),
  analysisForm: document.getElementById("analysisForm"),
  budgetInput: document.getElementById("budgetInput"),
  experienceSelect: document.getElementById("experienceSelect"),
  instrumentSelect: document.getElementById("instrumentSelect"),
  regionSelect: document.getElementById("regionSelect"),
  severitySelect: document.getElementById("severitySelect"),
  notesInput: document.getElementById("notesInput"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  progressCard: document.getElementById("progressCard"),
  progressLabel: document.getElementById("progressLabel"),
  progressPercent: document.getElementById("progressPercent"),
  progressFill: document.getElementById("progressFill"),
  stepsList: document.getElementById("stepsList"),
  resultCard: document.getElementById("resultCard"),
  detectedInstrumentBadge: document.getElementById("detectedInstrumentBadge"),
  resultTitle: document.getElementById("resultTitle"),
  budgetStatusBadge: document.getElementById("budgetStatusBadge"),
  damageSummary: document.getElementById("damageSummary"),
  luthierTotalCost: document.getElementById("luthierTotalCost"),
  luthierLaborNote: document.getElementById("luthierLaborNote"),
  diyTotalCost: document.getElementById("diyTotalCost"),
  diyBreakdownNote: document.getElementById("diyBreakdownNote"),
  userBudgetDisplay: document.getElementById("userBudgetDisplay"),
  budgetDiffNote: document.getElementById("budgetDiffNote"),
  priorityBox: document.getElementById("priorityBox"),
  itemsList: document.getElementById("itemsList"),
  onlyAffordableToggle: document.getElementById("onlyAffordableToggle"),
  sortCheapestBtn: document.getElementById("sortCheapestBtn"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
};

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getBestOffer(item) {
  return [...item.offers].sort((a, b) => a.price - b.price)[0];
}

// --- Tema ---
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") {
    document.body.classList.add("dark");
    els.themeToggleBtn.textContent = "☀️ Tema Claro";
  }
}

els.themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  els.themeToggleBtn.textContent = isDark ? "☀️ Tema Claro" : "🌙 Tema Escuro";
});

// --- Upload de Imagens ---
function handleFiles(fileList) {
  const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
  if (!incoming.length) return;

  incoming.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        uploadedFiles.push({
          name: file.name,
          sizeKB: Math.round(file.size / 1024),
          width: img.width,
          height: img.height,
          dataUrl: ev.target.result,
        });
        renderPreviews();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPreviews() {
  els.previewGrid.innerHTML = "";
  uploadedFiles.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.innerHTML = `
      <img src="${item.dataUrl}" alt="Prévia ${idx + 1}: ${item.name}" />
      <button type="button" class="preview-item__remove" title="Remover foto" aria-label="Remover foto ${idx + 1}">×</button>
    `;
    div.querySelector("button").addEventListener("click", () => {
      uploadedFiles.splice(idx, 1);
      renderPreviews();
    });
    els.previewGrid.appendChild(div);
  });

  const hasFiles = uploadedFiles.length > 0;
  els.clearImagesBtn.disabled = !hasFiles;
  if (!hasFiles) {
    els.imageMetaInfo.textContent = "Nenhuma imagem carregada (modo simulação ativo)";
  } else {
    const first = uploadedFiles[0];
    els.imageMetaInfo.textContent = `${uploadedFiles.length} foto(s) • Principal: ${first.width}×${first.height}px (${first.sizeKB} KB)`;
  }
}

els.dropZone.addEventListener("click", () => els.fileInput.click());
els.dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    els.fileInput.click();
  }
});
els.fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

["dragenter", "dragover"].forEach((evt) => {
  els.dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    els.dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((evt) => {
  els.dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    els.dropZone.classList.remove("dragover");
    if (evt === "drop" && e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  });
});

els.clearImagesBtn.addEventListener("click", () => {
  uploadedFiles = [];
  els.fileInput.value = "";
  renderPreviews();
});

// --- Detecção Heurística + Gancho para API Real ---
function inferInstrumentAndDamage() {
  const combinedText = [
    ...uploadedFiles.map((f) => f.name),
    els.notesInput.value,
  ]
    .join(" ")
    .toLowerCase();

  let instrumentKey = els.instrumentSelect.value;
  if (instrumentKey === "auto") {
    if (combinedText.includes("guitar")) instrumentKey = "guitarra";
    else if (combinedText.includes("baixo") || combinedText.includes("bass")) instrumentKey = "baixo";
    else if (combinedText.includes("ukulele")) instrumentKey = "ukulele";
    else if (combinedText.includes("violin")) instrumentKey = "violino";
    else if (combinedText.includes("viola") || combinedText.includes("caipira")) instrumentKey = "viola_caipira";
    else if (combinedText.includes("cavaquinho") || combinedText.includes("cavaco")) instrumentKey = "cavaquinho";
    else instrumentKey = "violao";
  }

  let regionKey = els.regionSelect.value;
  if (regionKey === "auto") {
    if (combinedText.includes("headstock") || combinedText.includes("mao") || combinedText.includes("quebr")) {
      regionKey = "headstock";
    } else if (combinedText.includes("cavalete") || combinedText.includes("ponte") || combinedText.includes("descol")) {
      regionKey = "ponte";
    } else if (combinedText.includes("tampo") || combinedText.includes("rachad")) {
      regionKey = "tampo";
    } else if (combinedText.includes("traste")) {
      regionKey = "trastes";
    } else if (combinedText.includes("tarraxa") || combinedText.includes("nut") || combinedText.includes("pestana")) {
      regionKey = "tarraxas";
    } else if (combinedText.includes("chiado") || combinedText.includes("jack") || combinedText.includes("captador") || combinedText.includes("eletric")) {
      regionKey = "eletrica";
    } else {
      regionKey = "cordas";
    }
  }

  let severityKey = els.severitySelect.value;
  if (severityKey === "auto") {
    if (regionKey === "headstock" || regionKey === "tampo") {
      severityKey = uploadedFiles.length > 0 ? "moderado" : "severo";
    } else if (regionKey === "cordas") {
      severityKey = "leve";
    } else {
      severityKey = "moderado";
    }
  }

  return { instrumentKey, regionKey, severityKey };
}

/**
 * Ponto de extensão opcional para conectar uma API de visão computacional/LLM (ex.: Gemini API).
 * Para uso puramente front-end sem expor chaves, este método delega ao motor local.
 */
async function analyzeWithVisionEngine() {
  return inferInstrumentAndDamage();
}

// --- Execução da Análise com Etapas Visuais ---
function runProgressSteps(onComplete) {
  const stepNames = [
    "1. Identificando instrumento",
    "2. Avaliando danos",
    "3. Calculando orçamento",
    "4. Buscando melhores preços",
  ];
  const stepEls = Array.from(els.stepsList.querySelectorAll("li"));

  els.progressCard.classList.remove("hidden");
  let idx = 0;

  function tick() {
    stepEls.forEach((li, i) => {
      li.classList.remove("active", "done");
      if (i < idx) li.classList.add("done");
      else if (i === idx) li.classList.add("active");
    });

    const pct = Math.min(100, Math.round(((idx + 1) / stepNames.length) * 100));
    els.progressLabel.textContent = stepNames[idx] || "Concluído";
    els.progressPercent.textContent = `${pct}%`;
    els.progressFill.style.width = `${pct}%`;

    idx += 1;
    if (idx <= stepNames.length) {
      setTimeout(tick, 320);
    } else {
      setTimeout(() => {
        els.progressCard.classList.add("hidden");
        onComplete();
      }, 240);
    }
  }

  tick();
}

function buildAnalysisData() {
  const budget = Math.max(20, Number(els.budgetInput.value) || 350);
  const experience = els.experienceSelect.value;
  const { instrumentKey, regionKey, severityKey } = inferInstrumentAndDamage();

  const instrument = INSTRUMENTS[instrumentKey];
  const damage = DAMAGE_PROFILES[regionKey];
  const severity = SEVERITY_CONFIG[severityKey];

  // Ajusta encordoamento específico se for guitarra
  const itemKeys = damage.items.map((k) =>
    k === "cordas_aco" && instrumentKey === "guitarra" ? "cordas_guitarra" : k
  );

  const recommendedItems = itemKeys.map((key) => {
    const baseItem = CATALOG[key];
    const bestOffer = getBestOffer(baseItem);
    return {
      ...baseItem,
      bestPrice: bestOffer.price,
      bestStore: bestOffer.store,
      offers: [...baseItem.offers].sort((a, b) => a.price - b.price),
    };
  });

  const partsCost = recommendedItems
    .filter((i) => i.kind.includes("Peça"))
    .reduce((acc, i) => acc + i.bestPrice, 0);

  const toolsCost = recommendedItems
    .filter((i) => i.kind.includes("Ferramenta"))
    .reduce((acc, i) => acc + i.bestPrice, 0);

  const laborCost = Math.round(instrument.laborBase * damage.laborMultiplier * severity.multiplier);
  const luthierTotal = laborCost + Math.max(partsCost, 25);
  const diyTotal =
    experience === "pro"
      ? partsCost
      : partsCost + toolsCost;

  const referenceTotal = experience === "luthier" ? luthierTotal : diyTotal;

  return {
    id: Date.now(),
    dateStr: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    budget,
    experience,
    instrumentKey,
    instrumentLabel: instrument.label,
    regionKey,
    regionLabel: damage.label,
    damageDescription: damage.description,
    severityKey,
    severityLabel: severity.label,
    notes: els.notesInput.value.trim(),
    photosCount: uploadedFiles.length,
    partsCost,
    toolsCost,
    laborCost,
    luthierTotal,
    diyTotal,
    referenceTotal,
    items: recommendedItems,
  };
}

function renderAnalysis(data) {
  currentAnalysis = data;

  els.detectedInstrumentBadge.textContent = `${data.instrumentLabel} • Dano ${data.severityLabel}`;
  els.resultTitle.textContent = `${data.instrumentLabel} — ${data.regionLabel}`;

  const photoNote = data.photosCount > 0
    ? `Análise baseada em ${data.photosCount} foto(s) enviada(s)`
    : "Análise simulada (nenhuma foto anexada — ajuste os campos para testar cenários)";

  els.damageSummary.textContent = `${photoNote}: ${data.damageDescription}${
    data.notes ? ` Observação do usuário: "${data.notes}".` : ""
  }`;

  els.luthierTotalCost.textContent = formatBRL(data.luthierTotal);
  els.luthierLaborNote.textContent = `Mão de obra est.: ${formatBRL(data.laborCost)} + peças`;

  els.diyTotalCost.textContent = formatBRL(data.diyTotal);
  els.diyBreakdownNote.textContent = `Peças: ${formatBRL(data.partsCost)} • Ferramentas: ${formatBRL(data.toolsCost)}`;

  els.userBudgetDisplay.textContent = formatBRL(data.budget);

  const diff = data.budget - data.referenceTotal;
  els.budgetStatusBadge.className = "badge";

  if (diff >= data.budget * 0.15) {
    els.budgetStatusBadge.classList.add("badge--ok");
    els.budgetStatusBadge.textContent = `Dentro do orçamento (Sobra ~${formatBRL(diff)})`;
    els.budgetDiffNote.textContent = `Margem livre estimada de ${formatBRL(diff)}`;
    els.priorityBox.classList.add("hidden");
  } else if (diff >= -30) {
    els.budgetStatusBadge.classList.add("badge--warn");
    els.budgetStatusBadge.textContent = "Próximo do limite do orçamento";
    els.budgetDiffNote.textContent = diff >= 0 ? `Restam ${formatBRL(diff)}` : `Acima em ${formatBRL(Math.abs(diff))}`;
    els.priorityBox.classList.remove("hidden");
    els.priorityBox.textContent =
      "Dica de economia: priorize os itens de prioridade 1 e 2 e escolha sempre a oferta de menor preço na tabela comparativa.";
  } else {
    els.budgetStatusBadge.classList.add("badge--bad");
    els.budgetStatusBadge.textContent = `Acima do orçamento (+${formatBRL(Math.abs(diff))})`;
    els.budgetDiffNote.textContent = `Excede em ${formatBRL(Math.abs(diff))}`;
    els.priorityBox.classList.remove("hidden");
    els.priorityBox.textContent =
      "Sugestão de priorização: comece pelos itens essenciais (prioridade 1), adie ferramentas não indispensáveis ou avalie fazer o reparo em etapas conforme entra orçamento.";
  }

  renderItemsList();
}

function renderItemsList() {
  if (!currentAnalysis) return;

  let list = [...currentAnalysis.items];

  if (sortCheapest) {
    list.sort((a, b) => a.bestPrice - b.bestPrice);
  } else {
    list.sort((a, b) => a.priority - b.priority);
  }

  if (onlyAffordable) {
    let running = 0;
    list = list.filter((item) => {
      if (running + item.bestPrice <= currentAnalysis.budget) {
        running += item.bestPrice;
        return true;
      }
      return false;
    });
  }

  els.itemsList.innerHTML = "";

  if (!list.length) {
    els.itemsList.innerHTML = `<p class="meta-text">Nenhum item se encaixa no filtro atual de orçamento. Desmarque o filtro para ver todas as opções.</p>`;
    return;
  }

  list.forEach((item) => {
    const cheapestPrice = Math.min(...item.offers.map((o) => o.price));
    const card = document.createElement("article");
    card.className = "item-card";

    const rowsHtml = item.offers
      .map((offer) => {
        const isBest = offer.price === cheapestPrice;
        return `
          <tr>
            <td>
              <strong>${offer.store}</strong>
              ${isBest ? `<span class="best-price-tag">Menor preço</span>` : ""}
            </td>
            <td>${offer.rating}</td>
            <td><strong>${formatBRL(offer.price)}</strong></td>
            <td style="text-align:right;">
              <a class="btn btn--offer" href="${offer.url}" target="_blank" rel="noopener noreferrer">
                Comprar / Ver oferta ↗
              </a>
            </td>
          </tr>
        `;
      })
      .join("");

    card.innerHTML = `
      <div class="item-card__top">
        <div>
          <h4 class="item-card__title">${item.name}</h4>
          <div class="item-card__meta">${item.kind} • Prioridade ${item.priority} • Melhor oferta: ${formatBRL(item.bestPrice)} (${item.bestStore})</div>
        </div>
        <span class="badge badge--neutral">A partir de ${formatBRL(item.bestPrice)}</span>
      </div>
      <table class="offers-table" aria-label="Comparativo de preços para ${item.name}">
        <thead>
          <tr>
            <th>Loja / Canal</th>
            <th>Avaliação</th>
            <th>Preço est.</th>
            <th style="text-align:right;">Ação</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    els.itemsList.appendChild(card);
  });
}

// --- Histórico em localStorage ---
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = loadHistory();
  history.unshift({
    id: entry.id,
    dateStr: entry.dateStr,
    instrumentLabel: entry.instrumentLabel,
    regionLabel: entry.regionLabel,
    severityLabel: entry.severityLabel,
    budget: entry.budget,
    referenceTotal: entry.referenceTotal,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    els.historyList.innerHTML = `<p class="meta-text">Nenhuma análise salva ainda.</p>`;
    return;
  }

  els.historyList.innerHTML = history
    .map(
      (h) => `
      <div class="history-item">
        <div>
          <strong>${h.instrumentLabel}</strong> — ${h.regionLabel} (${h.severityLabel})
          <div class="meta-text">${h.dateStr} • Orçamento: ${formatBRL(h.budget)}</div>
        </div>
        <strong>${formatBRL(h.referenceTotal)}</strong>
      </div>
    `
    )
    .join("");
}

els.clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
});

// --- Filtros e Ordenação ---
els.onlyAffordableToggle.addEventListener("change", (e) => {
  onlyAffordable = e.target.checked;
  renderItemsList();
});

els.sortCheapestBtn.addEventListener("click", () => {
  sortCheapest = !sortCheapest;
  els.sortCheapestBtn.textContent = sortCheapest ? "Ordenar: Prioridade" : "Ordenar: Menor preço";
  renderItemsList();
});

// --- Submit ---
els.analysisForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.analyzeBtn.disabled = true;

  await analyzeWithVisionEngine();

  runProgressSteps(() => {
    const analysis = buildAnalysisData();
    renderAnalysis(analysis);
    saveToHistory(analysis);
    els.analyzeBtn.disabled = false;
  });
});

// Inicialização
initTheme();
renderHistory();
renderAnalysis(buildAnalysisData());