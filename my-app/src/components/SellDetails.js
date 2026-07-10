import { useEffect, useState } from "react";
import "../css/SellDetails.css";

export default function SellDetails() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSellDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/Portfolio/transactions`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const allTx = await response.json();

        console.log("Transactions:", allTx);

        const sells = allTx.filter((t) => t.type === "SELL");

        setData(sells);
      } catch (error) {
        console.error("Error fetching sell details:", error);
      }
    };

    fetchSellDetails();
  }, []);

  const filtered = data.filter((t) =>
    `${t.name} ${t.symbol} ${t.buyerName} ${t.buyerArea}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="sell-container">
      <h2 className="sell-title">Sell Details</h2>

      <input
        type="text"
        placeholder="Search by stock, buyer, area..."
        className="sell-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-wrapper">
        <table className="sell-table">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Buyer Name</th>
              <th>Buyer Area</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t, i) => (
                <tr key={i}>
                  <td>{t.name}</td>
                  <td>{t.symbol}</td>
                  <td>{t.quantity}</td>
                  <td>${t.price}</td>
                  <td>{t.buyerName}</td>
                  <td>{t.buyerArea}</td>
                  <td>{new Date(t.date).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No sell records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}