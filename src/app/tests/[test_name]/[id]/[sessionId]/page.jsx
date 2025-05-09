"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import "./layout.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";
import Questions from './questions';
import Header from './header';

// Test data
const tests = [
  {
    id: 1,
    testTitle: "Prezident Maktablari Testi",
    testTime: 10,
    testDescription: "Saralash bosqichiga tayyorgarlik ko'rayotgan o'quvchilar uchun mo'ljallangan",
    science: [1, 2] // Added science IDs for the tracker
  },
  {
    id: 2,
    testTitle: "Piima Testi",
    testTime: 15,
    testDescription: "Piima haqida bilimingizni sinang",
    science: [3]
  },
  {
    id: 3,
    testTitle: "Prezident Maktablari Testi 2",
    testTime: 20,
    testDescription: "Prezident maktablariga tayyorgarlik",
    science: [1, 4]
  }
];

const testQuestions = {
  1: [
    {
      id: 1,
      question: "15 × 3 nechaga teng?",
      options: ["35", "45", "55", "65"],
      correctAnswer: 1,
      science_id: 1
    },
    {
      id: 2,
      question: "Quyidagi so'zlardan qaysi biri ot turkumiga kiradi?",
      options: ["yurish", "kitob", "yaxshi", "tez"],
      correctAnswer: 1,
      science_id: 2
    }
  ],
  2: [
    {
      id: 1,
      question: "Piima qanday sut mahsulotidir?",
      options: ["Quyuq", "Yarim quyuq", "Suyuq", "Qattiq"],
      correctAnswer: 1,
      science_id: 3
    }
  ],
  3: [
    {
      id: 1,
      question: "48 : 6 nechaga teng?",
      options: ["6", "7", "8", "9"],
      correctAnswer: 2,
      science_id: 1
    }
  ]
};

// Mock sciences data for the tracker
const mockSciences = [
  { id: 1, title: "Matematika" },
  { id: 2, title: "Ona tili" },
  { id: 3, title: "Biologiya" },
  { id: 4, title: "Fizika" }
];
// Session manager
const sessionManager = {
  getAllSessions() {
    return JSON.parse(localStorage.getItem('testSessions')) || {};
  },

  createSession(sessionId, testId) {
    const sessions = this.getAllSessions();
    const newSession = {
      sessionId,
      testId,
      status: 'active',
      startTime: new Date().toISOString(),
      answers: {},
      isValid: true
    };
    sessions[sessionId] = newSession;
    localStorage.setItem('testSessions', JSON.stringify(sessions));
    return newSession;
  },

  getSession(sessionId) {
    const sessions = this.getAllSessions();
    return sessions[sessionId] || null;
  },

  updateSession(sessionId, updates) {
    const sessions = this.getAllSessions();
    if (sessions[sessionId]) {
      sessions[sessionId] = { ...sessions[sessionId], ...updates };
      localStorage.setItem('testSessions', JSON.stringify(sessions));
      return sessions[sessionId];
    }
    return null;
  },

  invalidateSession(sessionId) {
    this.updateSession(sessionId, { isValid: false });
  },

  deleteSession(sessionId) {
    const sessions = this.getAllSessions();
    delete sessions[sessionId];
    localStorage.setItem('testSessions', JSON.stringify(sessions));
  },

  validateSession(sessionId, testId) {
    const session = this.getSession(sessionId);
    if (!session) return false;
    if (!session.isValid) return false;
    if (session.status !== 'active') return false;
    if (session.testId !== testId) return false;
    return true;
  }
};


