import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchMedicalRecords = async (userId) => {
  try {
    const records = [];
    
    // Fetch medicalInfo documents
    const medicalInfoRef = collection(db, "medicalInfo");
    const medicalInfoQuery = query(medicalInfoRef, where("userId", "==", userId));
    const medicalInfoSnapshot = await getDocs(medicalInfoQuery);
    
    // Fetch vitals documents
    const vitalsRef = collection(db, "vitals");
    const vitalsQuery = query(vitalsRef, where("userId", "==", userId));
    const vitalsSnapshot = await getDocs(vitalsQuery);
    
    // Fetch symptoms documents
    const symptomsRef = collection(db, "symptoms");
    const symptomsQuery = query(symptomsRef, where("userId", "==", userId));
    const symptomsSnapshot = await getDocs(symptomsQuery);

    // Combine results
    medicalInfoSnapshot.forEach((doc) => {
      const data = doc.data();
      const record = {
        id: doc.id,
        ...data,
        vitals: {},
        symptoms: {},
      };
      records.push(record);
    });

    vitalsSnapshot.forEach((doc) => {
      const data = doc.data();
      const userRecord = records.find(record => record.userId === data.userId);
      if (userRecord) {
        userRecord.vitals = {
          temperature: data.temperature,
          spo2: data.spo2,
          pulse: data.pulse,
        };
      }
    });

    symptomsSnapshot.forEach((doc) => {
      const data = doc.data();
      const userRecord = records.find(record => record.userId === data.userId);
      if (userRecord) {
        userRecord.symptoms = data.symptoms;
      }
    });

    return records;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};
