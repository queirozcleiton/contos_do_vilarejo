/* ============================================================
   Contos do Vilarejo — Lógica de Criação de Personagens
   ============================================================ */

// ---- Dados do Sistema ----

const CLASSES = [
    { id: 'bibliotecario', nome: 'Bibliotecário', icone: '📚' },
    { id: 'guerreiro',     nome: 'Guerreiro',     icone: '⚔️'  },
    { id: 'fazendeiro',    nome: 'Fazendeiro',    icone: '🌾'  },
    { id: 'domador',       nome: 'Domador',       icone: '🐾'  },
    { id: 'fada',          nome: 'Fada',          icone: '🧚'  },
    { id: 'bruxa',         nome: 'Bruxa',         icone: '🧙'  },
    { id: 'sereia',        nome: 'Sereia',        icone: '🧜'  },
];

const ITENS_POR_CLASSE = {
    bibliotecario: ['Livro de magia', 'Mapa', 'Café', 'Livro de línguas', 'Livro de espécies', 'Livro de monstros'],
    guerreiro:     ['Faca pequena', 'Faca grande', 'Arma (10 tiros)', 'Escudo', 'Arco (10 flechas)'],
    fazendeiro:    ['Grãos', 'Sementes', 'Enxada', 'Pá'],
    domador:       ['Laço', 'Frutos', 'Cabana', 'Gato', 'Cachorro', 'Galinha', 'Vaca', 'Porco', 'Cavalo', 'Coelho'],
    fada:          ['Flores', 'Farinha', 'Cogumelos'],
    bruxa:         ['Cajado', 'Varinha', 'Poções'],
    sereia:        ['Conchas', 'Algas', 'Lixo'],
};

const CLASSES_COM_MAGIA = new Set(['fada', 'bruxa', 'sereia']);
const ATRIBUTOS          = ['Velocidade', 'Força', 'Equilíbrio', 'Furtividade', 'Conhecimento', 'Stamina'];
const TOTAL_PEDRAS       = 10;
const MAX_POR_ATTR       = 3;
const TOTAL_ITENS        = 3;
const TOTAL_STEPS        = 4;
const STORAGE_KEY        = 'contos_personagens';

// ---- Estado do Wizard ----

const state = {
    currentStep:       1,
    classeSelecionada: null,
    itensSelecionados: new Set(),
    stats:             Object.fromEntries(ATRIBUTOS.map(a => [a, 0])),
};

let currentViewId = null;

function pedrasRestantes() {
    return TOTAL_PEDRAS - Object.values(state.stats).reduce((s, v) => s + v, 0);
}

// ============================================================
// PERSISTÊNCIA (localStorage)
// ============================================================

function getCharacters() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}

