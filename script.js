// Variáveis globais
let questions = [];
let originalQuestions = []; // Array para manter as questões originais
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let answeredQuestions = new Set();

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

// Carregar questões do arquivo JSON
async function loadQuestions() {
    try {
        const response = await fetch('questoes_portugues.json');
        const data = await response.json();
        originalQuestions = [...data.questions]; // Guarda uma cópia das questões originais
        questions = shuffleArray([...originalQuestions]); // Randomiza as questões
        userAnswers = new Array(questions.length).fill(null);
        totalQuestionsSpan.textContent = questions.length;
        updateProgress();
        updateStats();
        showQuestion();
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
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
function resetQuiz() {
    if (confirm('Tem certeza que deseja reiniciar? Todo o seu progresso será perdido.')) {
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
resetButton.addEventListener('click', resetQuiz);

// Evento para o botão de alternar painel de estatísticas
toggleStatsButton.addEventListener('click', () => {
    statsPanel.classList.toggle('collapsed');
    toggleStatsButton.textContent = statsPanel.classList.contains('collapsed') ? '▶' : '◀';
});

// Iniciar o jogo
loadQuestions(); 