export default function TestComponent() {
  const params = useParams();
  const { id, sessionId } = params;
  const router = useRouter();
  const testId = parseInt(id);

  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStatus, setTestStatus] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const initializeTest = () => {
      const test = tests.find(t => t.id === testId);
      if (!test) {
        router.push('/tests/all');
        return;
      }

      let session = sessionManager.getSession(sessionId);

      if (!session) {
        session = sessionManager.createSession(sessionId, testId);
      } else if (!sessionManager.validateSession(sessionId, testId)) {
        router.push('/tests/all');
        return;
      }

      setCurrentTest(test);
      setQuestions(testQuestions[testId] || []);
      setTimeLeft(test.testTime * 60);
      setTestStatus('active');

      if (session.answers && Object.keys(session.answers).length > 0) {
        const answers = session.answers;
        const lastQuestionIndex = Math.max(...Object.keys(answers).map(Number));
        setCurrentQuestionIndex(lastQuestionIndex);
        setSelectedOption(answers[lastQuestionIndex]);
      }

      setLoading(false);
    };

    initializeTest();
  }, [testId, sessionId, router]);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      window.history.pushState({ isZoomed: true }, '');
      window.addEventListener('popstate', handleBackButton);
    } else {
      window.removeEventListener('popstate', handleBackButton);
    }
  };

  const handleBackButton = (event) => {
    if (isZoomed) {
      event.preventDefault();
      toggleZoom();
      if (window.history.state?.isZoomed) {
        window.history.back();
      }
    }
  };

  const handleTimeout = () => {
    const session = sessionManager.getSession(sessionId);
    let finalScore = 0;

    Object.entries(session.answers || {}).forEach(([index, answer]) => {
      if (questions[index]?.correctAnswer === answer) {
        finalScore++;
      }
    });

    sessionManager.updateSession(sessionId, {
      status: 'timeout',
      endTime: new Date().toISOString(),
      isValid: false,
      score: finalScore,
      totalQuestions: questions.length
    });

    setScore(finalScore);
    setTestStatus('timeout');
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
    sessionManager.updateSession(sessionId, {
      answers: {
        ...sessionManager.getSession(sessionId).answers,
        [currentQuestionIndex]: optionIndex
      }
    });
  };

  if (loading) {
    return <div className="loading-container">Yuklanmoqda...</div>;
  }

  if (!currentTest) {
    return <div className="error-container">Test topilmadi</div>;
  }

  if (testStatus === 'completed' || testStatus === 'timeout') {
    const session = sessionManager.getSession(sessionId);

    return (
      <div className="test-container">
        <div className="test-result">
          <h2>{testStatus === 'timeout' ? "Vaqt tugadi!" : "Test yakunlandi!"}</h2>
          <p>Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz</p>
          <p>To'g'ri javoblar foizi: {Math.round((score / questions.length) * 100)}%</p>

          <div className="answers-review">
            <h3>Javoblaringizni ko'rib chiqing:</h3>
            {questions.map((question, index) => {
              const userAnswer = session?.answers?.[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <p><strong>Savol {index + 1}:</strong> {question.question}</p>
                  <p>Sizning javobingiz: {question.options[userAnswer] ?? "Javob bermagansiz"}</p>
                  {!isCorrect && (
                    <p>To'g'ri javob: {question.options[question.correctAnswer]}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="return-button"
            onClick={() => {
              sessionManager.deleteSession(sessionId);
              router.push('/tests/all');
            }}
          >
            Testlar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="test-container">
        <div className="no-questions">
          <p>Ushbu testda savollar mavjud emas</p>
          <button onClick={() => router.push('/tests/all')}>Orqaga qaytish</button>
        </div>
      </div>
    );
  }
  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="test-container">
      <Header timeLeft={timeLeft} setTimeLeft={setTimeLeft} testStatus={testStatus} currentTest={currentTest} currentQuestionIndex={currentQuestionIndex} questions={questions} toggleZoom={toggleZoom} handleTimeout={handleTimeout} />

      <div className="all-questions">
        <ProgressTracker
          test={{
            ...currentTest,
            questions: questions
          }}
          selectedAnswers={selectedAnswers}
          currentQuestionIndex={currentQuestionIndex}
          isTestFinished={testStatus === 'completed' || testStatus === 'timeout'}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
        />
        <Questions toggleZoom={toggleZoom} currentQuestionIndex={currentQuestionIndex} currentQuestion={currentQuestion} selectedOption={selectedOption} questions={questions} setSelectedOption={setSelectedOption} sessionManager={sessionManager} sessionId={sessionId} setScore={setScore} setCurrentQuestionIndex={setCurrentQuestionIndex} setTestStatus={setTestStatus} isZoomed={isZoomed} handleBackButton={handleBackButton} handleOptionSelect={handleOptionSelect} />
      </div>
    </div>
  );
}

const ProgressTracker = ({
  test,
  selectedAnswers,
  currentQuestionIndex,
  isTestFinished,
  setCurrentQuestionIndex
}) => {
  const [sciences, setSciences] = useState(mockSciences);

  const groupQuestionsByScience = () => {
    const grouped = {};
    
    test.science.forEach(id => {
      const title = sciences.find(s => s.id === id)?.title || "";
      grouped[id] = {
        name: title,
        questions: [],
        count: 0,
        startIndex: 0
      };
    });

    test.questions.forEach((question) => {
      const scienceId = question.science_id || test.science[0];
      if (grouped[scienceId]) {
        grouped[scienceId].questions.push(question);
        grouped[scienceId].count++;
      }
    });

    let currentIndex = 0;
    Object.values(grouped).forEach(group => {
      group.startIndex = currentIndex;
      currentIndex += group.count;
    });

    return Object.values(grouped).sort((a, b) => b.count - a.count);
  };

  const getQuestionStatus = (index) => {
    const isAnswered = selectedAnswers.hasOwnProperty(index);
    let answerText = "";

    if (isAnswered) {
      const selectedOptionIndex = selectedAnswers[index];
      answerText = String.fromCharCode(65 + selectedOptionIndex); // A, B, C, D
    }

    if (isTestFinished) {
      const isCorrect = selectedAnswers[index] === test.questions[index]?.correctAnswer;
      return {
        status: isAnswered ? (isCorrect ? "correct" : "incorrect") : "unanswered",
        answerText
      };
    } else {
      return {
        status: isAnswered ? "answered" : "neutral",
        answerText
      };
    }
  };

  const scienceGroups = groupQuestionsByScience();

  return (
    <div className="progress-tracker">
      {scienceGroups.map((science, scienceIndex) => (
        <div key={scienceIndex} className="subject-section">
          <div className="subject-header">
            <h3>{science.name} <span className="question-count">({science.count} savol)</span></h3>
          </div>
          <div className="subject-questions">
            {science.questions.map((question, index) => {
              const globalIndex = science.startIndex + index;
              const { status, answerText } = getQuestionStatus(globalIndex);

              return (
                <div
                  key={globalIndex}
                  className={`circle ${status} ${
                    globalIndex === currentQuestionIndex ? "current" : ""
                  }`}
                  onClick={() => setCurrentQuestionIndex(globalIndex)}
                  title={`Savol ${globalIndex + 1} - ${answerText ? `Tanlangan variant: ${answerText}` : 'Javob berilmagan'}`}
                >
                  {globalIndex + 1}
                  {answerText && <span className="selected-option">{answerText}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};