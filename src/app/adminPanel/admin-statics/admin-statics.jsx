import React, { useState, useEffect } from "react";
import "./admin-statics.scss";
import { api } from "../../../App";
import Loading from "../../../components/loading/loading";

const AdminStatics = () => {
  const [savedResults, setSavedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [openers, setOpeners] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
      const [testsPerPage] = useState(10); // Sahifada ko'rsatiladigan testlar soni

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${api}/statistics/`);
        if (!response.ok) {
          throw new Error("Statistikalarni yuklashda xatolik yuz berdi.");
        }
        const data = await response.json();
        setSavedResults(data);
        setOpeners(data.reduce((acc, result) => ({ ...acc, [result.id]: false }), {})); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [api]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${api}/users/`);
        if (!response.ok) {
          throw new Error("Userlarni yuklashda xatolik yuz berdi.");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Noma'lum foydalanuvchi";
  };
  const toggleOpener = (id) => {
    setOpeners((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

   // Pagination uchun kerakli testlarni ajratib olish
   const indexOfLastTest = currentPage * testsPerPage;
   const indexOfFirstTest = indexOfLastTest - testsPerPage;
   const currentTests = savedResults.slice(indexOfFirstTest, indexOfLastTest);
 
   // Sahifalar sonini hisoblash
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(savedResults.length / testsPerPage); i++) {
     pageNumbers.push(i);
   }

  if (loading) return <p><Loading /> </p>;
  if (error) return <p style={{maxWidth: "1366px", margin: "0 auto"}}>Xatolik: {error}</p>;
  return (
    <div className="admin-results-container">
      <h2>Saqlangan Statistikalar:</h2>
      <div className="result-list">
        {currentTests && currentTests.length > 0 ? (
          currentTests.map((result) => (
            <div
              key={result.id}
              className="result-item"
              onClick={() => toggleOpener(result.id)}
            >
              <h3>Test: {result.test_title}</h3>
              <h3>Test yechuvchi: {getUserName(result.user)}</h3>
              <div className={`hidden ${openers[result.id] ? "active" : ""}`}>
                <p>
                  <span>Jami savollar:</span> {result.total_questions}
                </p>
                <p>
                  <span>To'g'ri javoblar:</span> {result.correct_answers}
                </p>
                <p>
                  <span>Noto'g'ri javoblar:</span> {result.incorrect_answers}
                </p>
                <p>
                  <span>Belgilanmagan savollar:</span>{" "}
                  {result.unanswered_questions}
                </p>
                <p>
                  <span>To'g'ri javoblar foizi:</span>{" "}
                  {result.percentage_correct}%
                </p>
                <p>
                  <span>Umumiy vaqt:</span> {result.total_time_taken}
                </p>
                <h4>Har bir savolga ketgan vaqt:</h4>
                <ul>
                  {result.time_per_question &&
                    Object.entries(result.time_per_question).map(
                      ([question, time], idx) => (
                        <p key={idx}>
                          <div
                            className="question-container"
                            dangerouslySetInnerHTML={{ __html: question }}
                          />{" "}
                          {time}
                        </p>
                      )
                    )}
                </ul>
              </div>
            </div>
          ))
          
        ) : (
          <p>Saqlangan statistika mavjud emas.</p>
        )}
        {/* Pagination controls */}
        <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &laquo; Oldingi
            </button>

            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={currentPage === number ? "active" : ""}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length))}
              disabled={currentPage === pageNumbers.length}
            >
              Keyingi &raquo;
            </button>
          </div>
      </div>
    </div>
  );
};

export default AdminStatics;
