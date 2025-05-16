import React, { useState, useEffect } from "react";
// import InputMask from "react-input-mask";
import "./admin-tests.scss";
import { api } from "../../../App";
import editIcon from "../admin-sciences/editing.png";
import deleteIcon from "../admin-sciences/delete.png";
import CkEditor from "../../../components/ck-editor/ck-editor";
import OptionOffcanvas from "../admin-options/admin-options";
import Loading from "../../../components/loading/loading";

import katex from "katex";
import "katex/dist/katex.min.css";
import parse from "html-react-parser";

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testCanvas, setTestCanvas] = useState(false);
  const [formData, setFormData] = useState({
    testName: "",
    departmentId: "",
    // time: "",
    score: "",
  });
  const [editingTest, setEditingTest] = useState(null);
  const [optionCanvas, setOptionCanvas] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [options, setOptions] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(10); // Sahifada ko'rsatiladigan testlar soni

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testsResponse = await fetch(`${api}/questions/`);
        if (!testsResponse.ok) {
          throw new Error("Testlarni olishda xato yuz berdi.");
        }
        const testsData = await testsResponse.json();

        const departmentsResponse = await fetch(`${api}/departments/`);
        if (!departmentsResponse.ok) {
          throw new Error("Bo'limlarni olishda xato yuz berdi.");
        }
        const departmentsData = await departmentsResponse.json();

        const optionsResponse = await fetch(`${api}/options/`);
        if (!optionsResponse.ok) {
          throw new Error("Variantlarni olishda xato yuz berdi.");
        }
        const optionsData = await optionsResponse.json();
        setTests(testsData);
        setDepartments(departmentsData);
        const groupedOptions = optionsData.reduce((acc, option) => {
          if (!acc[option.question]) {
            acc[option.question] = [];
          }
          acc[option.question].push(option);
          return acc;
        }, {});
        setOptions(groupedOptions);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);
  const handleEditorChange = (value) => {
    setFormData((prev) => ({ ...prev, testName: value }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTest
        ? `${api}/questions/${editingTest.id}/`
        : `${api}/questions/`;
      const method = editingTest ? "PUT" : "POST";
      let requestBody = {
        text: formData.testName,
        department: formData.departmentId,
        // time: formData.time,
        score: formData.score.trim() !== "" ? parseInt(formData.score) : null,
      };
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error(
          `Test ${editingTest ? "tahrirlash" : "qo'shish"}da xato yuz berdi.`
        );
      }
      const updatedTest = await response.json();
      setTests((prevTests) =>
        editingTest
          ? prevTests.map((test) =>
            test.id === updatedTest.id ? updatedTest : test
          )
          : [...prevTests, updatedTest]
      );
      setTestCanvas(false);
      setFormData({ testName: "", departmentId: "", score: "" });
      setEditingTest(null);
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleDelete = async (testId) => {
    try {
      const response = await fetch(`${api}/questions/${testId}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Testni o'chirishda xato yuz berdi.");
      }
      setTests((prevTests) => prevTests.filter((test) => test.id !== testId));
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      text: test.question,
      departmentId: test.department,
      // time: test.time,
      score: test.score,
    });
    setTestCanvas(true);
  };
  const handleOptionDelete = async (optionId, questionId) => {
    try {
      const response = await fetch(`${api}/options/${optionId}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Variantni o'chirishda xato yuz berdi.");
      }
      setOptions((prevOptions) => {
        const updatedOptions = { ...prevOptions };
        updatedOptions[questionId] = updatedOptions[questionId]?.filter(
          (opt) => opt.id !== optionId
        );
        return updatedOptions;
      });
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleOptionEdit = (option) => {
    setEditingOption({
      ...option,
      question: option.question || option.testId,
    });
  };
  const saveOptionEdit = async (updatedOption) => {
    try {
      const response = await fetch(`${api}/options/${updatedOption.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: updatedOption.text,
          is_staff: updatedOption.is_staff,
          question: updatedOption.question,
        }),
      });
      if (!response.ok) {
        throw new Error("Variantni tahrirlashda xato yuz berdi.");
      }
      const optionData = await response.json();
      setOptions((prevOptions) => {
        const updatedOptions = { ...prevOptions };
        const questionOptions = updatedOptions[optionData.question] || [];
        const optionIndex = questionOptions.findIndex(
          (opt) => opt.id === optionData.id
        );
        if (optionIndex > -1) {
          questionOptions[optionIndex] = optionData;
        }
        return updatedOptions;
      });
      setEditingOption(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fixBrokenImageTags = (text) => {
    return text.replace(
      /alt=["']?Question Image["']?\s*style=["'][^"']*["']?\s*\/?>/g,
      ""
    );
  };

  const renderQuestionText = (text) => {
    if (typeof text !== "string") return "";

    const baseUrl = "https://edumark.uz";

    // Rasmlar uchun URL'ni to'g'irlash
    text = text.replace(
      /<img\s+src=["'](\/media[^"']+)["']/g,
      (match, path) => `<img src="${baseUrl}${path}" />`
    );

    // Matematik formulalarni aniqlash va to'g'ri ko'rsatish
    const mathRegex = /\\frac\{.*?\}\{.*?\}|\\sum|\\sqrt|\\left|\\right|\\times|\\div/g;
    text = text.replace(mathRegex, (match) => {
      try {
        return katex.renderToString(match, { throwOnError: false });
      } catch (error) {
        console.error("KaTeX render error:", error);
        return match;
      }
    });

    // Noto‘g‘ri img taglarini to‘g‘rilash
    text = fixBrokenImageTags(text);

    return text;
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

  return (
    <div id="admin-tests">
      {loading ? (
        <p>
          <Loading />{" "}
        </p>
      ) : error ? (
        <p>Xato: {error}</p>
      ) : (
        <div>
          <div className="add-test">
            <button
              onClick={() => {
                setEditingTest(null);
                setFormData({
                  testName: "",
                  departmentId: "",
                  // time: "",
                  score: "",
                });
                setTestCanvas(!testCanvas);
              }}
            >
              Savol qo'shish +
            </button>
          </div>
          <div className={`tests-offcanvas ${testCanvas ? "active" : ""}`}>
            <h2>{editingTest ? "Savolni tahrirlash" : "Savol qo'shish"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-row">
                <label htmlFor="testName">Savol</label>
                <CkEditor
                  value={formData.testName}
                  onChange={handleEditorChange}
                />
              </div>
              <div className="input-row">
                <label htmlFor="departmentId">Bo'lim</label>
                <select
                  name="departmentId"
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Bo'limni tanlang
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-row">
                <label htmlFor="score">Bali</label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  placeholder="Balni kiriting (ixtiyoriy)"
                />
              </div>
              <div className="btns">
                <button
                  type="button"
                  onClick={() => {
                    setTestCanvas(false);
                  }}
                >
                  Bekor qilish
                </button>
                <button type="submit">
                  {editingTest ? "Saqlash" : "Yuborish"}
                </button>
              </div>
            </form>
          </div>
          {testCanvas || optionCanvas || editingOption ? (
            <div
              className={`${testCanvas ? "tests" : "options"}-offcanvas-shape`}
            ></div>
          ) : (
            <></>
          )}
          <div className={`option-offcanvas ${optionCanvas ? "active" : ""}`}>
            <OptionOffcanvas
              testId={optionCanvas}
              closeOffcanvas={() => setOptionCanvas(null)}
              refreshTests={() => setTests([...tests])}
            />
          </div>
          {editingOption && (
            <div
              className={`option-edit-offcanvas ${editingOption && "active"}`}
            >
              <h2>Variantni tahrirlash</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveOptionEdit(editingOption);
                }}
              >
                <div className="input-row">
                  <label>Variant matni</label>
                  <CkEditor
                    value={editingOption?.text || ""}
                    onChange={(value) =>
                      setEditingOption((prev) => ({ ...prev, text: value }))
                    }
                  />
                </div>
                <div className="input-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingOption?.is_staff || false}
                      onChange={(e) =>
                        setEditingOption((prev) => ({
                          ...prev,
                          is_staff: e.target.checked,
                        }))
                      }
                    />
                    To'g'ri
                  </label>
                </div>
                <div className="btns">
                  <button type="button" onClick={() => setEditingOption(null)}>
                    Bekor qilish
                  </button>
                  <button type="submit">Saqlash</button>
                </div>
              </form>
            </div>
          )}
          <div className="tests">
            {currentTests.map((test, index) => {
              const globalIndex = indexOfFirstTest + index;
              return (
                <div key={test.id} className="test-item">
                  <h3>{globalIndex + 1}-test</h3>
                  <div className="test-text">
                    {parse(renderQuestionText(test.text))}
                  </div>
                  <p>
                    Bo'lim:{" "}
                    {departments.find((d) => d.id === test.department)?.title ||
                      "Noma'lum"}
                  </p>
                  <p>Bali: {test.score}</p>
                  <div className="options">
                    <h4>Variantlar:</h4>
                    <ul>
                      {options[test.id]?.map((option) => (
                        <div className="option-name">
                          {/* <li
                          className="option-inner"
                          key={option.id}
                          dangerouslySetInnerHTML={{ __html: option.text }}
                        /> */}
                          <li className="" key={option.id}>
                            {parse(renderQuestionText(option.text))}
                          </li>
                          <span className="edit">
                            {option.is_staff ? "(To'g'ri)" : "(Noto'g'ri)"}
                            <button onClick={() => handleOptionEdit(option)}>
                              <img src={editIcon} alt="edit" />
                            </button>
                            <button
                              onClick={() =>
                                handleOptionDelete(option.id, option.question)
                              }
                            >
                              <img src={deleteIcon} alt="delete" />
                            </button>
                          </span>
                        </div>
                      )) || <p>Variantlar yo'q</p>}
                    </ul>
                  </div>
                  <div className="test-btns">
                    <button onClick={() => handleEdit(test)}>
                      <img src={editIcon} alt="edit" />
                    </button>
                    <button onClick={() => handleDelete(test.id)}>
                      <img src={deleteIcon} alt="delete" />
                    </button>
                    <button onClick={() => setOptionCanvas(test.id)}>
                      Variant qo'shish
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

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

export default AdminTests;
