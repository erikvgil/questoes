// Variáveis globais
let questions = [];
let originalQuestions = []; // Array para manter as questões originais
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let answeredQuestions = new Set();
let currentQuizFile = null; // Será definido dinamicamente

// Elementos do DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
const resetButton = document.getElementById('reset-button');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const progressBar = document.querySelector('.progress');
const results = document.getElementById('results');
const finalScore = document.getElementById('final-score');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const percentage = document.getElementById('percentage');
const questionsReview = document.getElementById('questions-review');
const restartButton = document.getElementById('restart-button');

// Elementos do painel de estatísticas
const statsPanel = document.getElementById('stats-panel');
const toggleStatsButton = document.getElementById('toggle-stats');
const statsCorrect = document.getElementById('stats-correct');
const statsIncorrect = document.getElementById('stats-incorrect');
const statsPercentage = document.getElementById('stats-percentage');
const statsAnswered = document.getElementById('stats-answered');
const correctBar = document.getElementById('correct-bar');
const incorrectBar = document.getElementById('incorrect-bar');

// Função para randomizar array usando o algoritmo Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para verificar se um arquivo JSON existe
async function checkFileExists(file) {
    try {
        const response = await fetch(file);
        return response.ok;
    } catch {
        return false;
    }
}

// Função para formatar o nome do arquivo para exibição
function formatDisplayName(filename) {
    // Remove o caminho do diretório, se houver
    const baseName = filename.split('/').pop();
    // Remove a extensão .json e o prefixo questoes_
    let displayName = baseName.replace('.json', '').replace('questoes_', '');
    
    // Formata casos especiais
    if (displayName === 'portugues') {
        return 'Português';
    } else if (displayName.includes('final')) {
        return displayName.replace('_', ' ').replace('final', 'Final');
    }
    
    // Formata números
    if (!isNaN(displayName)) {
        return `Questões ${displayName}`;
    }
    
    // Formata outros casos
    return displayName.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Função para listar arquivos JSON no diretório
async function listJsonFiles() {
    // Lista fixa de todos os arquivos
    return [
        'questoes_portugues_novo.json'
    ];
}

// Função para criar o menu de quizzes
async function createQuizMenu() {
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = '';

    try {
        // Obter lista de arquivos JSON
        const knownFiles = await listJsonFiles();

        // Verifica quais arquivos existem
        const existingFiles = [];
        for (const file of knownFiles) {
            if (await checkFileExists(file)) {
                existingFiles.push(file);
            }
        }

        // Define o arquivo inicial se ainda não foi definido
        if (!currentQuizFile && existingFiles.length > 0) {
            currentQuizFile = existingFiles[0];
        }

        // Cria os itens do menu para cada arquivo encontrado
        existingFiles.forEach(file => {
            const quizItem = document.createElement('div');
            quizItem.className = 'quiz-item';
            if (file === currentQuizFile) {
                quizItem.classList.add('active');
            }
            
            quizItem.textContent = formatDisplayName(file);
            quizItem.dataset.file = file;
            quizItem.addEventListener('click', () => selectQuiz(file));
            quizList.appendChild(quizItem);
        });

        if (existingFiles.length === 0) {
            quizList.innerHTML = '<div class="error-message">Nenhum arquivo de questões encontrado</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar lista de arquivos:', error);
        quizList.innerHTML = '<div class="error-message">Erro ao carregar lista de arquivos</div>';
    }
}

// Função para selecionar um quiz
async function selectQuiz(quizFile) {
    try {
        // Limpar estado atual
        questions = [];
        originalQuestions = [];
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        answeredQuestions = new Set();
        
        // Atualizar arquivo atual
        currentQuizFile = quizFile;
        console.log('Selecionando novo quiz:', currentQuizFile);
        
        // Atualizar visual do menu
        document.querySelectorAll('.quiz-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.file === quizFile) {
                item.classList.add('active');
            }
        });
        
        // Limpar UI
        questionText.textContent = 'Carregando questões...';
        optionsContainer.innerHTML = '';
        feedback.classList.add('hidden');
        
        // Carregar novas questões
        await loadQuestions();
        
    } catch (error) {
        console.error('Erro ao selecionar quiz:', error);
        questionText.textContent = 'Erro ao carregar o quiz. Por favor, tente novamente.';
    }
}

