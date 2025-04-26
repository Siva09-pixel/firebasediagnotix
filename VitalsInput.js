import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMonitor } from "react-icons/fi";
import "./VitalsInput.css";
import Modal from "./Modal";

const VitalsInput = () => {
  const location = useLocation();
  const medicalInfo = location.state || {}; 
  const [vitals, setVitals] = useState({ temperature: "", spo2: "", pulse: "" });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); 

  const handleChange = (e) => {
    setVitals((prevVitals) => ({ ...prevVitals, [e.target.name]: e.target.value }));
  };

const handleNext = async () => {
  const { temperature, spo2, pulse } = vitals;

  if (!temperature || !spo2 || !pulse) {
    setShowModal(true); // Show modal for validation error
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "vitals"), {
      ...vitals,
      name: medicalInfo.name, // Include name from previous data
      userId: userId, // Use the dynamic userId
    });
    console.log("Document written with ID: ", docRef.id);

    // Pass vitals data and medicalInfo to the next page
    navigate("/symptoms", { state: { vitals, medicalInfo } });
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};


  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="vitals-container">
      <h2 className="vitals-heading">Enter Vitals</h2>

      <div className="vitals_cards-container">
        <div className="card manual-entry">
          <h3 className="vital_heading">Manual Data Entry</h3>
          {["temperature", "spo2", "pulse"].map((vital) => (
            <div className="input-group" key={vital}>
              <label htmlFor={vital} className="input-label">
                {vital.charAt(0).toUpperCase() + vital.slice(1)} 
                {vital === "temperature" ? " (°C)" : vital === "spo2" ? " (%)" : " (BPM)"}
              </label>
              <input
                id={vital}
                type="number"
                name={vital}
                placeholder={`Enter ${vital.charAt(0).toUpperCase() + vital.slice(1)}`}
                onChange={handleChange}
              />
            </div>
          ))}
          <button className="btn" onClick={handleNext}>
            Next
          </button>
        </div>

        <div className="card testing-kit">
          <FiMonitor className="device-icon" />
          <h3>Use Our Portable Testing Kit</h3>
          <p>Connect your testing kit to automatically capture your vitals.</p>
          <button className="btn connect-btn">
            <FiMonitor /> Connect Device
          </button>
        </div>
      </div>

      {showModal && (
        <Modal 
          message="Please fill in all fields before proceeding." 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default VitalsInput;
