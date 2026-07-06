// ✅ Add this route at the end of backend/routes/stock.js

import express from "express";
const router = express.Router();

// Example static data (you can later fetch real data)
const companyData = {
  Reliance: { currentPrice: 2400, high52: 2800, low52: 2000, marketCap: "15T", sector: "Energy" },
  TCS: { currentPrice: 3550, high52: 3800, low52: 3100, marketCap: "13T", sector: "IT Services" },
  Infosys: { currentPrice: 1550, high52: 1700, low52: 1300, marketCap: "6T", sector: "IT Services" },
  "HDFC Bank": { currentPrice: 1450, high52: 1700, low52: 1200, marketCap: "9T", sector: "Banking" },
};

router.get("/company/:name", (req, res) => {
  const { name } = req.params;
  const data = companyData[name];
  if (!data) return res.status(404).json({ message: "Company not found" });
  res.json(data);
});

export default router;
