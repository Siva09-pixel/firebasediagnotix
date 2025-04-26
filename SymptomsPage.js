import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./SymptomsPage.css";

const Symptoms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};
  const userId = localStorage.getItem('userId');

  const symptomsList = [
    "Fever",
    "Cough & Cold",
    "Headache",
    "Dizziness",
    "Vomiting/Nausea",
    "Stomach Pain",
    "Diarrhea/Constipation",
    "Sore Throat",
    "Skin Rashes/Allergies",
    "Breathing Difficulty",
    "Body Pain/Weakness"
  ];

  const [symptoms, setSymptoms] = useState(
    symptomsList.reduce((acc, symptom) => {
      acc[symptom] = { hasSymptom: "No", days: "", explanation: "" };
      return acc;
    }, {})
  );

  const handleChange = (symptom, field, value) => {
    setSymptoms((prevSymptoms) => ({
      ...prevSymptoms,
      [symptom]: { ...prevSymptoms[symptom], [field]: value },
    }));
  };

  const handleNext = async () => {
    try {
      const docRef = await addDoc(collection(db, "symptoms"), {
        symptoms,
        name: prevData.name, // Include name from previous data
        userId: userId, // Use the dynamic userId
      });
      console.log("Document written with ID: ", docRef.id);
      navigate("/health-report", { state: { ...prevData, symptoms } });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const handleBack = () => {
    navigate("/vitals-input", { state: prevData });
  };

  return (
    <div className="symptoms-container">
      <h2 className="symptoms-heading">Enter Symptoms</h2>

      <div className="symptoms-form">
        {symptomsList.map((symptom) => (
          <div key={symptom} className="symptom-input">
            <label>{symptom}</label>
            <select
              onChange={(e) => handleChange(symptom, "hasSymptom", e.target.value)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            {symptoms[symptom].hasSymptom === "Yes" && (
              <div className="additional-info">
                <input
                  type="number"
                  placeholder="Days"
                  onChange={(e) => handleChange(symptom, "days", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Explanation"
                  onChange={(e) => handleChange(symptom, "explanation", e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <button className="btn" onClick={handleBack}>
          Back
        </button>
        <button className="btn" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Symptoms;
