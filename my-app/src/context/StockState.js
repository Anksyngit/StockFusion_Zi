import React, { useState } from "react";
import StockContext from "./StockContext";
import axios from "axios";

const StockState = (props) => {
  const [stocks, setStocks] = useState([]);

  // Get token from localStorage
  const getAuthToken = () => localStorage.getItem("token");

  // =============================
  // GET ALL STOCKS
  // =============================
  const getAllStock = async () => {
    try {
      const response = await fetch("http://localhost:3000/Portfolio/getall", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthToken(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const json = await response.json();
      setStocks(json);
    } catch (error) {
      console.error("Fetch error:", error.message);
    }
  };

  // Refresh portfolio after change
  const refreshPortfolio = async () => {
    await getAllStock();
  };

  // =============================
  // ADD STOCK (BUY)
  // =============================
  const addStock = async (symbol, name, quantity, price) => {
    try {
      const response = await fetch("http://localhost:3000/Portfolio/CreateS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthToken(),
        },
        body: JSON.stringify({ symbol, name, quantity, price }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const stock = await response.json();
      setStocks([...stocks, stock]);
      refreshPortfolio();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  // =============================
  // SELL STOCK (UPDATED)
  // =============================
  const sellStock = async (symbol, quantity, price, buyerName, buyerArea) => {
    try {
      const response = await fetch("http://localhost:3000/Portfolio/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthToken(),
        },
        body: JSON.stringify({
          symbol,
          quantity,
          price,
          buyerName,
          buyerArea,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Sell failed:", data);
        return false;
      }

      // ⭐ Refresh user's portfolio so Sell Details updates immediately
      await refreshPortfolio();

      return data;  // return actual backend data instead of true
    } catch (error) {
      console.error("Error selling stock:", error);
      return false;
    }
  };

  // =============================
  // FETCH CURRENT PRICE
  // =============================
  const fetchCurrentPrice = async (symbol) => {
    const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const price = data?.["Global Quote"]?.["05. price"];
      return price ? parseFloat(price).toFixed(2) : 150;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return "N/A";
    }
  };

  // =============================
  // RETURN PROVIDER
  // =============================
  return (
    <StockContext.Provider
      value={{
        stocks,
        setStocks,
        getAllStock,
        refreshPortfolio,
        addStock,
        sellStock,
        fetchCurrentPrice,
      }}
    >
      {props.children}
    </StockContext.Provider>
  );
};

export default StockState;
