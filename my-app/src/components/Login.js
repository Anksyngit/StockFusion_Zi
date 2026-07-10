import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const [credential, setCredential] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("API URL:", process.env.REACT_APP_API_URL);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/authenticate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credential),
        }
      );

      const text = await response.text();

      let json = {};

      try {
        json = JSON.parse(text);
      } catch {
        console.error("Server didn't return JSON:", text);
      }

      console.log("Status:", response.status);
      console.log("Response:", json);

      if (response.ok && json.Token) {
        localStorage.setItem("token", json.Token);
        setIsAuthenticated(true);
        navigate("/Userstocks");
      } else {
        alert(json.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back 👋</h2>
        <p>Login to access your Stock Portfolio</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              value={credential.email}
              onChange={(e) =>
                setCredential({
                  ...credential,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={credential.password}
              onChange={(e) =>
                setCredential({
                  ...credential,
                  password: e.target.value,
                })
              }
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/Signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}