// Carregar questões do arquivo JSON
async function loadQuestions() {
    try {
        if (!currentQuizFile) {
            throw new Error('Nenhum arquivo de questões selecionado');
        }
        
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime();
        const response = await fetch(`${currentQuizFile}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error('Formato de arquivo inválido ou sem questões');
        }
        
        console.log(`Carregadas ${data.questions.length} questões do arquivo ${currentQuizFile}`);
        
        originalQuestions = [...data.questions];
        questions = shuffleArray([...originalQuestions]);
        userAnswers = new Array(questions.length).fill(null);
        totalQuestionsSpan.textContent = questions.length;
        updateProgress();
        updateStats();
        showQuestion();
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        console.error('Arquivo atual:', currentQuizFile);
        // Mostrar mensagem de erro para o usuário
        questionText.textContent = `Erro ao carregar as questões: ${error.message}`;
    }
}

// Função para atualizar a barra de progresso
function updateProgress() {
    const progress = (answeredQuestions.size / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Função para atualizar as estatísticas
function updateStats() {
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const answeredCount = answeredQuestions.size;
    const incorrectAnswers = answeredCount - correctAnswers;
    const percentageScore = answeredCount > 0 ? Math.round((correctAnswers / answeredCount) * 100) : 0;
    
    // Atualizar valores
    statsCorrect.textContent = correctAnswers;
    statsIncorrect.textContent = incorrectAnswers;
    statsPercentage.textContent = `${percentageScore}%`;
    statsAnswered.textContent = `${answeredCount}/${totalQuestions}`;
    
    // Atualizar gráfico
    if (answeredCount > 0) {
        const correctPercentage = (correctAnswers / answeredCount) * 100;
        const incorrectPercentage = (incorrectAnswers / answeredCount) * 100;
        
        correctBar.style.width = `${correctPercentage}%`;
        incorrectBar.style.width = `${incorrectPercentage}%`;
    } else {
        correctBar.style.width = '0%';
        incorrectBar.style.width = '0%';
    }
}

// Função para mostrar a questão atual
function showQuestion() {
    const question = questions[currentQuestionIndex];
    const topicElement = document.createElement('div');
    topicElement.className = 'question-topic';
    topicElement.textContent = question.topic;
    
    questionText.innerHTML = '';
    questionText.appendChild(topicElement);
    questionText.appendChild(document.createTextNode(question.question));
    
    optionsContainer.innerHTML = '';
    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    // Atualizar estado dos botões de navegação
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima →';

    if (question.type === 'multiple-choice' || question.type === 'complete') {
        question.options.forEach(option => {
            const button = document.createElement('div');
            button.className = 'option';
            button.textContent = option;
            
            if (userAnswers[currentQuestionIndex] === option) {
                button.classList.add('selected');
            }
            
            button.addEventListener('click', () => checkAnswer(option));
            optionsContainer.appendChild(button);
        });
    } else if (question.type === 'match') {
        const leftContainer = document.createElement('div');
        leftContainer.className = 'match-left-container';
        const rightContainer = document.createElement('div');
        rightContainer.className = 'match-right-container';

        question.options.forEach(option => {
            const leftSide = document.createElement('div');
            leftSide.className = 'match-left';
            leftSide.textContent = option.left;
            leftSide.draggable = true;
            leftSide.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', option.left);
            });

            const rightSide = document.createElement('div');
            rightSide.className = 'match-right';
            rightSide.textContent = option.right;
            rightSide.draggable = true;
            rightSide.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', option.right);
            });

            leftContainer.appendChild(leftSide);
            rightContainer.appendChild(rightSide);
        });

        optionsContainer.appendChild(leftContainer);
        optionsContainer.appendChild(rightContainer);

        // Adicionar eventos de drag and drop
        const matchElements = document.querySelectorAll('.match-left, .match-right');
        matchElements.forEach(element => {
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            element.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedText = e.dataTransfer.getData('text/plain');
                const targetText = e.target.textContent;
                
                const isCorrect = question.correctAnswer ? 
                    question.correctAnswer.includes(`${draggedText}-${targetText}`) :
                    question.options.some(opt => 
                        (opt.left === draggedText && opt.right === targetText) ||
                        (opt.right === draggedText && opt.left === targetText)
                    );
                
                if (isCorrect) {
                    e.target.classList.add('correct');
                    e.target.style.pointerEvents = 'none';
                    if (!userAnswers[currentQuestionIndex]) {
                        score++;
                        userAnswers[currentQuestionIndex] = true;
                        answeredQuestions.add(currentQuestionIndex);
                        updateStats();
                        updateProgress();
                    }
                } else {
                    e.target.classList.add('incorrect');
                }
            });
        });
    }

    // Mostrar feedback se a questão já foi respondida
    if (userAnswers[currentQuestionIndex] !== null) {
        showFeedback(userAnswers[currentQuestionIndex]);
    }
}

// Função para verificar a resposta
function checkAnswer(selectedAnswer) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Desabilitar todas as opções
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.textContent === question.correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedAnswer && !isCorrect) {
            option.classList.add('incorrect');
        }
    });

    // Salvar resposta do usuário e atualizar score
    if (!userAnswers[currentQuestionIndex]) { // Só atualiza se ainda não respondeu
        userAnswers[currentQuestionIndex] = selectedAnswer;
        answeredQuestions.add(currentQuestionIndex);
        if (isCorrect) {
            score++;
        }
    }

    // Atualizar progresso e estatísticas
    updateProgress();
    updateStats();

    // Mostrar feedback
    showFeedback(selectedAnswer);
}

// Função para mostrar feedback
function showFeedback(selectedAnswer) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;

    feedback.textContent = isCorrect ? 'Parabéns! Você acertou!' : 'Ops! Tente novamente.';
    feedback.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    feedback.classList.remove('hidden');
}

// Evento para o botão de próxima questão
nextButton.addEventListener('click', () => {
    if (currentQuestionIndex === questions.length - 1) {
        showResults();
    } else {
        currentQuestionIndex++;
        showQuestion();
        feedback.classList.add('hidden');
    }
});

// Evento para o botão de questão anterior
prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
        feedback.classList.add('hidden');
    }
});

// Função para mostrar resultados
function showResults() {
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);

    // Atualizar elementos do resultado
    finalScore.textContent = correctAnswers;
    correctCount.textContent = correctAnswers;
    incorrectCount.textContent = incorrectAnswers;
    percentage.textContent = `${percentageScore}%`;

    // Criar revisão das questões
    questionsReview.innerHTML = '';
    questions.forEach((question, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${userAnswers[index] === question.correctAnswer ? 'correct' : 'incorrect'}`;
        
        const questionText = document.createElement('div');
        questionText.className = 'review-question';
        questionText.textContent = `Questão ${index + 1}: ${question.question}`;
        
        const userAnswer = document.createElement('div');
        userAnswer.className = 'review-answer';
        userAnswer.textContent = `Sua resposta: ${userAnswers[index] || 'Não respondida'}`;
        
        const correctAnswer = document.createElement('div');
        correctAnswer.className = 'review-correct';
        correctAnswer.textContent = `Resposta correta: ${question.correctAnswer}`;
        
        reviewItem.appendChild(questionText);
        reviewItem.appendChild(userAnswer);
        reviewItem.appendChild(correctAnswer);
        questionsReview.appendChild(reviewItem);
    });

    // Mostrar resultados
    document.getElementById('question-container').classList.add('hidden');
    document.querySelector('.navigation-buttons').classList.add('hidden');
    results.classList.remove('hidden');
}

