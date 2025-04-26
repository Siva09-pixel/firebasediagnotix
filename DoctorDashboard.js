import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth"; // For Firebase Auth
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const appointmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "accepted", // Mark appointment as accepted
      });
      alert("Appointment accepted successfully");

      // After accepting, show the buttons for video call and prescription upload
      setSelectedAppointment({ id: appointmentId, status: "accepted" });
      fetchAppointments(); // Refresh the list after updating the status
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleReschedule = async (appointmentId) => {
    if (!newDate || !newTime) {
      alert("Please select a new date and time.");
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        date: newDate,
        time: newTime,
        status: "rescheduled", // Mark appointment as rescheduled
      });
      alert("Appointment rescheduled successfully");
      setSelectedAppointment(null); // Close the reschedule modal
      fetchAppointments(); // Refresh the list after updating the status
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    }
  };

  const handleRescheduleChange = (e) => {
    if (e.target.name === "date") {
      setNewDate(e.target.value);
    } else if (e.target.name === "time") {
      setNewTime(e.target.value);
    }
  };

  const handleKeepVital = (patientId) => {
    // Navigate to the VitalInfoPage with the patientId
    navigate(`/vital-info/${patientId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Doctor Dashboard</h2>
      </div>

      {loading ? (
        <p className="loading-text">Loading appointments...</p>
      ) : (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patientId}</td>
                <td>{appointment.doctor}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
                <td>
                  {appointment.status === "accepted" ? (
                    <>
                      <button
                        onClick={() => navigate(`/video-call/${appointment.id}`)}
                      >
                        Start Video Call
                      </button>
                      <button
                        onClick={() => navigate(`/upload-prescription/${appointment.id}`)}
                      >
                        Upload Prescription
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAccept(appointment.id)}>
                        Accept
                      </button>
                      <button onClick={() => setSelectedAppointment(appointment)}>
                        Reschedule
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleKeepVital(appointment.patientId)}
                    className="btn-keep-vital"
                  >
                    Patient Vital Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reschedule Appointment</h3>
            <p><strong>Patient ID:</strong> {selectedAppointment.patientId}</p>
            <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
            <div className="form-group">
              <label htmlFor="newDate">New Date:</label>
              <input
                type="date"
                id="newDate"
                name="date"
                value={newDate}
                onChange={handleRescheduleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newTime">New Time:</label>
              <input
                type="time"
                id="newTime"
                name="time"
                value={newTime}
                onChange={handleRescheduleChange}
                className="form-control"
              />
            </div>

            <button onClick={() => handleReschedule(selectedAppointment.id)} className="btn-reschedule">
              Reschedule Appointment
            </button>

            <button className="close-btn" onClick={() => setSelectedAppointment(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
