import React, { useState, useEffect, useContext } from "react";
import "./admin-tests-list.scss";
import editIcon from "../admin-sciences/editing.png";
import deleteIcon from "../admin-sciences/delete.png";
import Loading from "@/components/loading/layout";
import NotFound from "@/app/not-found";
import { AccessContext } from "@/contexts/contexts";
const TestsList = () => {
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [editData, setEditData] = useState({
    title: "",
    score: "",
    time: "",
    departmentQuestionCounts: [],
  });
  const { profileData } = useContext(AccessContext)
  const [currentPage, setCurrentPage] = useState(1);
    const [testsPerPage] = useState(10); // Sahifada ko'rsatiladigan testlar soni
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsResponse, departmentsResponse] = await Promise.all([
          fetch(`http://37.27.23.255:8888/api/tests/`),
          fetch(`http://37.27.23.255:8888/api/departments/`),
        ]);
        if (!testsResponse.ok || !departmentsResponse.ok) {
          throw new Error("Ma'lumotlarni yuklashda xato yuz berdi.");
        }
        const testsData = await testsResponse.json();
        const departmentsData = await departmentsResponse.json();
        setTests(testsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm("Bu testni o'chirishni istaysizmi?")) return;
    try {
      const response = await fetch(`http://37.27.23.255:8888/api/tests/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Testni o'chirishda xato yuz berdi.");
      }
      setTests((prev) => prev.filter((test) => test.id !== id));
      alert("Test muvaffaqiyatli o'chirildi.");
    } catch (error) {
      console.error(error.message);
      alert("Testni o'chirishda xato yuz berdi.");
    }
  };
  const handleEdit = (test) => {
    setEditMode(test.id);
    setEditData({
      title: test.title,
      score: test.score,
      time: test.time,
      departmentQuestionCounts: test.department_question_counts || [],
    });
    setImageBase64("");
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
    }
  };
  const handleSave = async () => {
    try {
      const response = await fetch(`http://37.27.23.255:8888/api/tests/${editMode}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editData.title,
          score: editData.score,
          time: editData.time,
          department_question_counts: editData.departmentQuestionCounts,
          img: imageBase64,
        }),
      });
      if (!response.ok) {
        throw new Error("Testni saqlashda xato yuz berdi.");
      }
      const updatedTest = await response.json();
      setTests((prev) =>
        prev.map((test) => (test.id === editMode ? updatedTest : test))
      );
      alert("Test muvaffaqiyatli yangilandi.");
      setEditMode(null);
      setImageBase64("");
    } catch (error) {
      console.error(error.message);
      alert("Testni saqlashda xato yuz berdi.");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination uchun kerakli testlarni ajratib olish
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = tests.slice(indexOfFirstTest, indexOfLastTest);

  // Sahifalar sonini hisoblash
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(tests.length / testsPerPage); i++) {
    pageNumbers.push(i);
  }

  if(!profileData || !profileData.is_superuser) {
    return <NotFound />
  }


  return (
    <div className="tests-list">
      <h1>Barcha Testlar</h1>
      {editMode && <div className="edit-container-shape"></div>}
      {editMode && (
        <div className="edit-container">
          <h2>Testni tahrirlash</h2>
          <div className="input-row">
          <label>Nomi</label>
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleInputChange}
              placeholder="Test nomini kiriting"
            />
          </div>
          <div className="input-row">
          <label>Bali</label>
            <input
              type="number"
              name="score"
              value={editData.score}
              onChange={handleInputChange}
              placeholder="O'tish bali"
            />
          </div>
          <div className="input-row">
          <label>Test vaqti (soat, minut)</label>
            <input
              type="text"
              name="time"
              value={editData.time}
              onChange={handleInputChange}
              placeholder="Test vaqtini kiriting"
            />
          </div>
          <div className="input-row">
            <label htmlFor="">Rasmi</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="btns">
            <button type="button" onClick={() => setEditMode(null)}>Bekor qilish</button>
            <button onClick={handleSave}>Saqlash</button>
          </div>
        </div>
      )}

      {loading ? (
        <p><Loading /></p>
      ) : error ? (
        <p>Xato: {error}</p>
      ) : (
        <div className="tests-container">
          {currentTests.map((test) => (
            <div key={test.id} className="test-item">
              <h2>{test.title}</h2>
              <img src={test.img} alt="Test rasmi" />
              <p><strong>O'tish bali:</strong> {test.score}</p>
              <p><strong>Vaqt:</strong> {test.time || "Kiritilmagan"}</p>
              <div className="test-btns">
                <button onClick={() => handleEdit(test)}>
                  <img src={editIcon.src} alt="edit" />
                </button>
                <button onClick={() => handleDelete(test.id)}>
                  <img src={deleteIcon.src} alt="delete" />
                </button>
              </div>
            </div>
          ))}
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
      )}
    </div>
  );
};

export default TestsList;