function persistCharacter(char) {
    const list = getCharacters();
    list.push(char);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function removeCharacter(id) {
    const list = getCharacters().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ============================================================
// GERENCIAMENTO DE TELAS
// ============================================================

function showScreen(name) {
    ['home', 'wizard', 'view'].forEach(s => {
        document.getElementById(`screen-${s}`).classList.toggle('hidden', s !== name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// TELA: HOME
// ============================================================

function renderHome() {
    showScreen('home');
    const chars = getCharacters();
    const list  = document.getElementById('char-list');
    const count = document.getElementById('char-count');

    if (chars.length === 0) {
        count.textContent = 'Nenhum personagem';
        list.innerHTML = `<p class="empty-state">Nenhum personagem criado ainda.<br>Que tal começar sua aventura?</p>`;
        return;
    }

    count.textContent = chars.length === 1 ? '1 personagem' : `${chars.length} personagens`;
    list.innerHTML = '';

    // Mais recente primeiro
    [...chars].reverse().forEach(char => {
        const cls  = CLASSES.find(c => c.id === char.classId);
        const date = new Date(char.createdAt).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const card = document.createElement('div');
        card.className = 'char-card';
        card.innerHTML = `
            <div class="char-card-info" data-id="${char.id}">
                <span class="char-card-icon">${cls?.icone ?? '?'}</span>
                <div class="char-card-text">
                    <strong class="char-card-name">${escapeHtml(char.name)}</strong>
                    <span class="char-card-meta">${cls?.nome ?? ''} &middot; ${date}</span>
                </div>
            </div>
            <span class="char-card-arrow">›</span>
            <button class="char-card-delete" data-id="${char.id}" title="Excluir personagem">✕</button>
        `;

        card.querySelector('.char-card-info').addEventListener('click',
            () => viewCharacter(char.id));

        card.querySelector('.char-card-delete').addEventListener('click', e => {
            e.stopPropagation();
            confirmarExclusao(char.id, char.name);
        });

        list.appendChild(card);
    });
}

function confirmarExclusao(id, name) {
    if (confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) {
        removeCharacter(id);
        if (currentViewId === id) {
            renderHome();
        } else {
            renderHome();
        }
    }
}

// ============================================================
// TELA: FICHA SALVA (VIEW)
// ============================================================

function viewCharacter(id) {
    const char = getCharacters().find(c => c.id === id);
    if (!char) return;
    currentViewId = id;
    renderSheetFromData(char);
    showScreen('view');
}

function renderSheetFromData(char) {
    const cls     = CLASSES.find(c => c.id === char.classId);
    const content = document.getElementById('sheet-content');
    content.innerHTML = '';

    content.appendChild(criarBloco('Personagem', `
        <p><strong>Nome:</strong> ${escapeHtml(char.name)}</p>
        <p><strong>Classe:</strong> ${cls?.icone ?? ''} ${cls?.nome ?? char.classId}</p>
    `));

    if (char.history)    content.appendChild(criarBloco('História',         `<p>${escapeHtml(char.history)}</p>`));
    if (char.appearance) content.appendChild(criarBloco('Aparência',        `<p>${escapeHtml(char.appearance)}</p>`));
    if (char.magic)      content.appendChild(criarBloco('Poderes e Magias', `<p>${escapeHtml(char.magic)}</p>`));

    const itensHtml = (char.items || [])
        .map(item => `<span class="sheet-item-tag">${escapeHtml(item)}</span>`)
        .join('');
    content.appendChild(criarBloco('Inventário', `<div class="sheet-items">${itensHtml}</div>`));

    const statsHtml = ATRIBUTOS.map(attr => `
        <div class="sheet-stat">
            <span class="sheet-stat-name">${attr}</span>
            <span class="sheet-stat-val">${char.stats?.[attr] ?? 0}</span>
        </div>`).join('');
    content.appendChild(criarBloco('Atributos', `<div class="sheet-stats-list">${statsHtml}</div>`));
}

// ============================================================
// WIZARD DE CRIAÇÃO
// ============================================================

function abrirWizard() {
    resetarWizard();
    showScreen('wizard');
    showStep(1);
}

function showStep(step) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        document.getElementById(`step-${i}`).classList.toggle('hidden', i !== step);
    }

    document.querySelectorAll('.step-indicator').forEach(el => {
        const n = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (n === step) el.classList.add('active');
        if (n < step)   el.classList.add('completed');
    });

    document.querySelectorAll('.step-connector').forEach((el, i) => {
        el.classList.toggle('completed', i + 1 < step);
    });

    document.getElementById('btn-back').classList.toggle('hidden', step === 1);

    const btnNext = document.getElementById('btn-next');
    if (step === TOTAL_STEPS) {
        btnNext.textContent = 'Gerar Ficha ✦';
        btnNext.classList.add('is-final');
    } else {
        btnNext.textContent = 'Avançar →';
        btnNext.classList.remove('is-final');
    }

    state.currentStep = step;
}

function avancar() {
    if (!validarEtapa(state.currentStep)) return;
    if (state.currentStep === TOTAL_STEPS) {
        salvarEExibir();
    } else {
        showStep(state.currentStep + 1);
    }
}

function voltar() {
    if (state.currentStep > 1) showStep(state.currentStep - 1);
}

// ---- Validação por Etapa ----

function validarEtapa(step) {
    let ok = true;

    if (step === 1) {
        const nome = document.getElementById('char-name').value.trim();
        if (!nome) {
            mostrarErro('error-name', 'O nome do personagem é obrigatório.');
            document.getElementById('char-name').classList.add('is-invalid');
            ok = false;
        } else {
            limparErro('error-name');
            document.getElementById('char-name').classList.remove('is-invalid');
        }
    }

    if (step === 2) {
        if (!state.classeSelecionada) {
            mostrarErro('error-class', 'Selecione uma classe para o personagem.');
            ok = false;
        } else {
            limparErro('error-class');
        }

        if (state.classeSelecionada && CLASSES_COM_MAGIA.has(state.classeSelecionada)) {
            const magia = document.getElementById('char-magic').value.trim();
            if (!magia) {
                mostrarErro('error-magic', 'Descreva os poderes e magias do personagem.');
                document.getElementById('char-magic').classList.add('is-invalid');
                ok = false;
            } else {
                limparErro('error-magic');
                document.getElementById('char-magic').classList.remove('is-invalid');
            }
        }
    }

    if (step === 3) {
        const itensClasse = ITENS_POR_CLASSE[state.classeSelecionada] || [];
        const esperado    = Math.min(TOTAL_ITENS, itensClasse.length);
        if (state.itensSelecionados.size !== esperado) {
            mostrarErro('error-inventory', `Selecione exatamente ${esperado} item(ns) do inventário.`);
            ok = false;
        } else {
            limparErro('error-inventory');
        }
    }

    if (step === 4) {
        const total = Object.values(state.stats).reduce((s, v) => s + v, 0);
        if (total !== TOTAL_PEDRAS) {
            mostrarErro('error-stats',
                `Distribua exatamente 10 pedras. Faltam ${TOTAL_PEDRAS - total} pedra(s).`);
            ok = false;
        } else {
            limparErro('error-stats');
        }
    }

    return ok;
}

// ---- Salvar e Exibir Ficha ----

function salvarEExibir() {
    const char = {
        id:         Date.now().toString(),
        createdAt:  new Date().toISOString(),
        name:       document.getElementById('char-name').value.trim(),
        classId:    state.classeSelecionada,
        history:    document.getElementById('char-history').value.trim(),
        appearance: document.getElementById('char-appearance').value.trim(),
        magic:      document.getElementById('char-magic').value.trim(),
        items:      [...state.itensSelecionados],
        stats:      { ...state.stats },
    };

    persistCharacter(char);
    currentViewId = char.id;
    renderSheetFromData(char);
    showScreen('view');
}

// ---- Classes ----

function renderClasses() {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';
    CLASSES.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.dataset.id = cls.id;
        card.innerHTML = `<span class="class-icon">${cls.icone}</span>
                          <span class="class-name">${cls.nome}</span>`;
        card.addEventListener('click', () => selecionarClasse(cls.id));
        grid.appendChild(card);
    });
}

function selecionarClasse(classeId) {
    state.classeSelecionada = classeId;
    state.itensSelecionados.clear();

    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === classeId);
    });

    const magicSection = document.getElementById('magic-section');
    if (CLASSES_COM_MAGIA.has(classeId)) {
        magicSection.classList.remove('hidden');
    } else {
        magicSection.classList.add('hidden');
        document.getElementById('char-magic').value = '';
    }

    limparErro('error-class');
    renderInventario(classeId);
}