// Função para reiniciar o quiz
function resetQuiz(forceReset = false) {
    if (forceReset || confirm('Tem certeza que deseja reiniciar? Todo o seu progresso será perdido.')) {
        // Randomizar questões novamente
        questions = shuffleArray([...originalQuestions]);
        
        // Resetar variáveis
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = new Array(questions.length).fill(null);
        answeredQuestions = new Set();

        // Limpar feedback
        feedback.classList.add('hidden');
        feedback.textContent = '';

        // Resetar UI
        results.classList.add('hidden');
        document.getElementById('question-container').classList.remove('hidden');
        document.querySelector('.navigation-buttons').classList.remove('hidden');

        // Atualizar progresso e estatísticas
        updateProgress();
        updateStats();

        // Mostrar primeira questão
        showQuestion();
    }
}

// Adicionar evento de clique ao botão de reiniciar
resetButton.addEventListener('click', () => resetQuiz(false));

// Evento para o botão de alternar painel de estatísticas
toggleStatsButton.addEventListener('click', () => {
    statsPanel.classList.toggle('collapsed');
    toggleStatsButton.textContent = statsPanel.classList.contains('collapsed') ? '▶' : '◀';
});

// Inicializar o aplicativo
async function initializeApp() {
    await createQuizMenu();
    await loadQuestions();
}

initializeApp().catch(error => {
    console.error('Erro ao inicializar o aplicativo:', error);
    questionText.textContent = 'Erro ao carregar as questões. Por favor, recarregue a página.';
}); 