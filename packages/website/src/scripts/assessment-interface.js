import { assessmentEngine } from '@/lib/assessment/AssessmentEngine.js';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager.js';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer.js';

export class AssessmentInterface {
  constructor(assessmentId, assessmentData) {
    this.assessmentId = assessmentId;
    this.assessmentType = assessmentData;
    this.session = null;
    this.currentQuestion = null;
    this.timeInterval = null;
    this.startTime = Date.now();
    this.assessmentEngine = assessmentEngine;
    this.questionBankManager = questionBankManager;
    this.resultsAnalyzer = resultsAnalyzer;

    this.initializeInterface();
  }

  async initializeInterface() {
    try {
      console.log('Initializing assessment interface...', {
        assessmentId: this.assessmentId,
        assessmentData: this.assessmentType
      });

      // Start or resume session
      console.log('Starting assessment session...');
      this.session = this.assessmentEngine.startAssessment(this.assessmentId, 'zh');
      if (!this.session) {
        throw new Error('Failed to start assessment');
      }
      console.log('Assessment session started:', this.session);

      // Initialize UI
      this.setupInterface();
      this.loadCurrentQuestion();
      this.startTimer();

      // Hide loading, show interface
      document.getElementById('loading-state').classList.add('hidden');
      document.getElementById('assessment-interface').classList.remove('hidden');

    } catch (error) {
      console.error('Failed to initialize assessment:', error);
      // Hide loading state and show error
      document.getElementById('loading-state').classList.add('hidden');
      this.showError('加载评测失败，请刷新页面重试。错误: ' + error.message);
    }
  }

