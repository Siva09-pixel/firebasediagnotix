import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import "./UploadPrescription.css";

function UploadPrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    date: "",
    diagnosis: "",
    tablets: [{ name: "", timing: "", food: "", dosage: "" }],
  });

  const [patientAllergyInfo, setPatientAllergyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllergyInfo = async () => {
      setLoading(true);
      try {
        // Step 1: Get the userId from the appointment document
        const appointmentDoc = await getDoc(doc(db, "appointments", appointmentId));
        if (appointmentDoc.exists()) {
          const userId = appointmentDoc.data().userId;
          console.log("Fetched userId:", userId);

          // Step 2: Use the userId to fetch the allergy information from medicalInfo
          const q = query(collection(db, "medicalInfo"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setPatientAllergyInfo(querySnapshot.docs[0].data());
          } else {
            console.log("No allergy info found for patient.");
            setPatientAllergyInfo({ allergies: "No" }); // Default if no info
          }
        } else {
          console.log("Appointment not found.");
        }
      } catch (error) {
        console.error("Error fetching allergy info:", error);
      }
      setLoading(false);
    };

    fetchAllergyInfo();
  }, [appointmentId]);

  const handleTabletChange = (index, field, value) => {
    const updatedTablets = [...formData.tablets];
    updatedTablets[index][field] = value;
    setFormData({ ...formData, tablets: updatedTablets });
  };

  const addTablet = () => {
    setFormData({
      ...formData,
      tablets: [...formData.tablets, { name: "", timing: "", food: "", dosage: "" }],
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, "prescriptions", appointmentId), {
        ...formData,
        appointmentId,
        createdAt: new Date(),
      });
      alert("Prescription saved successfully!");
      navigate(`/prescription-analysis/${appointmentId}`);
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Error saving prescription.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h3>Prescription Form</h3>

      {/* Allergy Badge */}
      {loading && <p>Loading allergy info...</p>}

      {!loading && patientAllergyInfo && patientAllergyInfo.allergies === "Yes" && (
        <div
          style={{
            backgroundColor: "#ffe0e0",
            color: "#b30000",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "inline-block",
            fontWeight: "bold",
          }}
        >
          ⚡ Allergy Reported
          {patientAllergyInfo?.allergyDetails ? `: ${patientAllergyInfo.allergyDetails}` : ""}
        </div>
      )}

      {!loading && patientAllergyInfo && patientAllergyInfo.allergies === "No" && (
        <div
          style={{
            backgroundColor: "#fff8d9",
            color: "#8a6d00",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "inline-block",
            fontWeight: "bold",
          }}
        >
          ✅ No Allergies Reported
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="diagnosis"
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          required
        />

        <h4>Tablets</h4>
        {formData.tablets.map((tablet, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Tablet Name"
              value={tablet.name}
              onChange={(e) => handleTabletChange(index, "name", e.target.value)}
              required
            />
            <select
              value={tablet.timing}
              onChange={(e) => handleTabletChange(index, "timing", e.target.value)}
              required
            >
              <option value="">Select Timing</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
            <select
              value={tablet.food}
              onChange={(e) => handleTabletChange(index, "food", e.target.value)}
              required
            >
              <option value="">Select Food Option</option>
              <option value="Before Food">Before Food</option>
              <option value="After Food">After Food</option>
            </select>
            <input
              type="text"
              placeholder="Dosage (e.g., 500mg)"
              value={tablet.dosage}
              onChange={(e) => handleTabletChange(index, "dosage", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addTablet} style={{ marginTop: "10px" }}>
          + Add Tablet
        </button>
        <br />
        <button type="submit" style={{ marginTop: "20px" }}>
          Submit Prescription
        </button>
      </form>
    </div>
  );
}

export default UploadPrescription;
