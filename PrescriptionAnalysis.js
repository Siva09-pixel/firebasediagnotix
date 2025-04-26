import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jsPDF from "jspdf";
import emailjs from "emailjs-com";

const PrescriptionAnalysis = () => {
  const { appointmentId } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  const genAI = new GoogleGenerativeAI("AIzaSyD5F8huvGV31WaVTKaqhHq1I70zx_1dk9w"); // your API key here

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const docRef = doc(db, "prescriptions", appointmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrescription(data);
          generateAnalysis(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching prescription:", error);
      }
    };

    fetchPrescription();
  }, [appointmentId]);

  const generateAnalysis = async (prescriptionData) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let prompt = `Analyze this prescription for the patient. Mention important points like diagnosis, medicines given, timings, and whether it's before/after food. Also give an Indian diet chart based on the medicine.
      
Patient Name: ${prescriptionData.patientName}
Age: ${prescriptionData.age}
Date: ${prescriptionData.date}
Diagnosis: ${prescriptionData.diagnosis}
Tablets:
${prescriptionData.tablets.map(
  (tab, i) =>
    `${i + 1}. ${tab.name} - Timing: ${tab.timing}, Food: ${tab.food}`
).join("\n")}
      
Provide a simple and helpful analysis for the patient.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      setAnalysis(text);
      setLoading(false);
    } catch (error) {
      console.error("Error generating analysis:", error);
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(14);
    docPDF.text("Prescription Summary", 10, 10);

    let y = 20;
    docPDF.text(`Patient Name: ${prescription.patientName}`, 10, y += 10);
    docPDF.text(`Age: ${prescription.age}`, 10, y += 10);
    docPDF.text(`Diagnosis: ${prescription.diagnosis}`, 10, y += 10);

    docPDF.text("Tablets:", 10, y += 10);
    prescription.tablets.forEach((tab, i) => {
      docPDF.text(`${i + 1}. ${tab.name} - ${tab.timing} - ${tab.food}`, 10, y += 10);
    });

    docPDF.text("AI Summary:", 10, y += 15);

    const lines = docPDF.splitTextToSize(analysis, 180);
    lines.forEach(line => {
      if (y > 280) {
        docPDF.addPage();
        y = 10;
      }
      docPDF.text(line, 10, y += 10);
    });

    return docPDF;
  };

  const sendEmail = async (pdfData) => {
    try {
      const formData = new FormData();
      formData.append("to_email", prescription.patientEmail); // Patient email
      formData.append("subject", `Prescription for ${prescription.patientName}`);
      formData.append("message", `Dear ${prescription.patientName},\n\nPlease find your prescription and analysis attached.`);

      const file = pdfData.output("blob");
      formData.append("attachment", file, `${prescription.patientName}_Prescription.pdf`);

      // Send email using EmailJS
      await emailjs.sendForm('your_service_id', 'your_template_id', formData, 'your_user_id');
      console.log('Email sent successfully');
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const storePrescriptionAnalysis = async (prescriptionId, analysisData) => {
    try {
      const docRef = doc(db, "prescriptionAnalyses", prescriptionId);
      await setDoc(docRef, {
        analysis: analysisData,
        timestamp: new Date(),
      });
      console.log("Analysis stored in Firestore");
    } catch (error) {
      console.error("Error storing analysis:", error);
    }
  };

  const handleDownloadAndEmail = async () => {
    try {
      const pdfData = downloadPDF();
      await sendEmail(pdfData); // Send PDF to patient via email
      await storePrescriptionAnalysis(appointmentId, analysis); // Store analysis in Firebase
      console.log("Prescription analysis and email sent successfully.");
    } catch (error) {
      console.error("Error in downloading, emailing, and storing:", error);
    }
  };

  if (loading) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Prescription Analysis & Diet Chart</h2>
      {prescription && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Patient Details:</h3>
          <p><strong>Name:</strong> {prescription.patientName}</p>
          <p><strong>Age:</strong> {prescription.age}</p>
          <p><strong>Date:</strong> {prescription.date}</p>
          <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
          
          <h4>Tablets:</h4>
          <ul>
            {prescription.tablets.map((tab, i) => (
              <li key={i}>
                {tab.name} - {tab.timing} - {tab.food}
              </li>
            ))}
          </ul>

          <h3>AI Generated Analysis:</h3>
          <pre style={{ backgroundColor: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
            {analysis}
          </pre>

          <button
            onClick={handleDownloadAndEmail}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Download PDF & Send Email
          </button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionAnalysis;
