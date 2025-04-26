import React, { useState, useEffect } from "react";
import { fetchMedicalRecords } from "./fetchMedicalRecords";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import './MedicalRecords.css'; // Import CSS

const MedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const records = await fetchMedicalRecords(user.uid);
        setMedicalRecords(records);
        if (records.length === 0) {
          alert("No medical records found for this user.");
        }
      } catch (err) {
        setError("Failed to fetch medical records.");
      }
      setLoading(false);
    };

    fetchRecords();
  }, []);

  return (
    <div className="medical-records">
      <h2>Previous Medical Records</h2>

      {loading ? (
        <p>Loading medical records...</p>
      ) : error ? (
        <p>{error}</p>
      ) : medicalRecords.length > 0 ? (
        <div className="records-container">
          {medicalRecords.map((record, index) => (
            <div 
              key={record.id || index} 
              className="history-card"
              onClick={() => setSelectedRecord(record)}
            >
              <p><strong>Health History {index + 1}</strong></p>
            </div>
          ))}
        </div>
      ) : (
        <p>No medical records found.</p>
      )}

      {/* Modal for displaying full details */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setSelectedRecord(null)}>×</span>
            <h3>Medical Details</h3>
            <p><strong>Name:</strong> {selectedRecord.name}</p>
            <p><strong>Allergies:</strong> {selectedRecord.allergies || 'N/A'}</p>
            <p><strong>Weight:</strong> {selectedRecord.weight || 'N/A'}</p>
            <p><strong>Age:</strong> {selectedRecord.age || 'N/A'}</p>
            <p><strong>Temperature:</strong> {selectedRecord.vitals?.temperature || 'N/A'}</p>
            <p><strong>SpO2:</strong> {selectedRecord.vitals?.spo2 || 'N/A'}</p>
            <p><strong>Pulse:</strong> {selectedRecord.vitals?.pulse || 'N/A'}</p>
            <p><strong>Symptoms:</strong> {Array.isArray(selectedRecord.symptoms) ? selectedRecord.symptoms.join(', ') : JSON.stringify(selectedRecord.symptoms) || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
