import React, { useState, useCallback } from "react";
import StockContext from "./StockContext";
import axios from "axios";

const StockState = (props) => {
  const [stocks, setStocks] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");

  // =============================
  // GET ALL STOCKS
  // =============================
  const getAllStock = useCallback(async () => {
    console.log("📌 getAllStock() started");

    console.log("🌐 API URL:", process.env.REACT_APP_API_URL);
    console.log("🔑 Token:", getAuthToken());

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/Portfolio/getall`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthToken(),
          },
        }
      );

      console.log("📡 Response Status:", response.status);

      const json = await response.json();

      console.log("📦 Response Data:", json);

      setStocks(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
    }
  }, []);

  // =============================
  // Refresh Portfolio
  // =============================
  const refreshPortfolio = async () => {
    await getAllStock();
  };

  // =============================
  // BUY STOCK
  // =============================
  const addStock = async (symbol, name, quantity, price) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/Portfolio/CreateS`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getAuthToken(),
          },
          body: JSON.stringify({
            symbol,
            name,
            quantity,
            price,
          }),
        }
      );

      const stock = await response.json();

      console.log("✅ Buy Response:", stock);

      await refreshPortfolio();
    } catch (error) {
      console.error("❌ Buy Error:", error);
    }
  };

  // =============================
  // SELL STOCK
  // =============================
  const sellStock = async (
    symbol,
    quantity,
    price,
    buyerName,
    buyerArea
  ) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/Portfolio/sell`,
        {
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
        }
      );

      const data = await response.json();

      console.log("💰 Sell Response:", data);

      await refreshPortfolio();

      return data;
    } catch (error) {
      console.error("❌ Sell Error:", error);
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
      console.error("Price Error:", error);
      return "N/A";
    }
  };

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