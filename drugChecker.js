export function checkDrugAllergy(prescription, allergies = []) {
    for (const drug of prescription.split(" ")) {
      for (const allergy of allergies) {
        if (drug.toLowerCase().includes(allergy.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  }
  