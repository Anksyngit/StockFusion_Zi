import React, { useState, useEffect, useContext } from "react";
import StockContext from "../context/StockContext";
import axios from "axios";
import '../css/Stockitem.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export default function StockCard(props) {
  const { stock } = props;
  const { fetchCurrentPrice, sellStock } = useContext(StockContext);

  const [currentPrice, setCurrentPrice] = useState(null);
  const [totalValue, setTotalValue] = useState(null);
  const [profitLoss, setProfitLoss] = useState(0);
  const [chartData, setChartData] = useState([]);

  // Sell modal states
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);

  const [buyerName, setBuyerName] = useState("");
  const [buyerArea, setBuyerArea] = useState("");

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  useEffect(() => {
    const getCurrentPrice = async () => {
      try {
        const price = await fetchCurrentPrice(stock.symbol);
        setCurrentPrice(price ? Number(price) : 150);

        const profitLossValue = (price - stock.purchasePrice) * stock.quantity;
        setTotalValue(stock.quantity * price);
        setProfitLoss(profitLossValue);
      } catch (error) {
        console.error("Error fetching stock price:", error);
      }
    };

    const getHistoricalData = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.symbol}&apikey=${API_KEY}`
        );

        if (!response.data || !response.data["Time Series (Daily)"]) {
          throw new Error("No historical data available");
        }

        const timeSeries = response.data["Time Series (Daily)"];
        const historicalData = Object.entries(timeSeries || {})
          .slice(0, 7)
          .map(([date, data]) => ({
            date,
            price: parseFloat(data["4. close"]) || 0,
          }));

        setChartData(historicalData.reverse());
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setChartData([
          { date: "2025-03-01", price: 150 },
          { date: "2025-03-02", price: 152 },
          { date: "2025-03-03", price: 148 },
          { date: "2025-03-04", price: 155 },
          { date: "2025-03-05", price: 153 },
          { date: "2025-03-06", price: 157 },
          { date: "2025-03-07", price: 160 },
        ]);
      }
    };

    getCurrentPrice();
    getHistoricalData();
  }, [stock.symbol, fetchCurrentPrice, stock.quantity, stock.purchasePrice]);

  // SELL HANDLER with OTP
  const handleConfirmSell = async () => {
    if (!buyerName.trim() || !buyerArea.trim()) {
      alert("Please enter buyer name and area.");
      return;
    }

    if (sellQuantity <= 0 || sellQuantity > stock.quantity) {
      alert("Invalid quantity.");
      return;
    }

    if (otpInput !== generatedOtp) {
      alert("Incorrect OTP.");
      return;
    }

    try {
      const success = await sellStock(
        stock.symbol,
        sellQuantity,
        currentPrice,
        buyerName,
        buyerArea
      );

      if (success) {
        alert("Stock sold successfully!");
        setShowSellModal(false);
        setSellQuantity(1);
        setBuyerName("");
        setBuyerArea("");
        setOtpInput("");
      } else {
        alert("Error selling stock.");
      }
    } catch (error) {
      console.error("Sell error:", error);
      alert("Failed to sell stock.");
    }
  };

  return (
    <div className="stock-card">
      <h3 className="stock-name">{stock.name} ({stock.symbol})</h3>

      <div className="stock-info">
        <p><strong>Quantity:</strong> {stock.quantity}</p>
        <p><strong>Purchase Price:</strong> ${stock.purchasePrice.toFixed(2)}</p>
        <p><strong>Current Price:</strong>  
          {currentPrice !== null ? `$${Number(currentPrice).toFixed(2)}` : "Loading..."}  
        </p>
        <p><strong>Total Value:</strong> {totalValue !== null ? `$${totalValue.toFixed(2)}` : "Calculating..."}</p>
        <p className={`profit-loss ${profitLoss >= 0 ? "profit" : "loss"}`}>
          <strong>Profit/Loss:</strong> ${profitLoss.toFixed(2)}
        </p>
      </div>

      {/* SELL BUTTON */}
      <div className="sell-section">
        <h5>Sell Stock</h5>

        <input
          type="number"
          min="1"
          max={stock.quantity}
          value={sellQuantity}
          onChange={(e) => setSellQuantity(Number(e.target.value))}
          className="sell-input"
        />

        <button
          className="sell-button"
          onClick={() => {
            setShowSellModal(true);

            // Generate OTP for sale
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            setGeneratedOtp(otp);
            setOtpInput("");
          }}
        >
          Sell
        </button>
      </div>

      {/* PRICE TREND CHART */}
      <div className="chart-container">
        <h5>7-Day Price Trend</h5>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} tickLine={false} />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12, fill: "#666" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#333" }}
              cursor={{ stroke: "#4f46e5", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ stroke: "#4f46e5", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SELL MODAL */}
      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Sell {stock.name}</h2>

            <p><strong>Quantity:</strong> {sellQuantity}</p>
            <p><strong>Price:</strong> ${currentPrice}</p>

            <label>Buyer Name</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />

            <label>Buyer Area</label>
            <input
              type="text"
              value={buyerArea}
              onChange={(e) => setBuyerArea(e.target.value)}
            />

            <div className="otp-box">
              <p>Your OTP is:</p>
              <h2 style={{ color: "#4ade80" }}>{generatedOtp}</h2>

              <input
                type="text"
                maxLength="4"
                className="otp-input"
                placeholder="Enter OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
            </div>

            <div className="modal-btns">
              <button className="cancel-btn" onClick={() => setShowSellModal(false)}>
                Cancel
              </button>

              <button className="confirm-btn" onClick={handleConfirmSell}>
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
