/**
 * Quiz Detail Page - Quiz çözme sayfası
 * Soru gösterimi, timer, cevap toplama ve sonuç ekranı
 */

// State
let quiz = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let timeRemaining = 0;
let timerInterval = null;
let currentUser = null;

// Constants
const DIFFICULTY_LABELS = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };

/**
 * Initialize quiz page
 */
async function initQuizDetailPage() {
    lucide.createIcons();

    // Get quiz ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    if (!quizId) {
        alert('Quiz bulunamadı!');
        window.location.href = 'quizzes.html';
        return;
    }

    // Check auth and get user
    if (!AuthService.checkAuth()) {
        alert('Quiz çözmek için giriş yapmalısınız!');
        window.location.href = 'login.html?redirect=quiz-detail.html?id=' + quizId;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = { id: payload.userId };
    } catch (error) {
        console.error('User bilgisi alınamadı:', error);
        alert('Bir hata oluştu!');
        return;
    }

    await loadQuiz(quizId);
}

/**
 * Load quiz from API
 * @param {string} quizId - Quiz ID
 */
async function loadQuiz(quizId) {
    try {
        const response = await fetch(`http://localhost:8080/api/quizzes/${quizId}`);
        quiz = await response.json();

        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('quizContainer').classList.remove('hidden');

        // Set quiz info
        document.getElementById('quizTitle').textContent = quiz.title;
        document.getElementById('quizDescription').textContent = quiz.description || '';
        document.getElementById('quizQuestionCount').innerHTML = `<i data-lucide="file-text" class="w-4 h-4 inline"></i> ${quiz.questionCount} soru`;
        document.getElementById('quizPoints').innerHTML = `<i data-lucide="star" class="w-4 h-4 inline"></i> ${quiz.totalPoints} puan`;
        document.getElementById('quizDifficulty').innerHTML = `<i data-lucide="target" class="w-4 h-4 inline"></i> ${DIFFICULTY_LABELS[quiz.difficulty]}`;

        // Start timer if time limit exists
        if (quiz.timeLimitMinutes) {
            timeRemaining = quiz.timeLimitMinutes * 60;
            document.getElementById('timerDisplay').classList.remove('hidden');
            startTimer();
        }

        // Show first question
        showQuestion(0);
        lucide.createIcons();
    } catch (error) {
        console.error('Quiz yükleme hatası:', error);
        alert('Quiz yüklenemedi!');
        window.location.href = 'quizzes.html';
    }
}

/**
 * Start countdown timer
 */
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('Süre doldu! Quiz otomatik olarak gönderiliyor...');
            submitQuiz();
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timerText').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Show question at given index
 * @param {number} index - Question index
 */
function showQuestion(index) {
    currentQuestionIndex = index;
    const question = quiz.questions[index];

    // Update progress
    const answeredCount = Object.keys(userAnswers).length;
    document.getElementById('progressText').textContent = `${answeredCount}/${quiz.questionCount}`;
    const progressPercentage = (answeredCount / quiz.questionCount) * 100;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;

    // Update question info
    document.getElementById('questionNumber').textContent = `Soru ${index + 1}/${quiz.questionCount}`;
    document.getElementById('questionText').textContent = question.questionText;
    document.getElementById('questionPoints').textContent = `${question.points} puan`;

    // Render options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, idx) => {
        const isSelected = userAnswers[question.id] === option.id;
        return `
            <div onclick="selectOption(${question.id}, ${option.id})" class="option-card ${isSelected ? 'selected' : ''} flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg">
                <span class="option-letter w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center font-medium">
                    ${String.fromCharCode(65 + idx)}
                </span>
                <span class="flex-1">${option.optionText}</span>
            </div>
        `;
    }).join('');

    // Update navigation buttons
    document.getElementById('prevButton').disabled = index === 0;
    document.getElementById('nextButton').classList.remove('hidden');
    document.getElementById('submitButton').classList.add('hidden');

    if (index === quiz.questionCount - 1) {
        document.getElementById('nextButton').classList.add('hidden');
        document.getElementById('submitButton').classList.remove('hidden');
    }

    lucide.createIcons();
}

/**
 * Select option for current question
 * @param {number} questionId - Question ID
 * @param {number} optionId - Selected option ID
 */
function selectOption(questionId, optionId) {
    userAnswers[questionId] = optionId;
    showQuestion(currentQuestionIndex);

    // Auto-enable next button
    document.getElementById('nextButton').disabled = false;
    document.getElementById('submitButton').disabled = false;
}

/**
 * Navigate to previous question
 */
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

/**
 * Navigate to next question
 */
function nextQuestion() {
    if (currentQuestionIndex < quiz.questionCount - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

/**
 * Submit quiz answers
 */
async function submitQuiz() {
    // Check if all questions are answered
    if (Object.keys(userAnswers).length < quiz.questionCount) {
        if (!confirm('Bazı sorular cevaplanmamış. Yine de göndermek istiyor musunuz?')) {
            return;
        }
    }

    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Prepare submission
    const answers = quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionId: userAnswers[q.id] || null
    }));

    const submissionData = {
        userId: currentUser.id,
        quizId: quiz.id,
        answers: answers.filter(a => a.selectedOptionId !== null)
    };

    try {
        const response = await APIService.post('/api/quizzes/submit', submissionData);

        if (response.ok) {
            const result = await response.json();
            showResults(result);
        } else {
            const error = await response.json();
            alert('Hata: ' + (error.message || 'Quiz gönderilemedi!'));
        }
    } catch (error) {
        console.error('Quiz gönderme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

/**
 * Show quiz results
 * @param {Object} result - Quiz result data
 */
function showResults(result) {
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');

    // Set result icon and message
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    if (result.passed) {
        resultIcon.classList.add('bg-green-100', 'text-green-600');
        resultTitle.textContent = 'Tebrikler! Başardınız!';
        resultMessage.textContent = 'Quiz\'i başarıyla tamamladınız.';
    } else {
        resultIcon.classList.add('bg-red-100', 'text-red-600');
        resultTitle.textContent = 'Quiz Tamamlandı';
        resultMessage.textContent = 'Geçme notuna ulaşamadınız. Tekrar deneyebilirsiniz.';
    }

    // Set score details
    document.getElementById('resultScore').textContent = `${result.earnedPoints}/${result.totalPoints}`;
    document.getElementById('resultCorrect').textContent = result.correctAnswers;
    document.getElementById('resultWrong').textContent = result.wrongAnswers;
    document.getElementById('resultPercentage').textContent = `%${Math.round(result.percentage)}`;

    // Show detailed results
    const questionResults = document.getElementById('questionResults');
    questionResults.innerHTML = `
        <h3 class="font-semibold text-slate-900 mb-4">Soru Sonuçları</h3>
        <div class="space-y-3">
            ${result.questionResults.map((qr, idx) => `
                <div class="p-4 border ${qr.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded-lg">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700">Soru ${idx + 1}</span>
                        <span class="text-sm font-medium ${qr.isCorrect ? 'text-green-700' : 'text-red-700'}">
                            ${qr.earnedPoints}/${qr.points} puan
                        </span>
                    </div>
                    <p class="text-sm text-slate-600 mb-2">${qr.questionText}</p>
                    <div class="text-sm">
                        <div class="${qr.isCorrect ? 'text-green-700' : 'text-red-700'}">
                            Cevabınız: ${qr.selectedOptionText}
                        </div>
                        ${!qr.isCorrect ? `<div class="text-green-700">Doğru cevap: ${qr.correctOptionText}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    lucide.createIcons();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initQuizDetailPage);
