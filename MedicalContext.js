import React, { createContext, useState, useContext } from "react";

// ✅ Create Context
const MedicalContext = createContext();

export const MedicalProvider = ({ children }) => {
  const [medicalData, setMedicalData] = useState({
    medicalInfo: {},
    vitalsInput: {},
    symptoms: {},
  });

  return (
    <MedicalContext.Provider value={{ medicalData, setMedicalData }}>
      {children}
    </MedicalContext.Provider>
  );
};

// ✅ Custom Hook to Use Context
export const useMedicalContext = () => useContext(MedicalContext);
