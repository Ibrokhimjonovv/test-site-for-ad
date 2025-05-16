'use client'

import React, { useContext, useEffect, useState } from "react";
import "./add-word.scss";
import Loading from "@/components/loading/layout";
import NotFound from "@/app/not-found";
import { AccessContext } from "@/contexts/contexts";

const AddFile = () => {
  // Word uchun state
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [wordFile, setWordFile] = useState(null);
  const [departmentCanvas, setDepartmentCanvas] = useState(false);

  // ZIP uchun state
  const [sciences, setSciences] = useState([]);
  const [selectedScience, setSelectedScience] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [zipCanvas, setZipCanvas] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { profileData } = useContext(AccessContext)

  // Bo'limlarni yuklash (Word uchun)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`http://37.27.23.255:8888/api/departments/`);
        if (!response.ok) throw new Error("Bo'limlarni yuklashda xato!");
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDepartments();
  }, []);

  // Fanlarni yuklash (ZIP uchun)
  useEffect(() => {
    const fetchSciences = async () => {
      try {
        const response = await fetch(`http://37.27.23.255:8888/api/sciences/`);
        if (!response.ok) throw new Error("Fanlarni yuklashda xato!");
        const data = await response.json();
        setSciences(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSciences();
  }, []);

  // Word fayl yuklash
  const handleWordUpload = async (e) => {
    e.preventDefault();
    if (!selectedDepartment || !wordFile) {
      setError("Bo'lim tanlang va Word fayl yuklang!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("department_id", selectedDepartment);
    formData.append("file", wordFile);

    try {
      const response = await fetch(`http://37.27.23.255:8888/api/upload-word/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Word fayl yuklashda xato!");
      alert("Word fayli muvaffaqiyatli yuklandi!");
      setDepartmentCanvas(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ZIP fayl yuklash
  const handleZipUpload = async (e) => {
    e.preventDefault();
    if (!selectedScience || !zipFile) {
      setError("Fan tanlang va ZIP fayl yuklang!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("science_id", selectedScience);
    formData.append("file", zipFile);

    try {
      const response = await fetch(`http://37.27.23.255:8888/api/upload-folder/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("ZIP fayl yuklashda xato!");
      alert("ZIP arxivi muvaffaqiyatli yuklandi!");
      setZipCanvas(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if(!profileData || !profileData.is_superuser) {
    return <NotFound />
  }

  return (
    <div id="admin-word">
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div>
          <div className="add-word">
            <button onClick={() => setDepartmentCanvas(true)}>Word qo'shish +</button>
            <button onClick={() => setZipCanvas(true)}>ZIP qo'shish +</button>
          </div>

          {/* Word yuklash Offcanvas */}
          <div className={`word-offcanvas ${departmentCanvas ? "active" : ""}`}>
            <h2>Word fayl yuklash</h2>
            <form onSubmit={handleWordUpload}>
              <div className="input-row">
                <label>Bo'lim tanlang</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                >
                  <option value="" disabled>Bo'limni tanlang</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-row">
                <label>Word fayl tanlang (.doc, .docx)</label>
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setWordFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="btns">
                <button type="button" onClick={() => setDepartmentCanvas(false)}>Bekor qilish</button>
                <button type="submit">Yuborish</button>
              </div>
            </form>
          </div>

          {/* ZIP yuklash Offcanvas */}
          <div className={`word-offcanvas ${zipCanvas ? "active" : ""}`}>
            <h2>ZIP arxiv yuklash</h2>
            <form onSubmit={handleZipUpload}>
              <div className="input-row">
                <label>Fan tanlang</label>
                <select
                  value={selectedScience}
                  onChange={(e) => setSelectedScience(e.target.value)}
                  required
                >
                  <option value="" disabled>Fanni tanlang</option>
                  {sciences.map((science) => (
                    <option key={science.id} value={science.id}>{science.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-row">
                <label>ZIP fayl tanlang (.zip)</label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="btns">
                <button type="button" onClick={() => setZipCanvas(false)}>Bekor qilish</button>
                <button type="submit">Yuborish</button>
              </div>
            </form>
          </div>
          {(departmentCanvas || zipCanvas) && <div className="word-offcanvas-shape"></div>}
        </div>
      )}
    </div>
  );
};

export default AddFile;