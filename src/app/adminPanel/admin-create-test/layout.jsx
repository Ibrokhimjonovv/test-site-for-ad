'use client';

import React, { useState, useEffect, useContext } from "react";
import "./admin-create-test.scss";
import TestsList from "../admin-tests-list/admin-tests-list";
import Loading from "@/components/loading/layout";
import NotFound from "@/app/not-found";
import { AccessContext } from "@/contexts/contexts";
// import InputMask from "react-input-mask";
import { useMask } from '@react-input/mask';
const CreateTest = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sciences, setSciences] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    price: "",
    score: "",
    time: "00:30:00",
    sciences: [],
    departmentQuestionCounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testsCanvas, setTestsCanvas] = useState(false);
  const [testCards, setTestCards] = useState([]);
  const { profileData } = useContext(AccessContext)

  const addTestCard = () => {
    setTestCards([
      ...testCards,
      {
        science: "",
        scienceScore: "",
        selectedDepartments: [], // Yangi struktura - tanlangan bo'limlar va ularning savollar soni
      },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, departmentsRes, sciencesRes] = await Promise.all([
          fetch(`https://test.smartcoders.uz/api/category/`),
          fetch(`https://test.smartcoders.uz/api/departments/`),
          fetch(`https://test.smartcoders.uz/api/sciences/`),
        ]);

        if (!categoriesRes.ok || !departmentsRes.ok || !sciencesRes.ok)
          throw new Error("Ma'lumotlarni olishda xato yuz berdi.");

        const categoriesData = await categoriesRes.json();
        const departmentsData = await departmentsRes.json();
        const sciencesData = await sciencesRes.json();

        setCategories(categoriesData);
        setDepartments(departmentsData);
        setSciences(sciencesData);
      } catch (error) {
        console.error(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleCardChange = (index, key, value) => {
    setTestCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index
          ? {
            ...card,
            [key]: value,
            selectedDepartments: card.selectedDepartments || [],
          }
          : card
      )
    );
  };

  const handleDepartmentToggle = (cardIndex, department) => {
    setTestCards((prevCards) =>
      prevCards.map((card, i) => {
        if (i !== cardIndex) return card;

        const existingIndex = card.selectedDepartments.findIndex(
          (d) => d.department_id === department.id
        );

        let updatedDepartments;
        if (existingIndex >= 0) {
          // Bo'lim allaqachon tanlangan, uni olib tashlaymiz
          updatedDepartments = card.selectedDepartments.filter(
            (d) => d.department_id !== department.id
          );
        } else {
          // Yangi bo'lim qo'shamiz
          updatedDepartments = [
            ...card.selectedDepartments,
            {
              department_id: department.id,
              question_count: 1, // Default qiymat
            },
          ];
        }

        return {
          ...card,
          selectedDepartments: updatedDepartments,
        };
      })
    );
  };

  const handleQuestionCountChange = (cardIndex, departmentId, value) => {
    setTestCards((prevCards) =>
      prevCards.map((card, i) => {
        if (i !== cardIndex) return card;

        const updatedDepartments = card.selectedDepartments.map((d) =>
          d.department_id === departmentId
            ? { ...d, question_count: Math.max(1, parseInt(value) || 1) }
            : d
        );

        return {
          ...card,
          selectedDepartments: updatedDepartments,
        };
      })
    );
  };

  const [imageBase64, setImageBase64] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Iltimos, kategoriya tanlang!");
      return;
    }
    if (!formData.title.trim()) {
      alert("Test nomini kiriting!");
      return;
    }
    if (!formData.time || formData.time === "00:00:00") {
      alert("Test uchun amal qilish vaqtini kiriting!");
      return;
    }

    // Barcha tanlangan bo'limlar va savollar sonini yig'amiz
    const allDepartmentQuestionCounts = testCards.flatMap((card) =>
      card.selectedDepartments.map((d) => ({
        department_id: parseInt(d.department_id),
        question_count: parseInt(d.question_count),
      }))
    );

    if (allDepartmentQuestionCounts.length === 0) {
      alert("Hech bo'lmaganda bitta bo'lim va savollar sonini kiriting!");
      return;
    }

    // Fanlarni unique qilamiz
    const uniqueSciences = [
      ...new Set(
        testCards
          .map((card) => parseInt(card.science) || 0)
          .filter((id) => id > 0)
      ),
    ];

    // Har bir fan uchun ballarni yig'amiz (agar kiritilgan bo'lsa)
    const scienceScores = testCards
      .filter((card) => card.science && card.scienceScore)
      .map((card) => ({
        science_id: parseInt(card.science),
        score: parseInt(card.scienceScore),
      }));

    // APIga yuboriladigan so'rov tuzilmasini Postmandagiga moslaymiz
    const requestBody = {
      title: formData.title,
      category: parseInt(formData.category),
      science: uniqueSciences,
      science_score: scienceScores.length > 0 ? scienceScores : [], // Agar ball kiritilmagan bo'lsa bo'sh massiv
      score: parseInt(formData.score) || 0,
      department_question_counts: allDepartmentQuestionCounts,
      time: formData.time.length === 5 ? `${formData.time}:00` : formData.time, // Vaqt formatini to'g'rilash
      price: formData.price,
      img: imageBase64 || "", // Bo'sh string yuborish
      questions: [], // Bo'sh savollar massivi
    };

    console.log("Yuborilayotgan ma'lumot:", JSON.stringify(requestBody, null, 2)); // Debug uchun

    try {
      const response = await fetch(`https://test.smartcoders.uz/api/tests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Agar kerak bo'lsa, authorization header qo'shing
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server xatosi:", errorData);
        throw new Error(errorData.message || "Testni yaratishda xato yuz berdi.");
      }

      const data = await response.json();
      console.log("Server javobi:", data);
      alert(`Test muvaffaqiyatli yaratildi: ${data.title}`);

      // Formani tozalash
      setFormData({
        category: "",
        title: "",
        score: "",
        price: "",
        sciences: [],
        time: "00:30:00",
        departmentQuestionCounts: [],
      });
      setTestCards([]);
      setImageBase64("");
      setTestsCanvas(false);

    } catch (error) {
      console.error("Xato tafsilotlari:", error);
      alert("Xato yuz berdi: " + error.message);
    }
  };

  const handleSelectAllDepartments = (cardIndex) => {
    setTestCards((prevCards) =>
      prevCards.map((card, i) => {
        if (i !== cardIndex) return card;

        // Agar hamma bo'limlar allaqachon tanlangan bo'lsa, ularni olib tashlaymiz
        if (card.selectedDepartments.length > 0) {
          return {
            ...card,
            selectedDepartments: [],
          };
        }

        // Aks holda, barcha tegishli bo'limlarni qo'shamiz
        const relevantDepartments = departments.filter(
          (d) => Number(d.science) === Number(card.science)
        );

        const newDepartments = relevantDepartments.map((department) => ({
          department_id: department.id,
          question_count: 1, // Har biriga 1 ta savol
        }));

        return {
          ...card,
          selectedDepartments: newDepartments,
        };
      })
    );
  };

  const timeInputRef = useMask({
    mask: '__:__:__',
    replacement: { _: /\d/ },
    showMask: true,
    separate: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'time') {
      // Vaqt formati tekshiriladi (00:00:00)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (value.length === 8 && !timeRegex.test(value)) {
        return; // Noto'g'ri format kiritilganda o'zgartirishni amalga oshirmaymiz
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!profileData || !profileData.is_superuser) {
    return <NotFound />
  }


  return (
    <div className="create-test">
      <div className="add-tests">
        <button onClick={() => setTestsCanvas(!testsCanvas)}>
          Test qo'shish +
        </button>
      </div>
      {loading ? (
        <p>
          <Loading />
        </p>
      ) : error ? (
        <p>Xato: {error}</p>
      ) : (
        <>
          <div
            className={`create-tests-offcanvas ${testsCanvas ? "active" : ""}`}
          >
            <form onSubmit={handleSubmit}>
              <h2>Test Yaratish</h2>
              <div className="one-row">
                <div className="input-row">
                  <label>Kategoriya:</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Kategoriyani tanlang
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-row">
                  <label>Test nomi:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Test nomini kiriting"
                    required
                  />
                </div>
                <div className="input-row">
                  <label>Test uchun rasm:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="input-row">
                  <label>O'tish bali:</label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder="O'tish balini kiriting"
                    required
                  />
                </div>
                <div className="input-row">
                  <label>Test vaqti (soat, minut):</label>
                  <input
                    ref={timeInputRef}
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    placeholder="00:00:00"
                    required
                  />
                </div>
                <div className="input-row">
                  <label>Test narxi:</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Test narxini kiriting"
                    required
                  />
                </div>
              </div>
              <div className="tests-cards">
                {testCards.map((card, index) => (
                  <div key={index} className="test-card">
                    <div className="input-row">
                      <label htmlFor="">Fan tanlang</label>
                      <select
                        value={card.science}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          handleCardChange(index, "science", newValue);
                        }}
                      >
                        <option value="" disabled>
                          Fan tanlang
                        </option>
                        {sciences.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-row">
                      <label htmlFor="">Fan uchun ball</label>
                      <input
                        type="number"
                        placeholder="Fan uchun ballni kiriting"
                        value={card.scienceScore}
                        onChange={(e) =>
                          handleCardChange(
                            index,
                            "scienceScore",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="input-row">
                      <label>Bo'limlar tanlang</label>
                      <button
                        type="button"
                        className="select-all-btn"
                        onClick={() => handleSelectAllDepartments(index)}
                      >
                        {card.selectedDepartments.length > 0 ?
                          "Barchasini bekor qilish" :
                          "Barchasini tanlash (1 ta savol)"}
                      </button>
                      {departments
                        .filter((d) => Number(d.science) === Number(card.science))
                        .map((department) => (
                          <div key={department.id} className="department-item">
                            <div className="department-department-item">
                              <input
                                id={`dep-${index}-${department.id}`}
                                type="checkbox"
                                checked={card.selectedDepartments.some(
                                  (d) => d.department_id === department.id
                                )}
                                onChange={() =>
                                  handleDepartmentToggle(index, department)
                                }
                              />
                              <label htmlFor={`dep-${index}-${department.id}`}>
                                {department.title}
                              </label>
                            </div>
                            {card.selectedDepartments.some(
                              (d) => d.department_id === department.id
                            ) && (
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    card.selectedDepartments.find(
                                      (d) => d.department_id === department.id
                                    )?.question_count || 1
                                  }
                                  onChange={(e) =>
                                    handleQuestionCountChange(
                                      index,
                                      department.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Savollar soni"
                                />
                              )}
                          </div>
                        ))}
                      <div className="total-questions">
                        <strong>Jami savollar soni: </strong>
                        {card.selectedDepartments.reduce(
                          (sum, d) => sum + (d.question_count || 0),
                          0
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  id="add-sciences"
                  type="button"
                  onClick={addTestCard}
                >
                  Fan qo'shish
                </button>
              </div>
              <div className="btns">
                <button
                  type="button"
                  onClick={() => {
                    setTestsCanvas(false);
                  }}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="submit-btn">
                  Testni Yaratish
                </button>
              </div>
            </form>
          </div>
          {testsCanvas && <div className="create-tests-offcanvas-shape"></div>}
          <TestsList />
        </>
      )}
    </div>
  );
};

export default CreateTest;