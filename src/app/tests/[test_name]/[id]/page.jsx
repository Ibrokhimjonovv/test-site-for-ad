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
import { api } from '@/config';

export default function TestComponent() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const testId = id;

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

        const questionsRes = await fetch(`${api}/edu_maktablar/test/${testId}/`);
        const questionsData = await questionsRes.json();

        if (!questionsRes.ok) {
          throw new Error('Failed to fetch questions');
        }

        // Convert time from "HH:MM:SS" to minutes
        const timeParts = questionsData.time.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const totalMinutes = (hours * 60) + minutes;

        const testData = {
          id: testId,
          testTime: totalMinutes || 30,
          science: questionsData.science || [],
          testTitle: questionsData.title,
        };

        setCurrentTest(testData);
        setTimeLeft(testData.testTime * 60);

        // Convert questions_grouped_by_science object to array
        const formattedQuestions = [];
        for (const scienceName in questionsData.questions_grouped_by_science) {
          const scienceQuestions = questionsData.questions_grouped_by_science[scienceName];
          scienceQuestions.forEach((q, index) => {
            formattedQuestions.push({
              id: q.id,
              text: q.text,
              options: q.options.map((opt, idx) => ({
                id: opt.id,
                text: opt.text,
                is_staff: opt.is_staff || false
              })),
              science_id: q.science_id,
              science_name: scienceName, // Use the science name from the object key
              score: q.score || 1,
              time: q.time || null,
              image: q.text.includes('<img') ? q.text.match(/src="([^"]*)"/)[1] : null
            });
          });
        }

        setQuestions(formattedQuestions);

        const uniqueScienceIds = [...new Set(formattedQuestions.map(q => q.science_id))];
        const formattedSciences = uniqueScienceIds.map(id => ({
          id,
          title: formattedQuestions.find(q => q.science_id === id)?.science_name || `Science ${id}`
        }));

        setSciences(formattedSciences);
        setTestStatus('active');

      } catch (error) {
        console.error('Error fetching test data:', error);
        // router.push('/tests/all');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, router]);

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
    let finalScore = 0;

    questions.forEach((question, index) => {
      const userAnswerId = selectedAnswers[index];
      const correctOption = question.options.find(opt => opt.is_staff);
      if (userAnswerId && correctOption && userAnswerId === correctOption.id) {
        finalScore++;
      }
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
  };

  if (loading) {
    return <Loading />;
  }

  if (!profileData) {
    return <NotFound />
  }

  if (!currentTest) {
    return <div className="error-container">
      <div className="test-error-content">
        <h2>Test topilmadi!</h2>
        <button onClick={() => router.push('/tests/all/')}>Ortga qaytish</button>
      </div>
    </div>;
  }

  if (testStatus === 'completed' || testStatus === 'timeout') {
    return <Results
      questions={questions}
      testStatus={testStatus}
      score={score}
      selectedAnswers={selectedAnswers}
    />
  }

  const finishTest = async () => {
  try {
    let finalScore = 0;

    // Prepare answers data with validation
    const answersData = [];
    const validatedAnswers = {};
    
    // First validate all answers
    for (const [index, answerId] of Object.entries(selectedAnswers)) {
      const questionIndex = parseInt(index);
      const question = questions[questionIndex];
      
      if (!question) {
        console.error(`Question not found at index ${questionIndex}`);
        continue;
      }
      
      const selectedOption = question.options.find(opt => opt.id === answerId);
      if (!selectedOption) {
        console.error(`Option ${answerId} not found in question ${question.id}`);
        continue;
      }
      
      // Count correct answers
      const correctOption = question.options.find(opt => opt.is_staff);
      if (correctOption && answerId === correctOption.id) {
        finalScore++;
      }
      
      // Add to validated answers
      answersData.push({
        question_id: question.id,
        selected_option_id: answerId,
      });
      
      validatedAnswers[questionIndex] = answerId;
    }

    // Calculate time metrics
    const totalTimeTaken = currentTest.testTime * 60 - timeLeft;
    const timePerQuestion = totalTimeTaken / questions.length;

    // Prepare statistics data
    const resultData = {
      user: profileData?.id,
      test_title: currentTest?.title || "Test",
      correct_answers: finalScore,
      incorrect_answers: questions.length - finalScore,
      unanswered_questions: questions.length - Object.keys(validatedAnswers).length,
      total_questions: questions.length,
      percentage_correct: ((finalScore / questions.length) * 100).toFixed(2),
      total_time_taken: totalTimeTaken,
      time_per_question: {1:1},
    };

    // Send requests
    const [statsResponse, finishResponse] = await Promise.all([
      fetch(`${api}/edu_maktablar/statistics/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessEdu")}`
        },
        body: JSON.stringify(resultData),
      }),
      fetch(`${api}/edu_maktablar/finish/${testId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessEdu")}`
        },
        body: JSON.stringify({ 
          answers: answersData,
          user_id: profileData?.id 
        }),
      })
    ]);

    // Handle responses
    if (!statsResponse.ok) {
      const statsError = await statsResponse.json();
      console.error("Statistics error:", statsError);
      throw new Error("Natijalarni saqlashda xato yuz berdi");
    }

    if (!finishResponse.ok) {
      const finishError = await finishResponse.json();
      console.error("Finish error:", finishError);
      throw new Error("Testni yakunlashda xato yuz berdi");
    }

    const finishResult = await finishResponse.json();
    console.log("Finish result:", finishResult);

    setScore(finalScore);
    setTestStatus('completed');

  } catch (error) {
    console.error("Testni yakunlashda xato:", error);
    alert(`Testni yakunlashda xato yuz berdi: ${error.message}`);
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
  const scienceIds = Array.isArray(test.science) ? test.science : [];
  const questions = Array.isArray(test.questions) ? test.questions : [];

  const groupQuestionsByScience = () => {
    const grouped = {};

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

    questions.forEach((question, globalIndex) => {
      const scienceId = question.science_id;
      if (grouped[scienceId]) {
        grouped[scienceId].questions.push({
          ...question,
          globalIndex
        });
        grouped[scienceId].count++;
      }
    });

    const sortedGroups = Object.values(grouped).sort((a, b) => b.count - a.count);

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