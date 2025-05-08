"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import "./layout.scss";

// Testlar va savollar bazasi
const tests = [
  {
    id: 1,
    testTitle: "Prezident Maktablari Testi",
    testTime: 10, // daqiqa
    testDescription: "Saralash bosqichiga tayyorgarlik ko'rayotgan o'quvchilar uchun mo'ljallangan"
  },
  {
    id: 2,
    testTitle: "Piima Testi",
    testTime: 15,
    testDescription: "Piima haqida bilimingizni sinang"
  },
  {
    id: 3,
    testTitle: "Prezident Maktablari Testi 2",
    testTime: 20,
    testDescription: "Prezident maktablariga tayyorgarlik"
  }
];

const testQuestions = {
  1: [ // Prezident maktablari testi savollari
    {
      id: 1,
      question: "15 × 3 nechaga teng?",
      options: ["35", "45", "55", "65"],
      correctAnswer: 1 // index 1 - "45"
    },
    {
      id: 2,
      question: "Quyidagi so'zlardan qaysi biri ot turkumiga kiradi?",
      options: ["yurish", "kitob", "yaxshi", "tez"],
      correctAnswer: 1 // "kitob"
    }
  ],
  2: [ // Piima testi savollari
    {
      id: 1,
      question: "Piima qanday sut mahsulotidir?",
      options: ["Quyuq", "Yarim quyuq", "Suyuq", "Qattiq"],
      correctAnswer: 1 // "Yarim quyuq"
    }
  ],
  3: [ // Prezident maktablari testi 2 savollari
    {
      id: 1,
      question: "48 : 6 nechaga teng?",
      options: ["6", "7", "8", "9"],
      correctAnswer: 2 // "8"
    }
  ]
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
  const [timeLeft, setTimeLeft] = useState(180);
  const [testCompleted, setTestCompleted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [validSession, setValidSession] = useState(false);


  // Test ma'lumotlarini yuklash
  useEffect(() => {
    const test = tests.find(t => t.id === testId);
    if (!test) {
      router.push('/tests/all');
      return;
    }

    setCurrentTest(test);
    setQuestions(testQuestions[testId] || []);
    setTimeLeft(test.testTime * 60); // daqiqalarni sekundga aylantiramiz
  }, [testId, router]);

  // Vaqt hisobi
  useEffect(() => {
    if (timeLeft <= 0 || testCompleted) return;

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, testCompleted]);

  // Vaqt tugashi
  useEffect(() => {
    if (timeLeft === 0 && !testCompleted) {
      finishTest();
    }
  }, [timeLeft, testCompleted]);

  useEffect(() => {
    // Session ID ni tekshirish
    const storedSession = localStorage.getItem('currentTestSession');

    if (!sessionId || (storedSession && storedSession !== sessionId)) {
      router.push('/tests/all');
      return;
    }

    // Yangi session boshlanganida saqlaymiz
    if (!storedSession) {
      localStorage.setItem('currentTestSession', sessionId);
    }

    setValidSession(true);
  }, [sessionId, router]);



  useEffect(() => {
    const initializeTest = async () => {
      try {
        // 1. Sessionni tekshirish
        const sessionResponse = await fetch('/site/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const sessionData = await sessionResponse.json();

        if (!sessionData.valid) {
          router.push('/tests/all');
          return;
        }

        // 2. Test ma'lumotlarini yuklash
        const test = tests.find(t => t.id === testId);
        if (!test) {
          router.push('/tests/all');
          return;
        }

        // 3. Sessionni yangilash
        await fetch('/site/update-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            status: 'started',
            testId
          }),
        });

        // 4. Stateni yangilash
        setCurrentTest(test);
        setQuestions(testQuestions[testId] || []);
        setTimeLeft(test.testTime * 60);
        setValidSession(true);

      } catch (error) {
        console.error("Initialization error:", error);
        router.push('/tests/all');
      }
      //  finally {
      //   setLoading(false);
      // }
    };

    initializeTest();
  }, [testId, sessionId, router]);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    // Javobni tekshirish
    if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }

    // Keyingi savolga o'tish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(answers[currentQuestionIndex + 1] || null);
    } else {
      finishTest();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[currentQuestionIndex - 1] || null);
    }
  };

  const finishTest = async () => {
    try {
      // 1. Natijalarni hisoblash
      const finalScore = selectedOption === questions[currentQuestionIndex]?.correctAnswer
        ? score + 1
        : score;

      // 2. Sessionni yakunlash
      await fetch('/site/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'completed',
          score: finalScore,
          totalQuestions: questions.length
        }),
      });

      // 3. Local storagedan o'chirish
      localStorage.removeItem('currentTestSession');

      // 4. Stateni yangilash
      setScore(finalScore);
      setTestCompleted(true);

    } catch (error) {
      console.error("Error finishing test:", error);
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTest) {
    return <div>Yuklanmoqda...</div>;
  }

  if (!validSession) {
    return <div>Yuklanmoqda...</div>;
  }

  if (testCompleted) {
    return (
      <div className="test-container">
        <div className="test-result">
          <h2>Test yakunlandi!</h2>
          <p>Siz {questions.length} ta savoldan {score} tasiga to'g'ri javob berdingiz</p>
          <p>To'g'ri javoblar foizi: {Math.round((score / questions.length) * 100)}%</p>

          <div className="answers-review">
            <h3>Javoblaringizni ko'rib chiqing:</h3>
            {questions.map((question, index) => (
              <div key={index} className={`question-review ${answers[index] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                <p><strong>Savol {index + 1}:</strong> {question.question}</p>
                <p>Sizning javobingiz: {question.options[answers[index]]}</p>
                {answers[index] !== question.correctAnswer && (
                  <p>To'g'ri javob: {question.options[question.correctAnswer]}</p>
                )}
              </div>
            ))}
          </div>

          <button
            className="return-button"
            onClick={() => router.push('/tests/all')}
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
      <div className="test-header">
        <h2>{currentTest.testTitle}</h2>
        <div className="test-info">
          <div className="timer">Qolgan vaqt: {formatTime(timeLeft)}</div>
          <div className="progress">
            Savol {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>

        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`option ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Oldingi savol
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            Keyingi savol
          </button>
        ) : (
          <button
            onClick={finishTest}
            disabled={selectedOption === null}
            className="finish-button"
          >
            Testni yakunlash
          </button>
        )}
      </div>
    </div>
  );
}