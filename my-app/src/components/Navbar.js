import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../css/Navbar.css";

export default function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  let navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">📈</span>
        <span className="logo-text">
          StockFusion
          <div className="tagline">Invest Smarter. Track Faster.</div>
        </span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/Allstocks">All Stocks</Link></li>
        <li><Link to="/CompanyInfo">Company Info</Link></li>

        {isAuthenticated ? (
          <>
            <li><Link to="/Userstocks">My Stocks</Link></li>
            <li><Link to="/Transaction">Transactions</Link></li>
            <li><Link to="/SellDetails">Sell Details</Link></li>
            <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/Login" className="auth-btn">Login</Link></li>
            <li><Link to="/Signup" className="auth-btn">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
