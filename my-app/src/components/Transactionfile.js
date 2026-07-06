import React, { useEffect, useState } from "react";
import "../css/Transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch("http://localhost:3000/Portfolio/transactions", {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data); // default = all transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Extract unique months from transactions
  const getUniqueMonths = () => {
    const months = transactions.map((txn) => {
      const d = new Date(txn.date);
      const month = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      return `${month} ${year}`;
    });

    return ["All", ...new Set(months)];
  };

  // Apply filter
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);

    if (month === "All") {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((txn) => {
      const d = new Date(txn.date);
      const monthName = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      return `${monthName} ${year}` === month;
    });

    setFilteredTransactions(filtered);
  };

  const downloadFile = async (format) => {
    try {
      const response = await fetch(`http://localhost:3000/Portfolio/export/${format}`, {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error(`Error downloading file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <div className="transactions-container">
      <h2>Transaction History</h2>

      {/* Month Filter Dropdown */}
      <div className="month-filter">
        <label>Filter by Month:</label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {getUniqueMonths().map((month, idx) => (
            <option key={idx} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Stock</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn, index) => (
              <tr key={index}>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td>{txn.symbol}</td>
                <td className={txn.type === "BUY" ? "buy" : "sell"}>
                  {txn.type}
                </td>
                <td>{txn.quantity}</td>
                <td>${txn.price.toFixed(2)}</td>
                <td>${(txn.quantity * txn.price).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found for this month</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="download-buttons">
        <button className="download-btn" onClick={() => downloadFile("csv")}>
          Download CSV
        </button>
        <button className="download-btn" onClick={() => downloadFile("pdf")}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
