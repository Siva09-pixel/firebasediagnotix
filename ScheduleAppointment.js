import React, { useState } from "react";
import { db } from "../firebase"; // Firestore instance
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import { getAuth } from "firebase/auth"; // Firebase Auth
import { useNavigate } from "react-router-dom"; // for navigation after booking
import "./ScheduleAppointment.css";

const ScheduleAppointment = () => {
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // navigation hook

  const handleDoctorChange = (e) => setDoctor(e.target.value);
  const handleDateChange = (e) => setDate(e.target.value);
  const handleTimeChange = (e) => setTime(e.target.value);

  const handleAppointmentBooking = async () => {
    if (!doctor || !date || !time) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMessage("You need to be logged in to book an appointment.");
      setLoading(false);
      return;
    }

    const patientId = user.uid;

    try {
      // Add appointment data and capture the generated docRef
      const docRef = await addDoc(collection(db, "appointments"), {
        doctor,
        date,
        time,
        patientId,
        status: "scheduled",
      });

      const appointmentId = docRef.id; // Capturing the appointment ID
      
      setMessage("Appointment successfully booked!");

      // Navigate to Upload Prescription page or store appointmentId
      navigate(`/upload-prescription/${appointmentId}`);
      // You can design your UploadPrescription page to receive this ID

    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("An error occurred while booking the appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-container">
      <h2>Schedule an Appointment</h2>
      <div className="appointment-form">
        <div className="form-group">
          <label htmlFor="doctor">Select Doctor:</label>
          <select
            id="doctor"
            value={doctor}
            onChange={handleDoctorChange}
            className="form-control"
          >
            <option value="">Select a doctor</option>
            <option value="Dr. John Doe">Dr. John Doe</option>
            <option value="Dr. Jane Smith">Dr. Jane Smith</option>
            <option value="Dr. Robert Brown">Dr. Robert Brown</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Select Time:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={handleTimeChange}
            className="form-control"
          />
        </div>

        <button
          onClick={handleAppointmentBooking}
          disabled={loading}
          className="btn-book-appointment"
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>

        {message && <p className="appointment-message">{message}</p>}
      </div>
    </div>
  );
};

export default ScheduleAppointment;
