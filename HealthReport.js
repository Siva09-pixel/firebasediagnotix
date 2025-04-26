import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./HealthReport.css";

const HealthReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vitals = location.state || {};
  const symptoms = vitals.symptoms || {};
  const [report, setReport] = useState({});
  const [bmi, setBmi] = useState(null);
  const [bmiReport, setBmiReport] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!vitals.temperature || !vitals.spo2 || !vitals.pulse || !vitals.height || !vitals.weight) return;

    // Convert temperature to Fahrenheit
    const temperatureF = (vitals.temperature * 9) / 5 + 32;

    setReport({
      temperature: temperatureF < 96.8 ? "Low" : temperatureF > 99.5 ? "High" : "Normal",
      spo2: vitals.spo2 < 95 ? "Low" : vitals.spo2 > 99 ? "High" : "Normal",
      pulse: vitals.pulse < 60 ? "Low" : vitals.pulse > 100 ? "High" : "Normal",
    });

    const heightInMeters = vitals.height / 100;
    if (vitals.weight && heightInMeters) {
      const calculatedBmi = vitals.weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi.toFixed(2));
      setBmiReport(calculateBmiCategory(calculatedBmi));
    }
  }, [vitals]);

  useEffect(() => {
    if (bmi) generateAiSummary();
  }, [bmi]);

  const calculateBmiCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 24.9) return "Normal weight";
    if (bmi >= 25 && bmi < 29.9) return "Overweight";
    return "Obesity";
  };

  const generateAiSummary = async () => {
    setLoading(true);
    const apiKey = "AIzaSyD5F8huvGV31WaVTKaqhHq1I70zx_1dk9w";

    let healthData = `The patient has the following vital signs:
      - Temperature: ${(vitals.temperature * 9) / 5 + 32}°F
      - SPO2: ${vitals.spo2}%
      - Pulse: ${vitals.pulse} bpm
      - Height: ${vitals.height} cm
      - Weight: ${vitals.weight} kg
      - BMI: ${bmi}
      - BMI Report: ${bmiReport}

      Symptoms reported:\n`;

    Object.entries(symptoms).forEach(([symptom, details]) => {
      healthData += `- ${symptom}: ${details.hasSymptom} (Days: ${details.days || "N/A"}, Explanation: ${details.explanation || "N/A"})\n`;
    });

    const data = {
      contents: [{ parts: [{ text: `Analyze this health data and suggest possible medical conditions with in 5 points with in 200 words not given it in bullet points not with  asterisk :\n${healthData}` }] }],
    };

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        const summary = response.data.candidates[0]?.content?.parts[0]?.text || "No summary generated.";
        setAiSummary(summary);
      } else {
        setAiSummary("No summary generated.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleConsultDoctor = () => {
    navigate("/scheduleAppointment"); // Navigate to the schedule appointment page
  };

  return (
    <div className="health_container">
      <h2>Health Report</h2>
      <p>Your health parameters and symptoms have been analyzed.</p>
      
      {/* Vitals Section */}
      <div className="report-grid">
        {["temperature", "spo2", "pulse"].map((key) => (
          <div className="report-card" key={key}>
            <h3>
              {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
              {key === "temperature"
                ? ((vitals.temperature * 9) / 5 + 32).toFixed(1) + "°F"
                : vitals[key]}
            </h3>
            <p className={`status ${report[key]}`}>{report[key]}</p>
          </div>
        ))}
        {bmi && (
          <div className="report-card">
            <h3>BMI: {bmi}</h3>
            <p className={`status`}>{bmiReport}</p>
          </div>
        )}
      </div>

      {/* Symptoms Section */}
      {Object.keys(symptoms).length > 0 && (
        <>
          <h3>Symptoms</h3>
          <div className="report-grid">
            {Object.entries(symptoms)
              .filter(([_, details]) => details.hasSymptom === "Yes") // Filter only symptoms with "Yes"
              .map(([symptom, details]) => (
                <div className="report-card" key={symptom}>
                  <h3>{symptom}</h3>
                  {details.days && <p><strong>Days:</strong> {details.days}</p>}
                  {details.explanation && <p><strong>Explanation:</strong> {details.explanation}</p>}
                </div>
              ))}
          </div>
        </>
      )}

      {/* AI Summary Button */}
      <button className="ai-summary-btn" onClick={() => setShowSummary(true)}>Show AI Summary</button>

      {/* AI Summary Pop-Up */}
      {showSummary && (
        <div className="ai-summary-modal">
          <div className="ai-summary-content">
            <span className="close-btn" onClick={() => setShowSummary(false)}>&times;</span>
            <h3>AI Summary</h3>
            {loading ? <p>Generating summary...</p> : <p>{aiSummary || "No summary available."}</p>}
          </div>
        </div>
      )}
      <button className="consult-doctor-btn" onClick={handleConsultDoctor}>Consult Doctor</button>
    </div>
  );
};

export default HealthReport;
