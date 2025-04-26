    import { collection, addDoc } from "firebase/firestore";
    import { db, auth } from "../firebase"; // Ensure correct import paths

    export const saveMedicalData = async (symptoms, vitals, healthReport, aiHealthReport) => {
    try {
        const user = auth.currentUser; // Get the currently logged-in user
        if (!user) {
        throw new Error("User not authenticated"); // Ensure user is authenticated
        }

        // Save the medical data along with the userId
        await addDoc(collection(db, "medicalInfo"), {
        userId: user.uid, // Store user ID for easy retrieval
        symptoms,
        vitals,
        healthReport,
        aiHealthReport,
        timestamp: new Date(), // Optional: to keep track of when the record was created
        });

        console.log("Medical data saved successfully!");
    } catch (error) {
        console.error("Error saving medical data:", error);
    }
    };
