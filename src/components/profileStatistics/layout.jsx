'use client'

import React, { useEffect, useState, useContext } from "react";
import { Line } from "react-chartjs-2";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./layout.scss";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { AccessContext } from "@/contexts/contexts";

ChartJS.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const StaticLayout = () => {
  const { profileData } = useContext(AccessContext);
  const [sciences, setSciences] = useState([]);
  const [tests, setTests] = useState([]);
  const [testActivityLog, setTestActivityLog] = useState([]);
  const [loginActivityLog, setLoginActivityLog] = useState([]);
  const [selectedScience, setSelectedScience] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: "" });

  const tokenn = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSciences = async () => {
      try {
        const response = await fetch(`http://37.27.23.255:8899/api/sciences/`);
        if (!response.ok) throw new Error("Fanlarni yuklashda xatolik!");
        const data = await response.json();
        setSciences(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchSciences();
  }, []);

  useEffect(() => {
    const fetchLoginActivity = async () => {
      try {
        const response = await fetch(`http://37.27.23.255:8899/api/user-profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenn}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Tarmoq xatosi: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (!data) {
          console.error("Foydalanuvchini yuklashda xatoli");
          return;
        }
        const loginDate = data.last_login.split("T")[0];
        const formattedLoginActivityLog = [
          {
            date: loginDate,
            count: 1,
          },
        ];
        const year = new Date(loginDate).getFullYear();
        setLoginActivityLog(formattedLoginActivityLog);
        setAvailableYears((prevYears) =>
          prevYears.includes(year) ? prevYears : [...prevYears, year]
        );
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchLoginActivity();
  }, [profileData.id]);

  useEffect(() => {
    if (selectedScience) {
      const fetchTests = async () => {
        try {
          const response = await fetch(
            `${api}/tests/?science=${selectedScience}`
          );
          if (!response.ok) throw new Error("Testlarni olishda xatolik!");
          const data = await response.json();
          setTests(data);
        } catch (error) {
          console.error(error.message);
        }
      };
      fetchTests();
    } else {
      setTests([]);
    }
  }, [selectedScience]);

  useEffect(() => {
    const fetchTestStats = async () => {
      try {
        const response = await fetch(
          `http://37.27.23.255:8899/api/statistics/?user=${profileData.id}`
        );
        if (!response.ok) throw new Error("Statistikani olishda xatolik!");
        const data = await response.json();
        const userTests = data.filter(
          (test) => Number(test.user) === Number(profileData.id)
        );
        const formattedTestActivityLog = userTests.map((test, index) => {
          const timeOffset =
            parseFloat(test.total_time_taken.split(":")[2]) || 0;
          return {
            date: test.created_at.split("T")[0],
            scorePercentage: test.percentage_correct + timeOffset * 0.01,
            testName: test.test_title,
            totalTime: test.total_time_taken,
            totalQuestions: test.total_questions,
            correctAnswers: test.correct_answers,
            incorrectAnswers: test.incorrect_answers,
            unansweredQuestions: test.unanswered_questions,
          };
        });
        setTestActivityLog(formattedTestActivityLog);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchTestStats();
  }, [profileData.id]);

  const groupedData = testActivityLog.reduce((acc, log) => {
    if (!acc[log.testName]) {
      acc[log.testName] = [];
    }
    acc[log.testName].push(log);
    return acc;
  }, {});

  const lineChartData = {
    labels: testActivityLog.map((log) => log.date),
    datasets: Object.keys(groupedData).map((testName, index) => {
      const testLogs = groupedData[testName];
      return {
        label: testName,
        data: testLogs.map((log) => ({
          x: log.date,
          y: log.scorePercentage,
          additionalInfo: log,
        })),
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "blue",
        pointHoverBorderColor: "black",
        pointHoverBorderWidth: 2,
        spanGaps: false,
      };
    }),
  };

  return (
    <div className={`profile-statistics`}>
      <div className={`line-chart`}>
        <Line
          data={lineChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: "Foiz (%)",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const pointData = tooltipItem.raw.additionalInfo;
                    return `${pointData.testName
                      }: ${pointData.scorePercentage.toFixed(2)}%`;
                  },
                  afterBody: function (tooltipItem) {
                    const pointData = tooltipItem[0].raw.additionalInfo;
                    return [
                      `To'g'ri javoblar: ${pointData.correctAnswers} / ${pointData.totalQuestions}`,
                      `Sariflangan vaqt: ${pointData.totalTime}`,
                    ];
                  },
                },
              },
            },
          }}
        />
      </div>
      <div className={`for-width`}>
        <div className={`calendar-heatmap`}>
          <div className={`year-filter`}>
            <label htmlFor="year-select" >Aktivlik yili</label>
            <select
              id="year-select"
              value={calendarYear}
              onChange={(e) => setCalendarYear(e.target.value)}
              
            >
              {availableYears.map((year) => (
                <option key={year} value={year} >
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div style={{ position: "relative" }} >
            <CalendarHeatmap
              startDate={new Date(`${calendarYear}-01-01`)}
              endDate={new Date(`${calendarYear}-12-31`)}
              values={loginActivityLog.filter(
                (log) =>
                  new Date(log.date).getFullYear().toString() ===
                  calendarYear.toString()
              )}
              classForValue={(value) => {
                if (!value || value.count === 0) {
                  return "color-empty";
                }
                if (value.count >= 5) return "color-github-4";
                if (value.count >= 3) return "color-github-3";
                if (value.count >= 2) return "color-github-2";
                return "color-github-1";
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return null;
                return {
                  "data-tip": `Sana: ${value.date}, Urinishlar: ${value.count}`,
                };
              }}
              showWeekdayLabels={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticLayout;
