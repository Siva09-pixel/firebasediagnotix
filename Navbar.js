import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import loginIcon from "../Images/user.png";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null); 
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 3000); 
    }
  };

  const handleProfileClick = () => {
    if (user) {
      setDropdownOpen(!dropdownOpen);
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      {errorMessage && <div className="error-popup">{errorMessage}</div>}

      <div className="container navbar-content">
        <h1 className="logo" onClick={() => navigate("/")}>Diagnotizx</h1> 
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/contact">Contact</Link>

          <div className="profile-section">
            <div className="profile-dropdown">
              <img
                src={user ? user.photoURL : loginIcon}
                alt="User Profile"
                className="profile-icon"
                onClick={handleProfileClick} 
              />
              {dropdownOpen && user && (
                <div className="dropdown-menu">
                  <p>{user.displayName || "User"}</p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
