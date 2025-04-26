import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDoctorLogin, setIsDoctorLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      redirectToDashboard(user.uid);
    }
  }, []);

  const redirectToDashboard = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        sessionStorage.setItem("userRole", userRole);

        if (userRole === "doctor") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setErrorMessage("User role not found. Please contact support.");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setErrorMessage("Failed to fetch user role.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      redirectToDashboard(user.uid);
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        setErrorMessage("Google login not allowed. Please sign up first.");
        return;
      }

      redirectToDashboard(user.uid);
    } catch (error) {
      console.error("Google Login Error:", error);
      setErrorMessage("Google login failed.");
    }
  };

  return (
    <div className="login-container">
      <h2>{isDoctorLogin ? "Doctor Login" : "Patient Login"}</h2>

      <div className="toggle-buttons">
        <button className={`toggle-btn patient-btn ${!isDoctorLogin ? "active" : ""}`} onClick={() => setIsDoctorLogin(false)}>
          Patient Login
        </button>
        <button className={`toggle-btn doctor-btn ${isDoctorLogin ? "active" : ""}`} onClick={() => setIsDoctorLogin(true)}>
          Doctor Login
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleLogin} className="login-form">
        <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="lf--submit">Login</button>
      </form>

      <button className="google-btn" onClick={handleGoogleLogin}>
        Sign in with Google
      </button>

      <p className="switch-auth">
        Don't have an account?{" "}
        <span onClick={() => navigate("/signup")} style={{ cursor: "pointer", color: "blue" }}>
          Sign up here
        </span>
      </p>
    </div>
  );
};

export default Login;