  setupInterface() {
    // Set assessment title
    document.getElementById('assessment-title').textContent = this.assessmentType.name;

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById('prev-btn').addEventListener('click', () => this.goToPreviousQuestion());
    document.getElementById('next-btn').addEventListener('click', () => this.submitCurrentAnswer());
    document.getElementById('save-btn').addEventListener('click', () => this.saveProgress());
    document.getElementById('pause-btn').addEventListener('click', () => this.showPauseModal());

    // Pause modal
    document.getElementById('continue-btn').addEventListener('click', () => this.hidePauseModal());
    document.getElementById('exit-btn').addEventListener('click', () => this.exitAssessment());

    // Scale input
    const scaleInput = document.getElementById('scale-input');
    scaleInput.addEventListener('input', (e) => {
      document.getElementById('scale-current-value').textContent = e.target.value;
    });

    // Auto-save on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveProgress();
      }
    });

    // Prevent accidental page leave
    window.addEventListener('beforeunload', (e) => {
      if (this.session && this.session.status === 'active') {
        e.preventDefault();
        e.returnValue = '';
        this.saveProgress();
      }
    });
  }

  loadCurrentQuestion() {
    this.currentQuestion = this.assessmentEngine.getCurrentQuestion(this.session.id);
    if (!this.currentQuestion) {
      this.completeAssessment();
      return;
    }

    this.updateProgress();
    this.displayQuestion();
    this.updateNavigationButtons();
  }

  updateProgress() {
    const progress = this.assessmentEngine.getProgress(this.session.id);
    if (!progress) return;

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progress.percentage}%`;

    // Update progress text
    document.getElementById('progress-text').textContent =
      `${progress.current + 1} / ${progress.total}`;

    // Update question number
    document.getElementById('question-number').textContent =
      `第 ${progress.current + 1} 题 / 共 ${progress.total} 题`;
  }

  displayQuestion() {
    // Set question text
    document.getElementById('question-text').textContent = this.currentQuestion.text;

    // Show/hide required indicator
    const requiredIndicator = document.getElementById('question-required');
    if (this.currentQuestion.required) {
      requiredIndicator.classList.remove('hidden');
    } else {
      requiredIndicator.classList.add('hidden');
    }

    // Clear previous answer displays
    this.clearAnswerDisplays();

    // Display appropriate answer interface
    switch (this.currentQuestion.type) {
      case 'single_choice':
      case 'multiple_choice':
        this.displayChoiceQuestion();
        break;
      case 'scale':
        this.displayScaleQuestion();
        break;
      case 'text':
        this.displayTextQuestion();
        break;
    }

    // Load existing answer if any
    this.loadExistingAnswer();
  }

  clearAnswerDisplays() {
    document.getElementById('answer-options').innerHTML = '';
    document.getElementById('scale-question').classList.add('hidden');
    document.getElementById('text-question').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');
  }

  displayChoiceQuestion() {
    const container = document.getElementById('answer-options');
    const isMultiple = this.currentQuestion.type === 'multiple_choice';

    this.currentQuestion.options?.forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'flex items-center';

      const input = document.createElement('input');
      input.type = isMultiple ? 'checkbox' : 'radio';
      input.id = option.id;
      input.name = 'answer';
      input.value = option.id;
      input.className = 'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600';

      const label = document.createElement('label');
      label.htmlFor = option.id;
      label.className = 'ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer flex-1 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
      label.textContent = option.text;

      optionDiv.appendChild(input);
      optionDiv.appendChild(label);
      container.appendChild(optionDiv);
    });
  }

  displayScaleQuestion() {
    const scaleDiv = document.getElementById('scale-question');
    scaleDiv.classList.remove('hidden');

    const scaleInput = document.getElementById('scale-input');
    scaleInput.min = this.currentQuestion.scaleMin || 0;
    scaleInput.max = this.currentQuestion.scaleMax || 10;
    scaleInput.value = Math.floor((parseInt(scaleInput.min) + parseInt(scaleInput.max)) / 2);

    document.getElementById('scale-min-value').textContent = scaleInput.min;
    document.getElementById('scale-max-value').textContent = scaleInput.max;
    document.getElementById('scale-current-value').textContent = scaleInput.value;

    if (this.currentQuestion.scaleLabels) {
      document.getElementById('scale-min-label').textContent = this.currentQuestion.scaleLabels.min;
      document.getElementById('scale-max-label').textContent = this.currentQuestion.scaleLabels.max;
    }
  }

  displayTextQuestion() {
    document.getElementById('text-question').classList.remove('hidden');
    document.getElementById('text-input').value = '';
  }

  loadExistingAnswer() {
    const existingAnswer = this.session.answers.find(a => a.questionId === this.currentQuestion.id);
    if (!existingAnswer) return;

    switch (this.currentQuestion.type) {
      case 'single_choice':
        const radioInput = document.querySelector(`input[value="${existingAnswer.value}"]`);
        if (radioInput) radioInput.checked = true;
        break;
      case 'multiple_choice':
        if (Array.isArray(existingAnswer.value)) {
          existingAnswer.value.forEach(value => {
            const checkboxInput = document.querySelector(`input[value="${value}"]`);
            if (checkboxInput) checkboxInput.checked = true;
          });
        }
        break;
      case 'scale':
        const scaleInput = document.getElementById('scale-input');
        scaleInput.value = existingAnswer.value;
        document.getElementById('scale-current-value').textContent = existingAnswer.value;
        break;
      case 'text':
        document.getElementById('text-input').value = existingAnswer.value || '';
        break;
    }
  }

  getCurrentAnswer() {
    switch (this.currentQuestion.type) {
      case 'single_choice':
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        return selectedRadio ? selectedRadio.value : null;

      case 'multiple_choice':
        const selectedCheckboxes = document.querySelectorAll('input[name="answer"]:checked');
        return Array.from(selectedCheckboxes).map(cb => cb.value);

      case 'scale':
        return parseInt(document.getElementById('scale-input').value);

      case 'text':
        return document.getElementById('text-input').value.trim();

      default:
        return null;
    }
  }

  submitCurrentAnswer() {
    const answer = this.getCurrentAnswer();

    // Validate answer
    if (this.currentQuestion.required && (answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
      this.showError('请回答此问题后再继续。');
      return;
    }

    // Submit answer
    const result = this.assessmentEngine.submitAnswer(this.session.id, answer);
    if (!result.success) {
      this.showError('提交答案失败，请重试。');
      return;
    }

    // Check if completed
    if (result.completed) {
      this.completeAssessment();
    } else {
      this.loadCurrentQuestion();
    }
  }

  goToPreviousQuestion() {
    const prevQuestion = this.assessmentEngine.goToPreviousQuestion(this.session.id);
    if (prevQuestion) {
      this.loadCurrentQuestion();
    }
  }

  updateNavigationButtons() {
    const progress = this.assessmentEngine.getProgress(this.session.id);
    if (!progress) return;

    // Update previous button
    const prevBtn = document.getElementById('prev-btn');
    prevBtn.disabled = progress.current === 0;

    // Update next button text
    const nextBtn = document.getElementById('next-btn');
    if (progress.current === progress.total - 1) {
      nextBtn.innerHTML = '完成评测 <svg class="w-4 h-4 ml-2 inline" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
    } else {
      nextBtn.innerHTML = '下一题 <svg class="w-4 h-4 ml-2 inline" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>';
    }
  }

  async completeAssessment() {
    // Hide interface, show completion
    document.getElementById('assessment-interface').classList.add('hidden');
    document.getElementById('completion-state').classList.remove('hidden');

    try {
      // Analyze results
      const result = this.resultsAnalyzer.analyzeSession(this.session);
      if (result) {
        // Redirect to results page
        setTimeout(() => {
          window.location.href = `/assessment/results/${result.id}/`;
        }, 2000);
      } else {
        throw new Error('Failed to analyze results');
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      this.showError('分析结果失败，请联系技术支持。');
    }
  }

  saveProgress() {
    // Progress is automatically saved by the assessment engine
    // Show a brief confirmation
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '已保存';
    saveBtn.classList.add('bg-green-600', 'text-white');

    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.classList.remove('bg-green-600', 'text-white');
    }, 1500);
  }

  showPauseModal() {
    this.assessmentEngine.pauseAssessment(this.session.id);
    document.getElementById('pause-modal').classList.remove('hidden');
  }

  hidePauseModal() {
    this.assessmentEngine.resumeAssessment(this.session.id);
    document.getElementById('pause-modal').classList.add('hidden');
  }

  exitAssessment() {
    this.assessmentEngine.pauseAssessment(this.session.id);
    window.location.href = '/assessment/';
  }

  startTimer() {
    this.timeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('time-spent').textContent =
        `用时: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  showError(message) {
    console.error('Assessment Error:', message);
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      const errorText = errorDiv.querySelector('p');
      if (errorText) {
        errorText.textContent = message;
      }
      errorDiv.classList.remove('hidden');

      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorDiv.classList.add('hidden');
      }, 5000);
    } else {
      // Fallback: show alert if error div not found
      alert(message);
    }
  }
}
