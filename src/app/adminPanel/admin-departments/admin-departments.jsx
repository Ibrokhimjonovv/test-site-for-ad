'use client'
import React, { useContext, useEffect, useState } from "react";
import "./admin-departments.scss";
// import InputMask from "react-input-mask";
import editIcon from "../admin-sciences/editing.png";
import deleteIcon from "../admin-sciences/delete.png";
import Loading from "@/components/loading/layout";
import NotFound from "@/app/not-found";
import { AccessContext } from "@/contexts/contexts";

const AdminDepartments = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentCanvas, setDepartmentCanvas] = useState(false);
  const [sciences, setSciences] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    time: "",
    departmentName: "",
    scienceId: "",
    score: "",
  });

  const { profileData } = useContext(AccessContext)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sciencesResponse = await fetch(`http://37.27.23.255:8888/api/sciences/`);
        if (!sciencesResponse.ok) {
          throw new Error("Fanlar ma'lumotini olishda xato yuz berdi.");
        }
        const sciencesData = await sciencesResponse.json();
        setSciences(sciencesData);
        const subjectsWithDepartments = await Promise.all(
          sciencesData.map(async (science) => {
            const departmentsResponse = await fetch(`http://37.27.23.255:8888/api/departments/`);
            if (!departmentsResponse.ok) {
              throw new Error(
                `Bo'limlarni olishda xato yuz berdi (Fan ID: ${science.id}).`
              );
            }
            const departmentsData = await departmentsResponse.json();
            const filteredDepartments = departmentsData.filter(
              (department) => department.science === science.id
            );
            return { ...science, departments: filteredDepartments };
          })
        );
        setSubjects(subjectsWithDepartments);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDepartment
        ? `http://37.27.23.255:8888/api/departments/${editingDepartment.id}/`
        : `http://37.27.23.255:8888/api/departments/`;
      const method = editingDepartment ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.departmentName,
          time: formData.time,
          score: formData.score,
          science: formData.scienceId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Bo'lim ${
            editingDepartment ? "tahrirlash" : "qo'shish"
          }da xato yuz berdi.`
        );
      }

      const updatedDepartment = await response.json();

      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) =>
          subject.id === formData.scienceId
            ? {
                ...subject,
                departments: editingDepartment
                  ? subject.departments.map((dept) =>
                      dept.id === updatedDepartment.id
                        ? updatedDepartment
                        : dept
                    )
                  : [...subject.departments, updatedDepartment],
              }
            : subject
        )
      );

      setDepartmentCanvas(false);
      setFormData({ time: "", departmentName: "", scienceId: "", score: "" });
      setEditingDepartment(null);
      window.location.reload();
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleDelete = async (departmentId) => {
    try {
      const response = await fetch(`http://37.27.23.255:8888/api/departments/${departmentId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Bo'limni o'chirishda xato yuz berdi.");
      }

      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) => ({
          ...subject,
          departments: subject.departments.filter(
            (dept) => dept.id !== departmentId
          ),
        }))
      );
    } catch (error) {
      console.error(error.message);
    }
  };
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      time: department.time,
      departmentName: department.title,
      scienceId: department.science,
      score: department.score,
    });
    setDepartmentCanvas(true);
  };

  if(!profileData || !profileData.is_superuser) {
    return <NotFound />
  }

  return (
    <div id="admin-department">
      {loading ? (
        <Loading />
      ) : error ? (
        <p>Xato: {error}</p>
      ) : (
        <div>
          <div className="add-departments">
            <button
              onClick={() => {
                setEditingDepartment(null);
                setFormData({
                  time: "",
                  departmentName: "",
                  scienceId: "",
                  score: "",
                });
                setDepartmentCanvas(!departmentCanvas);
              }}
            >
              Bo'lim qo'shish +
            </button>
          </div>
          <div
            className={`departments-offcanvas ${
              departmentCanvas ? "active" : ""
            }`}
          >
            <h2>
              {editingDepartment ? "Bo'limni tahrirlash" : "Bo'lim qo'shish"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-row">
                <label htmlFor="time">Vaqt (soat, minut)</label>
                {/* <InputMask
                  mask="99:99"
                  placeholder="--:--"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                /> */}
              </div>
              <div className="input-row">
                <label htmlFor="departmentName">Nomi</label>
                <input
                  type="text"
                  name="departmentName"
                  id="departmentName"
                  placeholder="Nomini kiriting"
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-row">
                <label htmlFor="scienceId">Fan nomi</label>
                <select
                  name="scienceId"
                  id="scienceId"
                  value={formData.scienceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Fan tanlang
                  </option>
                  {sciences.map((science) => (
                    <option key={science.id} value={science.id}>
                      {science.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="btns">
                <button
                  type="button"
                  onClick={() => {
                    setDepartmentCanvas(false);
                    setEditingDepartment(false)
                  }}
                >
                  Bekor qilish
                </button>
                <button type="submit">
                  {editingDepartment ? "Saqlash" : "Yuborish"}
                </button>
              </div>
            </form>
          </div>
          {
            departmentCanvas || editingDepartment ? <div className="departments-offcanvas-shape"></div> : <></>
          }
          {subjects.map((subject) => (
            <div key={subject.id} className="subject">
              <h2>{subject.title}</h2>
              <ul>
                {subject.departments.length > 0 ? (
                  subject.departments.map((department, index) => (
                    <li key={department.id}>
                      <p>
                        {index + 1}. {department.title}
                      </p>
                      <p>
                        Bog'langan fani:{" "}
                        {sciences.find(
                          (science) => science.id === department.science
                        )?.title || "Noma'lum"}
                      </p>
                      <div className="department-btns">
                        <button onClick={() => handleEdit(department)}>
                          <img src={editIcon.src} alt="" />
                        </button>
                        <button onClick={() => handleDelete(department.id)}>
                          <img src={deleteIcon.src} alt="" />
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>Bo'limlar yo'q</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
