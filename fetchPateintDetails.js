
const fetchPatientDetails = async (patientId) => {
    try {
      const patientDoc = await getDoc(doc(db, "medicalInfo", patientId));
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        console.log("Selected Patient Data:", patientData); // 🔍 Log full data
  
        if (!patientData.symptoms) {
          console.warn("⚠️ No symptoms found in patient data!");
        }
  
        setSelectedPatient({ id: patientId, ...patientData });
      } else {
        console.error("Patient record not found!");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };
  