// Questões sobre pontuação
const questions = [
    // Múltipla escolha (20 questões)
    {type: 'multiple-choice', question: 'Qual sinal usamos para fazer uma pergunta?', options: ['Ponto-final', 'Ponto de interrogação', 'Ponto de exclamação', 'Reticências'], correctAnswer: 'Ponto de interrogação'},
    {type: 'multiple-choice', question: 'Frases afirmativas terminam com qual sinal?', options: ['Ponto-final', 'Exclamação', 'Interrogação', 'Reticências'], correctAnswer: 'Ponto-final'},
    {type: 'multiple-choice', question: 'Que frase termina com ponto de exclamação?', options: ['Você gosta?', 'Que dia lindo!', 'Ontem fui à escola.', 'A chuva caiu...'], correctAnswer: 'Que dia lindo!'},
    {type: 'multiple-choice', question: 'O que indicam as reticências?', options: ['Fim', 'Continuidade', 'Interrupção', 'Felicidade'], correctAnswer: 'Interrupção'},
    {type: 'multiple-choice', question: 'Qual frase expressa uma pergunta?', options: ['Ele está estudando.', 'Onde você mora?', 'Que lugar bonito!', 'O céu está azul.'], correctAnswer: 'Onde você mora?'},
    {type: 'multiple-choice', question: 'Qual frase expressa uma surpresa?', options: ['Eu gosto de pizza.', 'Que delícia de bolo!', 'A aula começa às oito.', 'Vamos à praia.'], correctAnswer: 'Que delícia de bolo!'},
    {type: 'multiple-choice', question: 'Qual é o sinal de pontuação usado em "Você está feliz?"?', options: ['Ponto de exclamação', 'Ponto de interrogação', 'Ponto-final', 'Reticências'], correctAnswer: 'Ponto de interrogação'},
    {type: 'multiple-choice', question: 'O que finaliza uma frase declarativa?', options: ['Exclamação', 'Interrogação', 'Ponto-final', 'Reticências'], correctAnswer: 'Ponto-final'},
    {type: 'multiple-choice', question: 'Qual frase é afirmativa?', options: ['Você gosta de brincar?', 'Que casa bonita!', 'Hoje está frio.', 'Onde está o brinquedo?'], correctAnswer: 'Hoje está frio.'},
    {type: 'multiple-choice', question: 'Qual frase tem reticências?', options: ['O sol brilhou.', 'Eu acho que...', 'Você vai à escola?', 'Que bom!'], correctAnswer: 'Eu acho que...'},
    {type: 'multiple-choice', question: 'A frase "Você estudou para a prova?" termina com qual sinal?', options: ['Exclamação', 'Interrogação', 'Ponto-final', 'Reticências'], correctAnswer: 'Interrogação'},
    {type: 'multiple-choice', question: 'Qual frase mostra surpresa?', options: ['Hoje choveu.', 'Que dia quente!', 'Ele está correndo.', 'Você gosta de sorvete?'], correctAnswer: 'Que dia quente!'},
    {type: 'multiple-choice', question: 'Que sinal é usado para expressar dúvida?', options: ['Exclamação', 'Reticências', 'Interrogação', 'Ponto-final'], correctAnswer: 'Reticências'},
    {type: 'multiple-choice', question: 'Qual frase tem exclamação?', options: ['Que lindo!', 'Está chovendo.', 'Você está estudando?', 'Ele saiu.'], correctAnswer: 'Que lindo!'},
    {type: 'multiple-choice', question: 'As reticências indicam:', options: ['Alegria', 'Mistério', 'Certeza', 'Confirmação'], correctAnswer: 'Mistério'},
    {type: 'multiple-choice', question: 'Ponto de interrogação serve para:', options: ['Afirmar', 'Admirar', 'Perguntar', 'Declarar'], correctAnswer: 'Perguntar'},
    {type: 'multiple-choice', question: 'Frases de ordem podem terminar com:', options: ['Ponto-final', 'Exclamação', 'Interrogação', 'Reticências'], correctAnswer: 'Exclamação'},
    {type: 'multiple-choice', question: 'O que termina uma frase afirmativa?', options: ['Exclamação', 'Ponto-final', 'Reticências', 'Interrogação'], correctAnswer: 'Ponto-final'},
    {type: 'multiple-choice', question: 'Qual frase não é uma pergunta?', options: ['Você gosta de ler?', 'Vamos à escola?', 'Ele leu um livro.', 'Você vai?'], correctAnswer: 'Ele leu um livro.'},
    {type: 'multiple-choice', question: 'Sinal usado para expressar forte emoção:', options: ['Ponto-final', 'Exclamação', 'Interrogação', 'Reticências'], correctAnswer: 'Exclamação'},

    // Completar frases (20 questões)
    {type: 'complete', question: 'A frase "Você gosta de estudar?" termina com _____.', options: ['ponto-final', 'ponto de interrogação', 'ponto de exclamação', 'reticências'], correctAnswer: 'ponto de interrogação'},
    {type: 'complete', question: 'Usamos _____ para terminar frases afirmativas.', options: ['ponto de exclamação', 'ponto de interrogação', 'ponto-final', 'reticências'], correctAnswer: 'ponto-final'},
    {type: 'complete', question: 'Para expressar surpresa usamos _____.', options: ['reticências', 'ponto de interrogação', 'ponto-final', 'ponto de exclamação'], correctAnswer: 'ponto de exclamação'},
    {type: 'complete', question: 'Uma frase com reticências indica _____.', options: ['certeza', 'continuidade ou dúvida', 'afirmação', 'negação'], correctAnswer: 'continuidade ou dúvida'},
    {type: 'complete', question: 'Frases exclamativas expressam _____.', options: ['tristeza', 'admiração', 'negação', 'certeza'], correctAnswer: 'admiração'},
    {type: 'complete', question: 'O sinal _____ indica que a frase continua.', options: ['ponto-final', 'ponto de interrogação', 'reticências', 'ponto de exclamação'], correctAnswer: 'reticências'},
    {type: 'complete', question: 'Frases interrogativas são usadas para _____.', options: ['afirmar', 'dar ordens', 'perguntar', 'expressar dúvidas'], correctAnswer: 'perguntar'},
    {type: 'complete', question: 'Usamos ponto de exclamação para frases que expressam _____.', options: ['tristeza', 'surpresa', 'calma', 'certeza'], correctAnswer: 'surpresa'},
    {type: 'complete', question: 'O sinal de exclamação transmite _____.', options: ['calma', 'emoção', 'indiferença', 'tristeza'], correctAnswer: 'emoção'},
    {type: 'complete', question: 'O sinal de interrogação indica _____.', options: ['afirmação', 'pergunta', 'admiração', 'tristeza'], correctAnswer: 'pergunta'},
    {type: 'complete', question: 'Para mostrar continuidade usamos _____.', options: ['ponto de interrogação', 'reticências', 'ponto-final', 'ponto de exclamação'], correctAnswer: 'reticências'},
    {type: 'complete', question: 'Final de frase com forte emoção usa _____.', options: ['reticências', 'ponto de exclamação', 'ponto-final', 'interrogação'], correctAnswer: 'ponto de exclamação'},
    {type: 'complete', question: 'Afirmações terminam com _____.', options: ['exclamação', 'interrogação', 'ponto-final', 'reticências'], correctAnswer: 'ponto-final'},
    {type: 'complete', question: 'Frases de surpresa terminam com _____.', options: ['ponto-final', 'reticências', 'interrogação', 'ponto de exclamação'], correctAnswer: 'ponto de exclamação'},
    {type: 'complete', question: 'Frases de pergunta terminam com _____.', options: ['ponto de interrogação', 'ponto-final', 'reticências', 'ponto de exclamação'], correctAnswer: 'ponto de interrogação'},
    {type: 'complete', question: 'Frases abertas ou incompletas terminam com _____.', options: ['reticências', 'ponto-final', 'exclamação', 'interrogação'], correctAnswer: 'reticências'},
    {type: 'complete', question: 'O sinal que indica pergunta é o _____.', options: ['ponto-final', 'ponto de interrogação', 'exclamação', 'reticências'], correctAnswer: 'ponto de interrogação'},
    {type: 'complete', question: 'O sinal que expressa surpresa é o _____.', options: ['reticências', 'ponto de exclamação', 'ponto-final', 'interrogação'], correctAnswer: 'ponto de exclamação'},
    {type: 'complete', question: 'O sinal que expressa dúvida ou continuação é o _____.', options: ['reticências', 'exclamação', 'ponto-final', 'interrogação'], correctAnswer: 'reticências'},

    // Ligar pontos (10 questões)
    {type: 'match', question: 'Ligue o tipo de frase ao seu sinal correto:', options: [
        {left: 'Frase afirmativa', right: 'Ponto-final'},
        {left: 'Frase interrogativa', right: 'Ponto de interrogação'},
        {left: 'Frase exclamativa', right: 'Ponto de exclamação'},
        {left: 'Frase de continuidade', right: 'Reticências'}
    ], correctAnswer: ['Frase afirmativa-Ponto-final', 'Frase interrogativa-Ponto de interrogação', 'Frase exclamativa-Ponto de exclamação', 'Frase de continuidade-Reticências']}
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = new Array(questions.length).fill(null);
let answeredQuestions = new Set();

// Elementos do DOM
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
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

// Inicialização
totalQuestionsSpan.textContent = questions.length;
updateProgress();
updateStats();

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
    questionText.textContent = question.question;
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
            
            // Marcar opção selecionada anteriormente
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
                
                // Verificar se a combinação está correta
                const isCorrect = question.correctAnswer.includes(`${draggedText}-${targetText}`);
                
                if (isCorrect) {
                    e.target.classList.add('correct');
                    e.target.style.pointerEvents = 'none';
                    score++;
                    updateStats();
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

// Evento para o botão de reiniciar
restartButton.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(questions.length).fill(null);
    answeredQuestions.clear();
    
    document.getElementById('question-container').classList.remove('hidden');
    document.querySelector('.navigation-buttons').classList.remove('hidden');
    results.classList.add('hidden');
    
    updateProgress();
    updateStats();
    showQuestion();
});

// Evento para o botão de alternar painel de estatísticas
toggleStatsButton.addEventListener('click', () => {
    statsPanel.classList.toggle('collapsed');
    toggleStatsButton.textContent = statsPanel.classList.contains('collapsed') ? '▶' : '◀';
});

// Iniciar o jogo
showQuestion(); 