// ---- Inventário ----

function renderInventario(classeId) {
    const grid    = document.getElementById('inventory-grid');
    const itens   = ITENS_POR_CLASSE[classeId] || [];
    const autoSel = itens.length <= TOTAL_ITENS;

    grid.innerHTML = '';
    if (autoSel) itens.forEach(item => state.itensSelecionados.add(item));

    itens.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card' + (autoSel ? ' auto-selected' : '');
        card.dataset.item = item;
        card.innerHTML = `<span class="item-checkbox">${autoSel ? '✓' : ''}</span>
                          <span>${item}</span>`;
        if (!autoSel) card.addEventListener('click', () => toggleItem(item));
        grid.appendChild(card);
    });

    atualizarContadorItens();
}

function toggleItem(item) {
    if (state.itensSelecionados.has(item)) {
        state.itensSelecionados.delete(item);
    } else {
        if (state.itensSelecionados.size >= TOTAL_ITENS) return;
        state.itensSelecionados.add(item);
    }

    const limite = state.itensSelecionados.size >= TOTAL_ITENS;

    document.querySelectorAll('.item-card').forEach(card => {
        const estaSel   = state.itensSelecionados.has(card.dataset.item);
        const bloqueado = !estaSel && limite;
        card.classList.toggle('selected', estaSel);
        card.classList.toggle('disabled', bloqueado);
        card.querySelector('.item-checkbox').textContent = estaSel ? '✓' : '';
    });

    atualizarContadorItens();
    limparErro('error-inventory');
}

function atualizarContadorItens() {
    document.getElementById('item-count').textContent = state.itensSelecionados.size;
}

// ---- Atributos ----

function renderStats() {
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = '';

    ATRIBUTOS.forEach(attr => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <span class="stat-name">${attr}</span>
            <div class="stat-dots" id="dots-${attr}"></div>
            <button class="stat-btn" id="btn-minus-${attr}" aria-label="Diminuir ${attr}">−</button>
            <span class="stat-value" id="val-${attr}">0</span>
            <button class="stat-btn" id="btn-plus-${attr}" aria-label="Aumentar ${attr}">+</button>
        `;
        grid.appendChild(row);

        row.querySelector(`#btn-minus-${attr}`).addEventListener('click', () => ajustarStat(attr, -1));
        row.querySelector(`#btn-plus-${attr}`).addEventListener('click',  () => ajustarStat(attr, +1));
    });

    atualizarStats();
}

