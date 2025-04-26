import React, { useState } from "react";
import { saveMedicalData } from "../firebase"; 
import { auth } from "../firebase"; 

const MedicalForm = () => {
  const [medicalData, setMedicalData] = useState({
    vitals: "",
    symptoms: "",
    healthReport: "",
    aiHealthReport: "",
  });

  const handleChange = (e) => {
    setMedicalData({ ...medicalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      await saveMedicalData(user.uid, medicalData);
      alert("✅ Medical data saved successfully!");
      setMedicalData({ vitals: "", symptoms: "", healthReport: "", aiHealthReport: "" }); // ✅ Reset form
    } else {
      alert("❌ User not logged in!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <input type="text" name="vitals" placeholder="Vitals Info" value={medicalData.vitals} onChange={handleChange} required />
      <input type="text" name="symptoms" placeholder="Symptoms" value={medicalData.symptoms} onChange={handleChange} required />
      <input type="text" name="healthReport" placeholder="Health Report" value={medicalData.healthReport} onChange={handleChange} required />
      <input type="text" name="aiHealthReport" placeholder="AI Health Report" value={medicalData.aiHealthReport} onChange={handleChange} required />
      <button type="submit">Save</button>
    </form>
  );
};

export default MedicalForm;
