'use client'

import React, { useContext, useEffect, useState } from "react";
import "./admin-sciences.scss";
import editIcon from "./editing.png";
import deleteIcon from "./delete.png";
import Link from "next/link"
import Loading from "@/components/loading/layout";
import NotFound from "@/app/not-found";
import { AccessContext } from "@/contexts/contexts";

const AdminSciences = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scienceData, setScienceData] = useState({
    title: "",
    img: "",
    difficulty: "",
  });
  const [fileName, setFileName] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [offcanvas, setOffcanvas] = useState(false);
  const { profileData } = useContext(AccessContext)
  const toggleCanvas = (data = null) => {
    if (data) {
      setScienceData({
        title: data.title || "",
        difficulty: data.difficulty || 0,
        img: data.img || "",
      });
      setFileName(data.img || "");
      setUpdateId(data.id);
    } else {
      setScienceData({ title: "", img: "", difficulty: "" });
      setFileName("");
      setUpdateId(null);
    }
    setOffcanvas(!offcanvas);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sciencesResponse = await fetch(`https://test.smartcoders.uz/api/get_science_count/`);
        if (!sciencesResponse.ok) {
          throw new Error("Network error");
        }
        const sciencesData = await sciencesResponse.json();

        setSubjects(sciencesData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const [access, setAccess] = useState(null);
  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    if(access) {
      setAccess(access);
    }
  }, [access])
  const postData = async (data, file) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("difficulty", data.difficulty);
      if (file) formData.append("img", file);
      const url = updateId
        ? `https://test.smartcoders.uz/api/sciences/${updateId}/`
        : `https://test.smartcoders.uz/api/sciences/`;
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
      const response = await fetch(`https://test.smartcoders.uz/api/sciences/${postId}/`, {
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

  if(!profileData || !profileData.is_superuser) {
    return <NotFound/>
  }

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
            <div className="input-row">
              <label htmlFor="sciences-difficulty">Qiyinchiligi</label>
              <input
                type="number"
                value={scienceData.difficulty}
                min={0}
                max={100}
                name="difficulty"
                id="sciences-difficulty"
                placeholder="Misol: 1, ..., 100"
                onChange={handleInputChange}
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
            // href={access ? `/tests-department/${data.id}` : `/login`}
            href=""
            key={index}
            
          >
            <div className="sciences-items">
              <img src={data.img} alt="Science" />
              <div className="texts">
                <h1>{data.science}</h1>
                <ul>
                  <li>
                    <span>
                      <span className="green"></span>
                      Testlar soni:
                    </span>
                    <span className="count">{data.questions}ta</span>
                  </li>
                  <li>
                    <span>
                      <span className="green"></span>
                      Murakkabligi:
                    </span>
                    <span className="count">100/{data.difficulty || 0}</span>
                  </li>
                  <li>
                    <span>
                      <span className="green"></span>
                      Bo'limlar:
                    </span>
                    <span className="count">{data.departments}ta</span>
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
                  <img src={editIcon.src} alt="edit" />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    postDelete(data.id);
                  }}
                  type="button"
                  id="delete"
                >
                  <img src={deleteIcon.src} alt="delete" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSciences;
