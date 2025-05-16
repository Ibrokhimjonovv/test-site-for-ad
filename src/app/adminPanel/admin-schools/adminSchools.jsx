import React, { useContext, useEffect, useState } from "react";
import { AccessContext } from "../../../AccessContext";
import { api } from "../../../App";
import { Link } from "react-router-dom";
import "./adminSchools.scss";
import editIcon from "../admin-sciences/delete.png";
import deleteIcon from "../admin-sciences/editing.png";
import Loading from "../../../components/loading/loading";

const AdminSchools = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scienceData, setScienceData] = useState({
    title: "",
    img: "",
  });
  const [fileName, setFileName] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [offcanvas, setOffcanvas] = useState(false);
  const toggleCanvas = (data = null) => {
    if (data) {
      setScienceData({
        title: data.title || "",
        img: data.img || "",
      });
      setFileName(data.img || "");
      setUpdateId(data.id);
    } else {
      setScienceData({ title: "", img: ""});
      setFileName("");
      setUpdateId(null);
    }
    setOffcanvas(!offcanvas);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sciencesResponse = await fetch(`${api}/schools/`);
        if (!sciencesResponse.ok) {
          throw new Error("Network error");
        }
        const sciencesData = await sciencesResponse.json();

        const subjectsWithDetails = await Promise.all(
          sciencesData.map(async (subject) => {
            const departmentsResponse = await fetch(
              `${api}/departments/?subjectId=${subject.id}`
            );
            if (!departmentsResponse.ok) {
              throw new Error("Network error");
            }
            const departmentsData = await departmentsResponse.json();
            const filteredDepartments = departmentsData.filter(
              (department) => department.science === subject.id
            );
            const questionsCounts = await Promise.all(
              filteredDepartments.map(async (department) => {
                const questionsResponse = await fetch(
                  `${api}/questions/?departmentId=${department.id}`
                );
                if (!questionsResponse.ok) {
                  throw new Error("Network error");
                }
                const questionsData = await questionsResponse.json();
                return questionsData.filter(
                  (question) => question.department === department.id
                ).length;
              })
            );
            const totalQuestions = questionsCounts.reduce(
              (acc, count) => acc + count,
              0
            );
            return {
              ...subject,
              departmentsCount: filteredDepartments.length,
              totalQuestions,
            };
          })
        );
        setSubjects(subjectsWithDetails);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);
  const access = localStorage.getItem("accessToken");
  const postData = async (data, file) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (file) formData.append("img", file);
      const url = updateId
        ? `${api}/sciences/${updateId}/`
        : `${api}/sciences/`;
      const method = updateId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to ${updateId ? "update" : "add"} science`);
      }
      const updatedScience = await response.json();
      if (updateId) {
        setSubjects((prevSubjects) =>
          prevSubjects.map((subject) =>
            subject.id === updateId
              ? { ...subject, ...updatedScience }
              : subject
          )
        );
      } else {
        setSubjects((prevSubjects) => [...prevSubjects, updatedScience]);
      }
      toggleCanvas();
    } catch (error) {
      console.error(error);
    }
  };
  const postDelete = async (postId) => {
    try {
      const response = await fetch(`${api}/sciences/${postId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete science");
      }

      setSubjects((prevSciences) =>
        prevSciences.filter((science) => science.id !== postId)
      );
    } catch (error) {
      console.error("Error deleting science:", error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScienceData((prevScience) => ({ ...prevScience, [name]: value }));
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setScienceData((prevScience) => ({ ...prevScience, img: file }));
    } else {
      setFileName("");
      setScienceData((prevScience) => ({ ...prevScience, img: "" }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    postData(scienceData, scienceData.img);
  };
  if (loading) return <Loading />;
  return (
    <div id="admin-sciences">
      <div className="sciences-container">
        <div className="add-sciences">
          <button onClick={() => toggleCanvas()}>Fan qo'shish +</button>
        </div>
        <div className={`sciences-offcanvas ${offcanvas ? "active" : ""}`}>
          <h2>{updateId ? "Taxrirlash" : "Fan qo'shish"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-row file">
              <label htmlFor="file-input">Rasmi</label>
              <label htmlFor="file-input" className="file-label">
                {fileName || "Rasm tanlang"}
              </label>
              <input
                type="file"
                name="img"
                id="file-input"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            <div className="input-row">
              <label htmlFor="sciences-title">Nomi</label>
              <input
                type="text"
                name="title"
                id="sciences-title"
                placeholder="Nomini kiriting"
                value={scienceData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="btns">
              <button type="button" onClick={() => toggleCanvas()}>
                Bekor qilish
              </button>
              <button type="submit">Yuborish</button>
            </div>
          </form>
        </div>
        {offcanvas && <div className="sciences-offcanvas-shape"></div>}
        {subjects.map((data, index) => (
          <Link
            to={access ? `/tests-department/${data.id}` : `/login`}
            key={index}
          >
            <div className="sciences-items">
              <img src={data.img} alt="Science" />
              <div className="texts">
                <h1>{data.title}</h1>
                <ul>
                  <li>
                    <span>
                      <span className="green"></span>
                      Testlar soni:
                    </span>
                    <span className="count">{data.totalQuestions}ta</span>
                  </li>
                  <li>
                    <span>
                      <span className="green"></span>
                      Bo'limlar:
                    </span>
                    <span className="count">{data.departmentsCount}ta</span>
                  </li>
                </ul>
              </div>
              <div className="for-admin">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCanvas(data);
                  }}
                  className="edit"
                >
                  <img src={editIcon} alt="edit" />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    postDelete(data.id);
                  }}
                  type="button"
                  id="delete"
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSchools;