import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LanguageSelection.css";

const LanguageSelection = () => {
  const [language, setLanguage] = useState("English");
  const navigate = useNavigate();

  return (
    <div className="language_container">
      <h2>Select Your Language</h2>
      <div className="language_options"> {/* Add this div */}
        {["English", "Hindi"].map((lang) => (
          <label key={lang}>
            <input
              type="radio"
              value={lang}
              checked={language === lang}
              onChange={() => setLanguage(lang)}
            />
            {lang}
          </label>
        ))}
      </div>
      <button className="btn" onClick={() => navigate("/medical-info")}>
        Confirm
      </button>
    </div>
  );
};

export default LanguageSelection;
