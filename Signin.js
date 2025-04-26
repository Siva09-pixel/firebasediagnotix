import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import "./SignIn.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !phone) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        phone,
        role: isDoctor ? "doctor" : "user",
      });

      alert("Registration Successful!");
      navigate(isDoctor ? "/dashboard" : "/");
    } catch (error) {
      console.error("Signup Error:", error);
      setErrorMessage(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userRole = window.confirm("Are you a doctor? Click OK for YES, Cancel for NO") ? "doctor" : "user";

        await setDoc(userRef, {
          email: user.email,
          phone: "",
          role: userRole,
        });
      }

      alert("Google Sign-In Successful!");
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>

      <div className="toggle-buttons">
        <button className={`toggle-btn patient-btn ${!isDoctor ? "active" : ""}`} onClick={() => setIsDoctor(false)}>
          Patient
        </button>
        <button className={`toggle-btn doctor-btn ${isDoctor ? "active" : ""}`} onClick={() => setIsDoctor(true)}>
          Doctor
        </button>
      </div>

      {errorMessage && <div className="error-popup">{errorMessage}</div>}

      <form className="signup-form" onSubmit={handleSignup}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        
        <button type="submit" className="lf--submit">Sign Up</button>

        <button className="google-btn" type="button" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </form>

      <p className="switch-auth">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "blue" }}>
          Login here
        </span>
      </p>
    </div>
  );
};

export default Signin;
