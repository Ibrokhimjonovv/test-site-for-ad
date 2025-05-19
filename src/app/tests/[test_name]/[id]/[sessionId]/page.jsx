"use client"
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import "./layout.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";
import Questions from './questions';
import Header from './header';
import Results from './results';
import { AccessContext } from '@/contexts/contexts';
import Loading from '@/components/loading/layout';
import NotFound from '@/app/not-found';

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
  const testId = Number(id);

  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sciences, setSciences] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStatus, setTestStatus] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const { profileData } = useContext(AccessContext);
  const [opTracker, setOpTracker] = useState(false);


  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);

        // 1. Fetch test title/details from first endpoint
        // const testTitleRes = await fetch(`https://test.smartcoders.uz/api/tests_title/${testId}/`);
        // const testTitleData = await testTitleRes.json();

        // if (!testTitleRes.ok) {
        //   throw new Error('Failed to fetch test title');
        // }

        // 2. Fetch test questions from second endpoint
        const questionsRes = await fetch(`https://test.smartcoders.uz/api/tests/${testId}/`);
        const questionsData = await questionsRes.json();


        if (!questionsRes.ok) {
          throw new Error('Failed to fetch questions');
        }


        // 3. Prepare test data
        const testData = {
          id: testId,
          // title: testTitleData.title || "Test",
          testTime: questionsData.time_limit || 30, // Default to 30 minutes if not provided
          science: questionsData.science || [],
          testTitle: questionsData.title,
        };

        setCurrentTest(testData);
        setTimeLeft(testData.testTime * 60);

        // 4. Prepare questions data
        const formattedQuestions = questionsData.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map((opt, idx) => ({
            id: opt.id,
            text: opt.text,
            is_staff: opt.is_staff || false
          })),
          science_id: q.science_id,
          science_name: q.science_name || "Science",
          score: q.score || 1,
          time: q.time || null
        }));

        setQuestions(formattedQuestions);

        // 5. Prepare sciences data
        const uniqueScienceIds = [...new Set(formattedQuestions.map(q => q.science_id))];
        const formattedSciences = uniqueScienceIds.map(id => ({
          id,
          title: formattedQuestions.find(q => q.science_id === id)?.science_name || `Science ${id}`
        }));

        setSciences(formattedSciences);
        setTestStatus('active');

      } catch (error) {
        console.error('Error fetching test data:', error);
        router.push('/tests/all');
      } finally {
        setLoading(false);
      }
    };

    const initializeSession = () => {
      let session = sessionManager.getSession(sessionId);

      if (!session) {
        session = sessionManager.createSession(sessionId, testId);
      } else if (!sessionManager.validateSession(sessionId, testId)) {
        router.push('/tests/all');
        return;
      }

      if (session.answers && Object.keys(session.answers).length > 0) {
        const answers = session.answers;
        const lastQuestionIndex = Math.max(...Object.keys(answers).map(Number));
        setCurrentQuestionIndex(lastQuestionIndex);
        setSelectedOption(answers[lastQuestionIndex]);
      }
    };

    fetchTestData();
    initializeSession();
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

    questions.forEach((question, index) => {
      const userAnswerId = session?.answers?.[index];
      const correctOption = question.options.find(opt => opt.is_staff);
      if (userAnswerId && correctOption && userAnswerId === correctOption.id) {
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

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionId
    }));
    sessionManager.updateSession(sessionId, {
      answers: {
        ...sessionManager.getSession(sessionId).answers,
        [currentQuestionIndex]: optionId
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!profileData) {
    return <NotFound />
  }

  if (!currentTest) {
    return <div className="error-container">Test topilmadi</div>;
  }

  if (testStatus === 'completed' || testStatus === 'timeout') {
    const session = sessionManager.getSession(sessionId);
    return <Results questions={questions} session={session} testStatus={testStatus} score={score} sessionId={sessionId} sessionManager={sessionManager} />
  }

  // Test completion
  const finishTest = async () => {
    try {
      // 1. Session ma'lumotlarini olish va yakunlash
      let finalScore = 0;
      const session = sessionManager.getSession(sessionId);

      // To'g'ri javoblarni hisoblash
      questions.forEach((question, index) => {
        const userAnswerId = session?.answers?.[index];
        const correctOption = question.options.find(opt => opt.is_staff);
        if (userAnswerId && correctOption && userAnswerId === correctOption.id) {
          finalScore++;
        }
      });

      // 2. Vaqt hisoblarini amalga oshirish
      const currentTime = new Date();
      const startTime = new Date(session.startTime);
      const totalTimeTaken = Math.floor((currentTime - startTime) / 1000);
      const totalMinutes = String(Math.floor(totalTimeTaken / 60)).padStart(2, "0");
      const totalSeconds = String(totalTimeTaken % 60).padStart(2, "0");
      const formattedTime = `${Math.floor(totalTimeTaken / 60)} daqiqa ${totalTimeTaken % 60} soniya`;

      // 3. Javoblar ma'lumotlarini tayyorlash
      const answersData = Object.entries(session.answers || {}).map(([index, answerId]) => {
        const question = questions[index];
        return {
          question_id: question.id,
          selected_option_id: answerId,
        };
      });

      // 4. Natijalar obyektini tuzish
      const resultData = {
        user: profileData?.id,
        test_title: currentTest?.title || "Test",
        correct_answers: finalScore,
        incorrect_answers: questions.length - finalScore,
        unanswered_questions: questions.length - Object.keys(session.answers || {}).length,
        total_questions: questions.length,
        percentage_correct: ((finalScore / questions.length) * 100).toFixed(2),
        total_time_taken: `00:${totalMinutes}:${totalSeconds}`,
        time_taken: formattedTime,
        time_per_question: { 1: 1 }, // Default
      };

      // 5. API ga so'rovlar yuborish
      const [statsResponse, finishResponse] = await Promise.all([
        fetch(`https://test.smartcoders.uz/api/statistics/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessEdu")}`
          },
          body: JSON.stringify(resultData),
        }),
        fetch(`https://test.smartcoders.uz/api/finish/${testId}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessEdu")}`
          },
          body: JSON.stringify({ answers: answersData }),
        })
      ]);

      if (!statsResponse.ok || !finishResponse.ok) {
        throw new Error("Natijalarni saqlashda xato yuz berdi");
      }

      const finishData = await finishResponse.json();

      // 6. Sessionni yangilash va state ni o'zgartirish
      sessionManager.updateSession(sessionId, {
        status: 'completed',
        endTime: currentTime.toISOString(),
        isValid: false,
        score: finalScore,
        totalQuestions: questions.length,
        resultData: finishData
      });

      setScore(finalScore);
      setTestStatus('completed');

      // 7. Qo'shimcha ma'lumotlarni saqlash
      // setResults({
      //   ...resultData,
      //   total_score: finishData.total_score,
      //   ai_text: finishData.result
      // });

    } catch (error) {
      console.error("Testni yakunlashda xato:", error);
      // Xatolikni foydalanuvchiga ko'rsatish
      alert("Testni yakunlashda xato yuz berdi. Iltimos, qayta urunib ko'ring.");
    } finally {
      // 8. Tozalash ishlari
      // localStorage.removeItem("startTest");
      // localStorage.removeItem("startTime");
      // localStorage.removeItem("questionStartTime");
      // localStorage.removeItem("timePerQuestion");
    }
  };




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
      <Header
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        testStatus={testStatus}
        currentTest={currentTest}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        toggleZoom={toggleZoom}
        handleTimeout={handleTimeout}
        setTestStatus={setTestStatus}
        selectedOption={selectedOption}
        finishTest={finishTest}
        sessionId={sessionId}
      />

      <div className="all-questions">
        <div className="opener" onClick={() => setOpTracker(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144" /></svg>
        </div>
        <ProgressTracker
          test={{
            id: currentTest.id,
            science: currentTest.science,
            questions: questions,
            title: currentTest.testTitle
          }}
          selectedAnswers={selectedAnswers}
          currentQuestionIndex={currentQuestionIndex}
          isTestFinished={testStatus === 'completed' || testStatus === 'timeout'}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          sciences={sciences}
          opener={opTracker}
          setOpener={setOpTracker}
        />
        <Questions
          toggleZoom={toggleZoom}
          currentQuestionIndex={currentQuestionIndex}
          currentQuestion={currentQuestion}
          selectedOption={selectedOption}
          questions={questions}
          setSelectedOption={setSelectedOption}
          sessionManager={sessionManager}
          sessionId={sessionId}
          setScore={setScore}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setTestStatus={setTestStatus}
          isZoomed={isZoomed}
          handleBackButton={handleBackButton}
          handleOptionSelect={handleOptionSelect}
          finishTest={finishTest}
        />
      </div>
    </div>
  );
}
const ProgressTracker = ({
  test = {},
  selectedAnswers = {},
  currentQuestionIndex = 0,
  isTestFinished = false,
  setCurrentQuestionIndex = () => { },
  sciences = [],
  opener, setOpener
}) => {
  // Safely extract science IDs and questions
  const scienceIds = Array.isArray(test.science) ? test.science : [];
  const questions = Array.isArray(test.questions) ? test.questions : [];

  const groupQuestionsByScience = () => {
    const grouped = {};

    // 1. First create groups for all sciences in the test
    scienceIds.forEach(scienceId => {
      const science = sciences.find(s => s.id === scienceId);
      if (science) {
        grouped[scienceId] = {
          id: scienceId,
          name: science.title,
          questions: [],
          count: 0
        };
      }
    });

    // 2. Assign questions to their sciences while preserving original order
    questions.forEach((question, globalIndex) => {
      const scienceId = question.science_id;
      if (grouped[scienceId]) {
        grouped[scienceId].questions.push({
          ...question,
          globalIndex // Preserve original position
        });
        grouped[scienceId].count++;
      }
    });

    // 3. Sort science groups by question count (descending)
    const sortedGroups = Object.values(grouped).sort((a, b) => b.count - a.count);

    // 4. Calculate global indices for each question
    let globalCounter = 0;
    const finalGroups = sortedGroups.map(group => {
      const questionsWithGlobalIndices = group.questions.map(q => ({
        ...q,
        displayIndex: globalCounter++
      }));
      return {
        ...group,
        questions: questionsWithGlobalIndices
      };
    });

    return finalGroups;
  };

  const getQuestionStatus = (question) => {
    const isAnswered = selectedAnswers.hasOwnProperty(question.globalIndex);
    let answerLetter = "";

    if (isAnswered && questions[question.globalIndex]) {
      const selectedOptionId = selectedAnswers[question.globalIndex];
      const selectedOptionIndex = questions[question.globalIndex].options.findIndex(
        opt => opt.id === selectedOptionId
      );
      if (selectedOptionIndex >= 0) {
        answerLetter = String.fromCharCode(65 + selectedOptionIndex);
      }
    }

    if (isTestFinished) {
      if (isAnswered) {
        const correctOption = questions[question.globalIndex].options.find(opt => opt.is_staff);
        const isCorrect = correctOption?.id === selectedAnswers[question.globalIndex];
        return {
          status: isCorrect ? "correct" : "incorrect",
          answerLetter
        };
      }
      return {
        status: "unanswered",
        answerLetter
      };
    }

    return {
      status: isAnswered ? "answered" : "neutral",
      answerLetter
    };
  };

  const formatScienceTitle = (title) => {
    if (title.includes("_kasbiy_stan") || title.includes("Kasbiy_standart")) {
      return `${title.split('_')[0]} (Kasbiy standart)`;
    } else if (title.includes("_ped_mahorat") || title.includes("Pedmahorat")) {
      return `${title.split('_')[0]} (Pedagogik mahorat)`;
    }
    return title;
  };

  const scienceGroups = groupQuestionsByScience();


  return (
    <div className={`progress-tracker ${opener ? "act" : ""}`}>
      <div className="closer" onClick={() => setOpener(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144" /></svg>
      </div>
      <h2>{test.title}</h2>
      {scienceGroups.map((science) => (
        <div key={science.id} className="subject-section">
          <div className="subject-header">
            <h3>{formatScienceTitle(science.name)}</h3>
            <span className="question-count">
              {science.count} ta
            </span>
          </div>
          <div className="subject-questions">
            {science.questions.map((question) => {
              const { status, answerLetter } = getQuestionStatus(question);
              const isCurrent = question.globalIndex === currentQuestionIndex;

              return (
                <div
                  key={question.id}
                  className={`circle ${status} ${isCurrent ? "current" : ""}`}
                  onClick={() => setCurrentQuestionIndex(question.globalIndex)}
                  title={`Savol ${question.displayIndex + 1} - ${answerLetter ? `Tanlangan variant: ${answerLetter}` : 'Javob berilmagan'}`}
                >
                  {question.displayIndex + 1}
                  {answerLetter && <span className="selected-option">{answerLetter}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};