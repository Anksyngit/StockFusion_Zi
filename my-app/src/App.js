import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import StockState from "./context/StockState";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import MarketNews from "./components/MarketNews";
import Allstock from "./components/Allstockitem";
import Stock from "./components/Stock";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Transactions from "./components/Transactionfile";
import StockPrediction from "./components/StockPrediction";
import SentimentAnalysis from "./components/SentimentAnalysis";
import CompanyInfo from "./components/CompanyInfo";
import SellDetails from "./components/SellDetails";
import About from "./components/About";

function App() {
  return (
    <AuthProvider>
      <StockState>
        <Router>
          <div className="app-container">
            <Navbar />

            <div className="container">
              <Routes>
                {/* Home */}
                <Route path="/" element={<MarketNews />} />

                {/* Stock Pages */}
                <Route path="/Userstocks" element={<Stock />} />
                <Route path="/Allstocks" element={<Allstock />} />

                {/* Auth */}
                <Route path="/Login" element={<Login />} />
                <Route path="/Signup" element={<Signup />} />

                {/* Transactions & Sell Details */}
                <Route path="/Transaction" element={<Transactions />} />
                <Route path="/SellDetails" element={<SellDetails />} />

                {/* Extra Features */}
                <Route path="/Prediction" element={<StockPrediction />} />
                <Route path="/Analysis" element={<SentimentAnalysis />} />
                <Route path="/CompanyInfo" element={<CompanyInfo />} />

                {/* About */}
                <Route path="/About" element={<About />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </Router>
      </StockState>
    </AuthProvider>
  );
}

export default App;
