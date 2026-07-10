import React, { useContext, useEffect } from "react";
import StockContext from "../context/StockContext";
import Stockitem from "./Stockitem";

export default function Stock() {
  console.log("✅ Stock component rendered");

  const context = useContext(StockContext);
  const { stocks, getAllStock } = context;

  useEffect(() => {
    console.log("🚀 Calling getAllStock...");
    getAllStock();
  }, []);

  return (
    <>
      <div className="container row my-3">
        <h2>Your Stock</h2>

        <div className="container">
          {stocks.length === 0 && "No stocks"}
        </div>

        {stocks.map((stock) => (
          <Stockitem stock={stock} key={stock.symbol} />
        ))}
      </div>
    </>
  );
}