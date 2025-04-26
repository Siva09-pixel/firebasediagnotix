import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase"; 
import { db } from '../firebase'; 
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]); // State to hold medical records
  const navigate = useNavigate();

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch medical records for the authenticated user
  const fetchMedicalRecords = async (uid) => {
    const recordsRef = collection(db, "medicalRecords");
    const q = query(recordsRef, where("userId", "==", uid)); // Filter by userId
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => doc.data()); // Extract record data
    setMedicalRecords(records);
  };

  // Handle protected routes
  const handleProtectedRoute = (route) => {
    if (user) {
      if (route === "/medicalRecords") {
        fetchMedicalRecords(user.uid); // Fetch records when accessing this route
      }
      navigate(route);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="home">
      <h2 className='home_h2'>Welcome to Diagnotix's Teleconsultation Portal</h2>
      <p>What help do you need?</p>

      <div className="ag-format-container">
        <div className="ag-courses_box">

          {/* Teleconsultation */}
          <div className="ag-courses_item" onClick={() => handleProtectedRoute("/languageSelection")}>
            <div className="ag-courses-item_link">
              <div className="ag-courses-item_bg"></div>
              <div className="ag-courses-item_title">Teleconsultation / टेलीकंसल्ट</div>
            </div>
          </div>

          {/* Show Previous Medical Records */}
          <div className="ag-courses_item" onClick={() => handleProtectedRoute("/medicalRecords")}>
            <div className="ag-courses-item_link">
              <div className="ag-courses-item_bg"></div>
              <div className="ag-courses-item_title">Show Previous Medical Records</div>
            </div>
          </div>

        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Access Restricted</h3>
            <p>You must be logged in to access this feature.</p>
            <div className="modal-buttons">
              <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
              <button className="close-btn" onClick={() => setShowLoginModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Display Medical Records */}
      {medicalRecords.length > 0 && (
        <div className="medical-records">
          <h3>Your Medical Records:</h3>
          <ul>
            {medicalRecords.map((record, index) => (
              <li key={index}>
                {/* Customize the display of each record */}
                <p>Date: {record.date}</p>
                <p>Description: {record.description}</p>
                {/* Add other fields as needed */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
