const express = require("express");
const Portfolio = require("../models/Portfolio");
const fetchuser = require("../midleware/fetchuser");
const axios = require("axios");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const router = express.Router();
const API_KEY = process.env.API_KEY;

// ------------------------------------------------------
// GET ALL USER STOCKS
// ------------------------------------------------------
router.get("/getall", fetchuser, async (req, res) => {
  try {
    const stocks = await Portfolio.find({ user: req.user.id });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// ------------------------------------------------------
// BUY STOCK (NO buyerName / buyerArea NEEDED)
// ------------------------------------------------------
router.post("/CreateS", fetchuser, async (req, res) => {
  try {
    const { symbol, quantity, price, name } = req.body;

    if (!price) return res.status(400).json({ error: "Price is required" });

    let stock = await Portfolio.findOne({ user: req.user.id, symbol });

    // If user already owns this stock → update quantity + avg price
    if (stock) {
      const newQuantity = stock.quantity + quantity;
      const newAvgPrice =
        (stock.purchasePrice * stock.quantity + price * quantity) /
        newQuantity;

      stock.quantity = newQuantity;
      stock.purchasePrice = newAvgPrice;

      stock.transactions.push({
        type: "BUY",
        quantity,
        price,
        date: new Date(),
      });

      await stock.save();
      return res.json(stock);
    }

    // First time buying this stock
    const newStock = new Portfolio({
      user: req.user.id,
      symbol,
      name,
      quantity,
      purchasePrice: price,
      transactions: [{ type: "BUY", quantity, price, date: new Date() }],
    });

    await newStock.save();
    res.json(newStock);
  } catch (error) {
    res.status(500).json({ error: "Failed to buy stock" });
  }
});

// ------------------------------------------------------
// SELL STOCK (with buyerName + buyerArea required)
// ------------------------------------------------------
router.post("/sell", fetchuser, async (req, res) => {
  try {
    const { symbol, quantity, price, buyerName, buyerArea } = req.body;

    const stock = await Portfolio.findOne({
      user: req.user.id,
      symbol,
    });

    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stocks to sell" });
    }

    // Reduce quantity
    stock.quantity -= quantity;

    // Add SELL transaction with buyer details
    stock.transactions.push({
      type: "SELL",
      quantity,
      price,
      date: new Date(),
      buyerName,
      buyerArea,
    });

    if (stock.quantity === 0) {
      await Portfolio.findByIdAndDelete(stock._id);
      return res.json({ message: "Stock fully sold and removed" });
    }

    await stock.save();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: "Failed to sell stock" });
  }
});

// ------------------------------------------------------
// TRANSACTIONS
// ------------------------------------------------------
router.get("/transactions", fetchuser, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id });

    let transactions = [];

    portfolio.forEach((s) => {
      s.transactions.forEach((t) => {
        transactions.push({
          symbol: s.symbol,
          name: s.name,
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          date: t.date,
          buyerName: t.buyerName || "N/A",
          buyerArea: t.buyerArea || "N/A",
        });
      });
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ------------------------------------------------------
// EXPORT (CSV / PDF)
// ------------------------------------------------------
router.get("/export/:format", fetchuser, async (req, res) => {
  try {
    const stocks = await Portfolio.find({ user: req.user.id });

    const transactions = stocks.flatMap((stock) =>
      stock.transactions.map((txn) => ({
        symbol: stock.symbol,
        name: stock.name,
        type: txn.type,
        quantity: txn.quantity,
        price: txn.price,
        date: txn.date,
        buyerName: txn.buyerName,
        buyerArea: txn.buyerArea,
      }))
    );

    // CSV EXPORT
    if (req.params.format === "csv") {
      const parser = new Parser({
        fields: [
          "symbol",
          "name",
          "type",
          "quantity",
          "price",
          "date",
          "buyerName",
          "buyerArea",
        ],
      });

      const csv = parser.parse(transactions);
      res.header("Content-Type", "text/csv");
      res.attachment("transactions.csv");
      return res.send(csv);
    }

    // PDF EXPORT
    if (req.params.format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);
      doc.fontSize(18).text("Transaction History", { align: "center" });

      transactions.forEach((txn) => {
        doc
          .fontSize(12)
          .text(
            `${txn.date} - ${txn.type} ${txn.quantity} ${txn.symbol} @ $${txn.price} | Buyer: ${txn.buyerName} (${txn.buyerArea})`
          );
      });

      doc.end();
      return;
    }

    res.status(400).json({ error: "Invalid format" });
  } catch (error) {
    res.status(500).json({ error: "Failed to export" });
  }
});

// ------------------------------------------------------
// MARKET NEWS
// ------------------------------------------------------
router.get("/market-news", async (req, res) => {
  try {
    const NEWS_API_KEY = "2033a9ba9e864c6db2ceeacc04b4068c";

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=stock+market&language=en&pageSize=40&apiKey=${NEWS_API_KEY}`
    );

    if (!response.data || !response.data.articles) {
      return res.json([]);
    }

    res.json(response.data.articles);
  } catch (error) {
    console.error("Market news error:", error);
    res.json([]);
  }
});

module.exports = router;
