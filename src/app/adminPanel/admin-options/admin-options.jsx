import React, { useState } from "react";
import { api } from "../../../App";
import "./admin-options.scss";
import CkEditor from "../../../components/ck-editor/ck-editor";

const OptionOffcanvas = ({ testId, closeOffcanvas, refreshTests }) => {
  const [variants, setVariants] = useState([{ text: "", is_staff: false }]);
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };
  const addVariant = () => {
    setVariants((prev) => [...prev, { text: "", is_staff: false }]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const variant of variants) {
        const response = await fetch(`${api}/options/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: variant.text,
            is_staff: variant.is_staff,
            question: testId,
          }),
        });

        if (!response.ok) {
          throw new Error("Variantlarni qo'shishda xato yuz berdi.");
        }
      }
      closeOffcanvas();
      refreshTests();
    } catch (error) {
      console.error(error.message);
    }
  };
  return (
    <>
      <h2>Variant qo'shish</h2>
      <form onSubmit={handleSubmit}>
        {variants.map((variant, index) => (
          <div key={index} className="input-row d-flex">
            <CkEditor
              value={variant.text}
              onChange={(value) => handleVariantChange(index, "text", value)}
            />
            <input
              id={`check-${index}`}
              type="checkbox"
              checked={variant.is_staff}
              onChange={(e) =>
                handleVariantChange(index, "is_staff", e.target.checked)
              }
            />
            <label htmlFor={`check-${index}`}>To'g'ri</label>
          </div>
        ))}
        <button type="button" onClick={addVariant}>
          Variant qo'shish
        </button>
        <div className="btns">
          <button type="button" onClick={closeOffcanvas}>
            Bekor qilish
          </button>
          <button type="submit">Saqlash</button>
        </div>
      </form>
    </>
  );
};

export default OptionOffcanvas;