function ajustarStat(attr, delta) {
    const novo = state.stats[attr] + delta;
    if (novo < 0 || novo > MAX_POR_ATTR) return;
    if (delta > 0 && pedrasRestantes() <= 0) return;
    state.stats[attr] = novo;
    atualizarStats();
    limparErro('error-stats');
}

function atualizarStats() {
    const restantes = pedrasRestantes();

    document.getElementById('stones-left').textContent = restantes;
    document.getElementById('stones-left').style.color =
        restantes === 0 ? 'var(--color-green)' : 'var(--color-accent)';

    ATRIBUTOS.forEach(attr => {
        const val = state.stats[attr];
        document.getElementById(`val-${attr}`).textContent = val;

        const dotsEl = document.getElementById(`dots-${attr}`);
        dotsEl.innerHTML = '';
        for (let i = 0; i < MAX_POR_ATTR; i++) {
            const dot = document.createElement('span');
            dot.className = 'stat-dot' + (i < val ? ' filled' : '');
            dotsEl.appendChild(dot);
        }

        document.getElementById(`btn-minus-${attr}`).disabled = val <= 0;
        document.getElementById(`btn-plus-${attr}`).disabled  = val >= MAX_POR_ATTR || restantes <= 0;
    });
}

// ---- Copiar Ficha ----

function copiarFicha() {
    const char = getCharacters().find(c => c.id === currentViewId);
    if (!char) return;

    const cls = CLASSES.find(c => c.id === char.classId);
    let texto  = `=== FICHA DE PERSONAGEM — CONTOS DO VILAREJO ===\n\n`;
    texto += `Nome: ${char.name}\nClasse: ${cls?.nome ?? char.classId}\n`;

    if (char.history)    texto += `\nHistória:\n${char.history}\n`;
    if (char.appearance) texto += `\nAparência:\n${char.appearance}\n`;
    if (char.magic)      texto += `\nPoderes e Magias:\n${char.magic}\n`;

    texto += `\nInventário:\n${(char.items || []).map(i => `  • ${i}`).join('\n')}\n`;
    texto += `\nAtributos:\n`;
    ATRIBUTOS.forEach(a => { texto += `  ${a}: ${char.stats?.[a] ?? 0}\n`; });

    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('btn-copy');
        const orig = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
        alert('Não foi possível copiar automaticamente. Selecione o texto manualmente.');
    });
}

// ---- Reset do Wizard ----

function resetarWizard() {
    state.currentStep       = 1;
    state.classeSelecionada = null;
    state.itensSelecionados.clear();
    ATRIBUTOS.forEach(attr => { state.stats[attr] = 0; });

    document.getElementById('char-name').value       = '';
    document.getElementById('char-history').value    = '';
    document.getElementById('char-appearance').value = '';
    document.getElementById('char-magic').value      = '';
    document.getElementById('char-name').classList.remove('is-invalid');
    document.getElementById('char-magic').classList.remove('is-invalid');

    ['error-name', 'error-class', 'error-magic', 'error-inventory', 'error-stats']
        .forEach(limparErro);

    renderClasses();
    renderStats();
    document.getElementById('magic-section').classList.add('hidden');
    document.getElementById('inventory-grid').innerHTML =
        '<p class="placeholder-text">Selecione uma classe para ver os itens disponíveis.</p>';
    document.getElementById('item-count').textContent = '0';
}

// ============================================================
// UTILITÁRIOS
// ============================================================

function criarBloco(titulo, innerHtml) {
    const div = document.createElement('div');
    div.className = 'sheet-block';
    div.innerHTML = `<h3>${titulo}</h3>${innerHtml}`;
    return div;
}

function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function limparErro(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Wizard controls
    document.getElementById('btn-next').addEventListener('click', avancar);
    document.getElementById('btn-back').addEventListener('click', voltar);
    document.getElementById('btn-wizard-home').addEventListener('click', renderHome);

    // View controls
    document.getElementById('btn-copy').addEventListener('click', copiarFicha);
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-home').addEventListener('click', renderHome);
    document.getElementById('btn-delete').addEventListener('click', () => {
        const char = getCharacters().find(c => c.id === currentViewId);
        if (char) confirmarExclusao(char.id, char.name);
    });

    // Home controls
    document.getElementById('btn-create').addEventListener('click', abrirWizard);

    // Start on home screen
    renderHome();
});
