import React, { useState, useEffect, useContext } from "react";
import StockContext from "../context/StockContext";
import axios from "axios";
import "../css/Stockitem.css";
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

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);

  const [buyerName, setBuyerName] = useState("");
  const [buyerArea, setBuyerArea] = useState("");

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  useEffect(() => {
    const getCurrentPrice = async () => {
      try {
        const price = await fetchCurrentPrice(stock.symbol);

        const numericPrice = Number(price || 150);

        setCurrentPrice(numericPrice);

        setTotalValue(stock.quantity * numericPrice);

        setProfitLoss(
          (numericPrice - stock.purchasePrice) * stock.quantity
        );
      } catch (error) {
        console.error("Error fetching stock price:", error);

        setCurrentPrice(150);
        setTotalValue(stock.quantity * 150);
        setProfitLoss((150 - stock.purchasePrice) * stock.quantity);
      }
    };

    const getHistoricalData = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.symbol}&apikey=${API_KEY}`
        );

        // AlphaVantage daily limit reached
        if (response.data.Note) {
          console.log("AlphaVantage limit reached. Using fallback chart.");
          throw new Error("Rate limit");
        }

        const timeSeries = response.data["Time Series (Daily)"];

        if (!timeSeries) {
          console.log(
            `No historical data available for ${stock.symbol}.`
          );
          throw new Error("No historical data");
        }

        const historicalData = Object.entries(timeSeries)
          .slice(0, 7)
          .map(([date, values]) => ({
            date,
            price: parseFloat(values["4. close"]),
          }))
          .reverse();

        setChartData(historicalData);
      } catch (error) {
        console.log(`Using fallback chart for ${stock.symbol}`);

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
  }, [stock.symbol, stock.quantity, stock.purchasePrice, fetchCurrentPrice]);

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
      console.error("Sell Error:", error);
      alert("Failed to sell stock.");
    }
  };

  return (
    <div className="stock-card">
      <h3 className="stock-name">
        {stock.name} ({stock.symbol})
      </h3>

      <div className="stock-info">
        <p>
          <strong>Quantity:</strong> {stock.quantity}
        </p>

        <p>
          <strong>Purchase Price:</strong> $
          {Number(stock.purchasePrice).toFixed(2)}
        </p>

        <p>
          <strong>Current Price:</strong>{" "}
          {currentPrice !== null
            ? `$${currentPrice.toFixed(2)}`
            : "Loading..."}
        </p>

        <p>
          <strong>Total Value:</strong>{" "}
          {totalValue !== null
            ? `$${totalValue.toFixed(2)}`
            : "Calculating..."}
        </p>

        <p
          className={`profit-loss ${
            profitLoss >= 0 ? "profit" : "loss"
          }`}
        >
          <strong>Profit/Loss:</strong> $
          {profitLoss.toFixed(2)}
        </p>
      </div>

      <div className="sell-section">
        <h5>Sell Stock</h5>

        <input
          className="sell-input"
          type="number"
          min="1"
          max={stock.quantity}
          value={sellQuantity}
          onChange={(e) =>
            setSellQuantity(Number(e.target.value))
          }
        />

        <button
          className="sell-button"
          onClick={() => {
            setShowSellModal(true);

            const otp = Math.floor(
              1000 + Math.random() * 9000
            ).toString();

            setGeneratedOtp(otp);
            setOtpInput("");
          }}
        >
          Sell
        </button>
      </div>

      <div className="chart-container">
        <h5>7-Day Price Trend</h5>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Sell {stock.name}</h2>

            <p>
              <strong>Quantity:</strong> {sellQuantity}
            </p>

            <p>
              <strong>Price:</strong> ${currentPrice}
            </p>

            <label>Buyer Name</label>

            <input
              type="text"
              value={buyerName}
              onChange={(e) =>
                setBuyerName(e.target.value)
              }
            />

            <label>Buyer Area</label>

            <input
              type="text"
              value={buyerArea}
              onChange={(e) =>
                setBuyerArea(e.target.value)
              }
            />

            <div className="otp-box">
              <p>Your OTP is:</p>

              <h2 style={{ color: "#4ade80" }}>
                {generatedOtp}
              </h2>

              <input
                className="otp-input"
                type="text"
                maxLength="4"
                placeholder="Enter OTP"
                value={otpInput}
                onChange={(e) =>
                  setOtpInput(e.target.value)
                }
              />
            </div>

            <div className="modal-btns">
              <button
                className="cancel-btn"
                onClick={() => setShowSellModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={handleConfirmSell}
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}