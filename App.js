import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import LanguageSelection from "./pages/LanguageSelection";
import MedicalInfo from "./pages/MedicalInfo";
import VitalsInput from "./pages/VitalsInput";
import HealthReport from "./pages/HealthReport";
import SymptomsPage from "./pages/SymptomsPage";
import VideoConsult from "./pages/VideoConsult";
import MedicalRecords from "./pages/MedicalRecords";
import DoctorDashboard from "./pages/DoctorDashboard";
import ScheduleAppointment from "./pages/ScheduleAppointment";
import UploadPrescription from "./pages/UploadPrescription";
import VideoCall from "./pages/VideoCall";
import PrescriptionAnalysis from "./pages/PrescriptionAnalysis";
import VitalInfoPage from "./pages/VitalInfoPage";
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signin />} />
          <Route path="/LanguageSelection" element={<LanguageSelection />} />
          <Route path="/medical-info" element={<MedicalInfo />} />
          <Route path="/vitals-input" element={<VitalsInput />} />
          <Route path="/symptoms" element={<SymptomsPage />} />
          <Route path="/health-report" element={<HealthReport />} />
          <Route path="/video-call/:callId" element={<VideoConsult />} />
          <Route path="/medicalRecords" element={<MedicalRecords />} />
          <Route path="/dashboard" element={<DoctorDashboard />} />
          <Route path="/scheduleAppointment" element={<ScheduleAppointment />} />
          <Route path="/upload-prescription/:appointmentId" element={<UploadPrescription/>}/>
          <Route path="/video-call/:appointmentId" element = {<VideoCall/>}/>
          <Route path="/prescription-analysis/:appointmentId" element = {<PrescriptionAnalysis/>}/>
          <Route path="/vital-info/:patientId" element={<VitalInfoPage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
