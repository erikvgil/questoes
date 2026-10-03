'use strict';

// Provas enviadas pelo usuário ficam no localStorage deste navegador.
// Provas do site ficam em provas/ e são listadas em provas/index.json.
const STORAGE_KEY = 'questoes.provas.v1';
const MANIFEST_URL = 'provas/index.json';
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

let provas = [];   // { id, name, questions, source: 'site' | 'upload', file? }
let pending = [];  // arquivos enviados aguardando nome/confirmação
let quiz = null;   // { prova, questions, answers, index, finished }
let currentView = 'home';

const $ = (selector) => document.querySelector(selector);

// Cria um elemento com classes, texto e atributos
function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === false) continue;
        if (key === 'className') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of [].concat(children)) {
        if (child) node.append(child);
    }
    return node;
}

// Algoritmo Fisher-Yates (retorna uma cópia embaralhada)
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function shorten(text, max = 50) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function normalizeName(name) {
    return name.trim().toLocaleLowerCase('pt-BR');
}

// "questoes_portugues_60.json" -> "Portugues 60"
function nameFromFile(fileName) {
    const base = fileName.split('/').pop().replace(/\.json$/i, '').replace(/^questoes[_-]?/i, '');
    const words = base.split(/[_-]+/).filter(Boolean);
    if (words.length === 0) return 'Nova prova';
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

let toastTimer = null;
function toast(message, type = 'info') {
    const node = $('#toast');
    node.textContent = message;
    node.className = `toast ${type}`;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 3500);
}

function downloadJson(fileName, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: fileName });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileSlug(name) {
    return name.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'prova';
}

/* ---------- Validação das questões ---------- */

// Aceita { questions: [...] } ou uma lista direta de questões
function validateQuestions(data) {
    const list = Array.isArray(data) ? data : data && data.questions;
    if (!Array.isArray(list)) {
        return { questions: [], errors: ['O arquivo precisa ter uma lista "questions".'] };
    }

    const questions = [];
    const errors = [];
    list.forEach((q, i) => {
        const label = `Questão ${i + 1}`;
        if (!q || typeof q !== 'object') {
            errors.push(`${label}: formato inválido.`);
            return;
        }
        const type = q.type || 'multiple-choice';
        if (type !== 'multiple-choice' && type !== 'complete') {
            errors.push(`${label}: o tipo "${type}" não é suportado.`);
            return;
        }
        const text = typeof q.question === 'string' ? q.question.trim() : '';
        if (!text) {
            errors.push(`${label}: falta o enunciado ("question").`);
            return;
        }
        const where = `${label} ("${shorten(text)}")`;
        if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`${where}: precisa de pelo menos 2 opções.`);
            return;
        }
        const options = q.options.map(option => String(option ?? '').trim());
        if (options.some(option => !option)) {
            errors.push(`${where}: tem uma opção vazia.`);
            return;
        }
        if (new Set(options).size !== options.length) {
            errors.push(`${where}: tem opções repetidas.`);
            return;
        }
        const correct = String(q.correctAnswer ?? '').trim();
        if (!options.includes(correct)) {
            errors.push(`${where}: a resposta correta "${correct}" não está entre as opções.`);
            return;
        }
        questions.push({
            question: text,
            options,
            correctAnswer: correct,
            topic: typeof q.topic === 'string' ? q.topic.trim() : ''
        });
    });

    if (list.length === 0) errors.push('O arquivo não tem nenhuma questão.');
    return { questions, errors };
}

/* ---------- Armazenamento ---------- */

function loadUploads() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(stored)) return [];
        return stored
            .map(item => ({
                id: item.id,
                name: String(item.name || 'Prova'),
                questions: validateQuestions(item).questions,
                createdAt: item.createdAt,
                source: 'upload'
            }))
            .filter(item => item.id && item.questions.length > 0);
    } catch (error) {
        console.error('Erro ao ler provas salvas:', error);
        return [];
    }
}

function saveUploads() {
    const uploads = provas
        .filter(prova => prova.source === 'upload')
        .map(({ id, name, questions, createdAt }) => ({ id, name, questions, createdAt }));
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
        return true;
    } catch (error) {
        console.error('Erro ao salvar provas:', error);
        toast('Não foi possível salvar neste navegador (armazenamento cheio ou bloqueado).', 'error');
        return false;
    }
}

