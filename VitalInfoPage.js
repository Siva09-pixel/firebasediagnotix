import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Firebase initialization file
import "./VitalInfoPage.css"; // Import the CSS file for styling

const VitalInfoPage = () => {
  const { patientId } = useParams(); // Extract patientId from URL parameters
  const [vitalInfo, setVitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitalInfo = async () => {
      try {
        // Get all documents from the 'medicalInfo' collection
        const vitalsRef = collection(db, "medicalInfo");
        const vitalsQuerySnapshot = await getDocs(vitalsRef);

        vitalsQuerySnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if the userId matches the patientId in the database
          if (data.userId === patientId) {
            setVitalInfo(data); // Set the state with the fetched data
            setLoading(false); // Set loading to false once data is fetched
          }
        });
      } catch (error) {
        console.error("Error fetching vital information:", error);
        setLoading(false); // Stop loading if there is an error
      }
    };

    fetchVitalInfo();
  }, [patientId]); // Re-fetch if patientId changes

  if (loading) {
    return <div className="loading">Loading vital information...</div>; // Loading state
  }

  if (!vitalInfo) {
    return <div className="error">No data found for Patient ID: {patientId}</div>; // Error state if no data is found
  }

  return (
    <div className="vital-info-form">
      <h2 className="form-heading">Vital Information for Patient ID: {patientId}</h2>
      <form className="vital-info-container">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={vitalInfo.name} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="pulse">Pulse (BPM)</label>
          <input type="text" id="pulse" value={vitalInfo.pulse} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="spo2">SPO2 (%)</label>
          <input type="text" id="spo2" value={vitalInfo.spo2} readOnly />
        </div>
        <div className="form-group">
          <label htmlFor="temperature">Temperature (°C)</label>
          <input type="text" id="temperature" value={vitalInfo.temperature} readOnly />
        </div>
        {/* Add more fields if necessary */}
      </form>
    </div>
  );
};

export default VitalInfoPage;
