import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MedicalInfo.css";
import Modal from "./Modal"; 
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 

const MedicalInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    allergies: "No",
    allergyDetails: "",
  });

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleChange = (e) => {
    setFormData((prev) => ({  
      ...prev,
      [e.target.name]: e.target.value,
      allergyDetails: e.target.name === "allergies" && e.target.value === "No" ? "" : prev.allergyDetails,
    }));
  };

  const handleNext = async () => {
    const { name, age, height, weight } = formData;

    if (!name || !age || !height || !weight) {
      setShowModal(true); // Show modal for validation error
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "medicalInfo"), {
        ...formData,
        userId: userId, // Use the dynamic userId
      });
      console.log("Document written with ID: ", docRef.id);
      navigate("/vitals-input", { state: { ...formData } });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="medical_container">
      <h2 className="medical_heading">Medical Information</h2>
      {["name", "age", "height", "weight"].map((field) => (
        <div key={field} className="input_group">
          <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            id={field}
            type={field === "name" ? "text" : "number"}
            name={field}
            placeholder={`Enter your ${field}`}
            onChange={handleChange}
            required
          />
        </div>
      ))}

      <div className="input_group">
        <label htmlFor="allergies">Any Allergies?</label>
        <select name="allergies" onChange={handleChange}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      {formData.allergies === "Yes" && (
        <div className="input_group">
          <label htmlFor="allergyDetails">Specify Allergies</label>
          <input
            id="allergyDetails"
            type="text"
            name="allergyDetails"
            placeholder="Specify your allergies"
            onChange={handleChange}
          />
        </div>
      )}

      <button className="btn" onClick={handleNext}>
        Next
      </button>

      {showModal && (
        <Modal 
          message="Please fill in all fields before proceeding." 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default MedicalInfo;