async function fetchJson(url) {
    const response = await fetch(`${url}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function loadSiteProvas() {
    let files = [];
    try {
        const manifest = await fetchJson(MANIFEST_URL);
        files = Array.isArray(manifest.provas) ? manifest.provas : [];
    } catch (error) {
        console.warn('Sem lista de provas do site:', error.message);
        return [];
    }

    const loaded = await Promise.all(files.map(async (file) => {
        try {
            const data = await fetchJson(`provas/${file}`);
            const { questions, errors } = validateQuestions(data);
            if (errors.length) console.warn(`Problemas em provas/${file}:`, errors);
            if (questions.length === 0) return null;
            return {
                id: `site:${file}`,
                name: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : nameFromFile(file),
                questions,
                source: 'site',
                file
            };
        } catch (error) {
            console.warn(`Não foi possível carregar provas/${file}:`, error.message);
            return null;
        }
    }));
    return loaded.filter(Boolean);
}

function nameTaken(name, ignoreId = null) {
    const target = normalizeName(name);
    return provas.some(prova => prova.id !== ignoreId && normalizeName(prova.name) === target);
}

/* ---------- Navegação ---------- */

function showView(name) {
    currentView = name;
    for (const view of document.querySelectorAll('.view')) {
        view.hidden = view.id !== `view-${name}`;
    }
    const activeTab = name === 'manage' ? 'manage' : 'home';
    for (const tab of document.querySelectorAll('.tab')) {
        tab.classList.toggle('active', tab.dataset.nav === activeTab);
    }
    window.scrollTo({ top: 0 });
}

function navigate(name) {
    if (currentView === 'quiz' && name !== 'quiz' && quiz && !quiz.finished && answeredCount() > 0) {
        if (!confirm('Sair da prova? As respostas desta tentativa serão perdidas.')) return;
    }
    if (name === 'home') renderHome();
    if (name === 'manage') renderManage();
    showView(name);
}

/* ---------- Lista de provas ---------- */

function renderHome() {
    const grid = $('#prova-grid');
    grid.replaceChildren();
    $('#home-empty').hidden = provas.length > 0;

    for (const prova of provas) {
        const topics = [...new Set(prova.questions.map(q => q.topic).filter(Boolean))];
        const topicText = topics.length > 3
            ? `${topics.slice(0, 3).join(' · ')} e mais ${topics.length - 3}`
            : topics.join(' · ');
        grid.append(el('button', {
            type: 'button',
            className: 'prova-card',
            onclick: () => startQuiz(prova)
        }, [
            el('span', { className: 'prova-name', text: prova.name }),
            el('span', { className: 'prova-count', text: `${prova.questions.length} questões` }),
            topicText ? el('span', { className: 'prova-topics', text: topicText }) : null,
            prova.source === 'upload' ? el('span', { className: 'badge', text: 'Enviada' }) : null
        ]));
    }
}

/* ---------- Prova ---------- */

function startQuiz(prova) {
    const questions = shuffle(prova.questions).map(q => ({ ...q, options: shuffle(q.options) }));
    quiz = {
        prova,
        questions,
        answers: new Array(questions.length).fill(null),
        index: 0,
        finished: false
    };
    $('#quiz-title').textContent = prova.name;
    $('#total-questions').textContent = questions.length;
    showView('quiz');
    renderQuestion();
}

function answeredCount() {
    return quiz.answers.filter(answer => answer !== null).length;
}

function correctCount() {
    return quiz.answers.filter((answer, i) => answer === quiz.questions[i].correctAnswer).length;
}

function renderQuestion() {
    const q = quiz.questions[quiz.index];
    const answer = quiz.answers[quiz.index];
    const answered = answer !== null;

    $('#current-question').textContent = quiz.index + 1;
    $('#question-topic').textContent = q.topic;
    $('#question-topic').hidden = !q.topic;
    $('#question-text').textContent = q.question;

    const options = $('#options');
    options.replaceChildren();
    q.options.forEach((option, i) => {
        let state = '';
        if (answered && option === q.correctAnswer) state = 'correct';
        else if (answered && option === answer) state = 'incorrect';
        options.append(el('button', {
            type: 'button',
            className: `option ${state}`,
            disabled: answered,
            onclick: () => choose(option)
        }, [
            el('span', { className: 'option-letter', text: LETTERS[i] || String(i + 1) }),
            el('span', { className: 'option-text', text: option })
        ]));
    });

    const feedback = $('#feedback');
    feedback.hidden = !answered;
    if (answered) {
        const isCorrect = answer === q.correctAnswer;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect
            ? 'Parabéns! Você acertou! 🎉'
            : `Não foi dessa vez. A resposta certa é: ${q.correctAnswer}`;
    }

    const isLast = quiz.index === quiz.questions.length - 1;
    $('#prev-button').disabled = quiz.index === 0;
    $('#next-button').textContent = isLast ? 'Ver resultado ✓' : 'Próxima →';

    updateStatus();
}

function updateStatus() {
    const correct = correctCount();
    const answered = answeredCount();
    $('#stats-correct').textContent = correct;
    $('#stats-incorrect').textContent = answered - correct;
    $('#progress').style.width = `${(answered / quiz.questions.length) * 100}%`;
}

function choose(option) {
    if (!quiz || quiz.answers[quiz.index] !== null) return;
    quiz.answers[quiz.index] = option;
    renderQuestion();
}

function goTo(index) {
    if (index < 0 || index >= quiz.questions.length) return;
    quiz.index = index;
    renderQuestion();
}

function next() {
    if (quiz.index < quiz.questions.length - 1) {
        goTo(quiz.index + 1);
        return;
    }
    const missing = quiz.questions.length - answeredCount();
    if (missing > 0) {
        const firstMissing = quiz.answers.indexOf(null);
        const plural = missing === 1 ? 'questão sem resposta' : 'questões sem resposta';
        if (!confirm(`Ainda há ${missing} ${plural}. Ver o resultado mesmo assim?\n\n(Cancelar leva até a primeira que falta.)`)) {
            goTo(firstMissing);
            return;
        }
    }
    showResults();
}

/* ---------- Resultado ---------- */

function resultMessage(percent) {
    if (percent >= 90) return 'Incrível! Você mandou muito bem! 🏆';
    if (percent >= 70) return 'Muito bem! Continue assim! ⭐';
    if (percent >= 50) return 'Bom trabalho! Dá para melhorar ainda mais! 💪';
    return 'Vamos treinar mais um pouco? Você consegue! 📚';
}

function showResults() {
    quiz.finished = true;
    const total = quiz.questions.length;
    const correct = correctCount();
    const answered = answeredCount();
    const percent = Math.round((correct / total) * 100);

    $('#results-title').textContent = `Resultado – ${quiz.prova.name}`;
    $('#results-message').textContent = resultMessage(percent);
    $('#final-percentage').textContent = `${percent}%`;
    $('#correct-count').textContent = correct;
    $('#incorrect-count').textContent = answered - correct;
    $('#skipped-count').textContent = total - answered;
    $('#only-wrong').checked = false;

    renderReview();
    showView('results');
}

function renderReview() {
    const onlyWrong = $('#only-wrong').checked;
    const review = $('#questions-review');
    review.replaceChildren();

    quiz.questions.forEach((q, i) => {
        const answer = quiz.answers[i];
        const status = answer === null ? 'skipped' : answer === q.correctAnswer ? 'correct' : 'incorrect';
        if (onlyWrong && status === 'correct') return;

        const statusText = { correct: '✓ Acertou', incorrect: '✗ Errou', skipped: '– Sem resposta' }[status];
        const optionList = el('ul', { className: 'review-options' }, q.options.map(option => {
            const classes = [];
            if (option === q.correctAnswer) classes.push('is-correct');
            if (option === answer && option !== q.correctAnswer) classes.push('is-wrong');
            const mark = option === q.correctAnswer ? ' ✓' : option === answer ? ' ✗ (sua resposta)' : '';
            return el('li', { className: classes.join(' '), text: option + mark });
        }));

        review.append(el('div', { className: `review-item ${status}` }, [
            el('div', { className: 'review-meta' }, [
                el('span', { text: `Questão ${i + 1}${q.topic ? ` · ${q.topic}` : ''}` }),
                el('span', { className: 'review-status', text: statusText })
            ]),
            el('div', { className: 'review-question', text: q.question }),
            optionList
        ]));
    });

    if (!review.children.length) {
        review.append(el('p', { className: 'muted', text: 'Nenhum erro para revisar. Parabéns! 🎉' }));
    }
}

/* ---------- Gerenciar provas ---------- */

async function handleFiles(fileList) {
    for (const file of fileList) {
        if (!/\.json$/i.test(file.name)) {
            pending.push({ key: uid(), fileName: file.name, name: '', questions: [], errors: ['Não é um arquivo .json.'] });
            continue;
        }
        let data;
        try {
            data = JSON.parse(await file.text());
        } catch (error) {
            pending.push({ key: uid(), fileName: file.name, name: '', questions: [], errors: [`O arquivo não é um JSON válido: ${error.message}`] });
            continue;
        }

        // Backup com várias provas ou arquivo com uma prova só
        const entries = data && Array.isArray(data.provas)
            ? data.provas.map(item => ({ data: item, name: item && (item.name || item.title) }))
            : [{ data, name: data && data.title }];

        for (const entry of entries) {
            const { questions, errors } = validateQuestions(entry.data);
            const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : nameFromFile(file.name);
            pending.push({ key: uid(), fileName: file.name, name, questions, errors });
        }
    }
    renderPending();
}

function renderPending() {
    const list = $('#pending-list');
    list.replaceChildren();
    $('#pending').hidden = pending.length === 0;

    for (const item of pending) {
        const usable = item.questions.length > 0;
        const nameInput = el('input', {
            type: 'text',
            value: item.name,
            placeholder: 'Nome da prova',
            'aria-label': `Nome da prova do arquivo ${item.fileName}`,
            disabled: !usable,
            oninput: (event) => { item.name = event.target.value; }
        });

        let summary;
        if (!usable) {
            summary = el('p', { className: 'pending-summary error-text', text: 'Nenhuma questão válida — este arquivo não será salvo.' });
        } else if (item.errors.length) {
            summary = el('p', { className: 'pending-summary warning-text', text: `${item.questions.length} questões válidas · ${item.errors.length} ${item.errors.length === 1 ? 'ignorada' : 'ignoradas'} (veja abaixo)` });
        } else {
            summary = el('p', { className: 'pending-summary ok-text', text: `${item.questions.length} questões válidas` });
        }

        const errorList = item.errors.length
            ? el('details', { className: 'pending-errors', open: !usable }, [
                el('summary', { text: 'Problemas encontrados' }),
                el('ul', {}, item.errors.map(error => el('li', { text: error })))
            ])
            : null;

        list.append(el('div', { className: `pending-item ${usable ? '' : 'unusable'}`, 'data-key': item.key }, [
            el('div', { className: 'pending-top' }, [
                el('span', { className: 'pending-file', text: `📄 ${item.fileName}` }),
                el('button', {
                    type: 'button',
                    className: 'btn ghost small',
                    'aria-label': `Remover ${item.fileName}`,
                    onclick: () => { pending = pending.filter(p => p !== item); renderPending(); },
                    text: 'Remover'
                })
            ]),
            usable ? el('label', { className: 'field' }, [el('span', { text: 'Nome da prova' }), nameInput]) : null,
            summary,
            el('p', { className: 'field-error error-text', hidden: true }),
            errorList
        ]));
    }

    const saveButton = $('#pending-save');
    const usableCount = pending.filter(p => p.questions.length > 0).length;
    saveButton.disabled = usableCount === 0;
    saveButton.textContent = usableCount === 1 ? 'Salvar prova' : `Salvar ${usableCount} provas`;
}

function savePending() {
    const usable = pending.filter(p => p.questions.length > 0);
    let valid = true;
    const seen = new Set();

    for (const item of usable) {
        const name = item.name.trim();
        let message = '';
        if (!name) message = 'Dê um nome para a prova.';
        else if (nameTaken(name) || seen.has(normalizeName(name))) message = 'Já existe uma prova com esse nome.';
        seen.add(normalizeName(name));

        const node = document.querySelector(`[data-key="${item.key}"] .field-error`);
        node.textContent = message;
        node.hidden = !message;
        if (message) valid = false;
    }
    if (!valid) return;

    const now = new Date().toISOString();
    const added = usable.map(item => ({
        id: `upload:${uid()}`,
        name: item.name.trim(),
        questions: item.questions,
        createdAt: now,
        source: 'upload'
    }));
    provas.push(...added);
    if (!saveUploads()) {
        provas = provas.filter(prova => !added.includes(prova));
        return;
    }

    pending = [];
    renderPending();
    renderManage();
    toast(added.length === 1 ? `Prova "${added[0].name}" salva!` : `${added.length} provas salvas!`, 'success');
}

function renameProva(prova, input) {
    const name = input.value.trim();
    if (name === prova.name) return;
    if (!name) {
        toast('O nome não pode ficar vazio.', 'error');
        input.value = prova.name;
        return;
    }
    if (nameTaken(name, prova.id)) {
        toast('Já existe uma prova com esse nome.', 'error');
        input.value = prova.name;
        return;
    }
    const previous = prova.name;
    prova.name = name;
    if (saveUploads()) {
        toast('Nome atualizado.', 'success');
    } else {
        prova.name = previous;
        input.value = previous;
    }
}

function deleteProva(prova) {
    if (!confirm(`Excluir a prova "${prova.name}"? Isso não pode ser desfeito.`)) return;
    provas = provas.filter(p => p !== prova);
    saveUploads();
    renderManage();
    toast('Prova excluída.');
}

function provaFile(prova) {
    return {
        title: prova.name,
        questions: prova.questions.map(q => ({
            type: 'multiple-choice',
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic
        }))
    };
}

function renderManage() {
    const list = $('#manage-list');
    list.replaceChildren();

    if (provas.length === 0) {
        list.append(el('p', { className: 'muted', text: 'Nenhuma prova ainda. Envie um arquivo .json acima.' }));
    }

    for (const prova of provas) {
        const isUpload = prova.source === 'upload';
        const nameNode = isUpload
            ? el('input', {
                type: 'text',
                className: 'name-input',
                value: prova.name,
                'aria-label': 'Nome da prova',
                onchange: (event) => renameProva(prova, event.target),
                onkeydown: (event) => { if (event.key === 'Enter') event.target.blur(); }
            })
            : el('span', { className: 'name-static', text: prova.name });

        list.append(el('div', { className: 'manage-item' }, [
            el('div', { className: 'manage-info' }, [
                nameNode,
                el('span', { className: 'muted small-text' }, [
                    `${prova.questions.length} questões · `,
                    isUpload ? 'enviada neste navegador' : `do site (provas/${prova.file})`
                ])
            ]),
            el('div', { className: 'manage-actions' }, [
                el('button', { type: 'button', className: 'btn small primary', text: '▶ Fazer', onclick: () => startQuiz(prova) }),
                el('button', { type: 'button', className: 'btn small', text: '⬇ Baixar', onclick: () => downloadJson(`${fileSlug(prova.name)}.json`, provaFile(prova)) }),
                isUpload ? el('button', { type: 'button', className: 'btn small danger', text: 'Excluir', onclick: () => deleteProva(prova) }) : null
            ])
        ]));
    }

    $('#export-all').disabled = !provas.some(prova => prova.source === 'upload');
}

function exportAll() {
    const uploads = provas.filter(prova => prova.source === 'upload');
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`provas-backup-${date}.json`, {
        provas: uploads.map(prova => ({ name: prova.name, questions: provaFile(prova).questions }))
    });
}

function downloadTemplate() {
    downloadJson('modelo-prova.json', {
        title: 'Nome da prova',
        questions: [
            {
                question: 'Quanto é 2 + 3?',
                options: ['4', '5', '6', '7'],
                correctAnswer: '5',
                topic: 'Adição'
            },
            {
                question: 'Qual palavra está escrita corretamente?',
                options: ['cachorro', 'cachoro', 'caxorro', 'cachorru'],
                correctAnswer: 'cachorro',
                topic: 'Ortografia'
            }
        ]
    });
}

/* ---------- Eventos ---------- */

function bindEvents() {
    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-nav]');
        if (target) navigate(target.dataset.nav);
    });

    $('#prev-button').addEventListener('click', () => goTo(quiz.index - 1));
    $('#next-button').addEventListener('click', next);
    $('#restart-button').addEventListener('click', () => startQuiz(quiz.prova));
    $('#only-wrong').addEventListener('change', renderReview);

    // Atalhos: 1-4 / A-D escolhem, setas navegam
    document.addEventListener('keydown', (event) => {
        if (currentView !== 'quiz' || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest('input, textarea')) return;
        const key = event.key.toUpperCase();
        const q = quiz.questions[quiz.index];
        let optionIndex = LETTERS.indexOf(key);
        if (optionIndex === -1 && /^[1-9]$/.test(key)) optionIndex = Number(key) - 1;
        if (optionIndex >= 0 && optionIndex < q.options.length) choose(q.options[optionIndex]);
        else if (event.key === 'ArrowRight') next();
        else if (event.key === 'ArrowLeft') goTo(quiz.index - 1);
    });

    const fileInput = $('#file-input');
    fileInput.addEventListener('change', async () => {
        await handleFiles(fileInput.files);
        fileInput.value = '';
    });

    const dropzone = $('#dropzone');
    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('dragging');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('dragging');
        handleFiles(event.dataTransfer.files);
    });

    $('#pending-save').addEventListener('click', savePending);
    $('#pending-cancel').addEventListener('click', () => { pending = []; renderPending(); });
    $('#export-all').addEventListener('click', exportAll);
    $('#download-template').addEventListener('click', downloadTemplate);
}

async function init() {
    bindEvents();
    const siteProvas = await loadSiteProvas();
    provas = [...siteProvas, ...loadUploads()];
    renderHome();
    showView('home');
}

init();
