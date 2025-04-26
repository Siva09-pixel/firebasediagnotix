export function getSuggestedDosage(age, weight, disease) {
    if (disease.includes("fever")) {
      if (age < 12) return "Paracetamol 250mg twice a day";
      if (age < 60) return "Paracetamol 500mg thrice a day";
      return "Paracetamol 500mg twice a day";
    }
    if (disease.includes("diabetes")) {
      return "Metformin 500mg once daily";
    }
    return "Consult Doctor for manual dosage";
  }
  