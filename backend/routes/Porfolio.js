const express = require("express");
const Portfolio = require("../models/Portfolio");
const fetchuser = require("../midleware/fetchuser");
const axios = require("axios");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const router = express.Router();

// ------------------------------------------------------
// GET ALL USER STOCKS
// Only stocks that still have quantity > 0
// ------------------------------------------------------
router.get("/getall", fetchuser, async (req, res) => {
  try {
    const stocks = await Portfolio.find({
      user: req.user.id,
      quantity: { $gt: 0 },
    });

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
});

// ------------------------------------------------------
// BUY STOCK
// ------------------------------------------------------
router.post("/CreateS", fetchuser, async (req, res) => {
  try {
    const { symbol, quantity, price, name } = req.body;

    if (!price)
      return res.status(400).json({ error: "Price is required" });

    let stock = await Portfolio.findOne({
      user: req.user.id,
      symbol,
    });

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

    const newStock = new Portfolio({
      user: req.user.id,
      symbol,
      name,
      quantity,
      purchasePrice: price,
      transactions: [
        {
          type: "BUY",
          quantity,
          price,
          date: new Date(),
        },
      ],
    });

    await newStock.save();

    res.json(newStock);
  } catch (error) {
    res.status(500).json({ error: "Failed to buy stock" });
  }
});

// ------------------------------------------------------
// SELL STOCK
// ------------------------------------------------------
router.post("/sell", fetchuser, async (req, res) => {
  try {
    const { symbol, quantity, price, buyerName, buyerArea } = req.body;

    const stock = await Portfolio.findOne({
      user: req.user.id,
      symbol,
    });

    if (!stock || stock.quantity < quantity) {
      return res
        .status(400)
        .json({ error: "Not enough stocks to sell" });
    }

    stock.quantity -= quantity;

    stock.transactions.push({
      type: "SELL",
      quantity,
      price,
      date: new Date(),
      buyerName,
      buyerArea,
    });

    if (stock.quantity < 0) {
      stock.quantity = 0;
    }

    // IMPORTANT:
    // DO NOT DELETE THE DOCUMENT
    // We keep it so sell history remains forever.

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
    const portfolio = await Portfolio.find({
      user: req.user.id,
    });

    let transactions = [];

    portfolio.forEach((stock) => {
      stock.transactions.forEach((txn) => {
        transactions.push({
          symbol: stock.symbol,
          name: stock.name,
          type: txn.type,
          quantity: txn.quantity,
          price: txn.price,
          date: txn.date,
          buyerName: txn.buyerName || "N/A",
          buyerArea: txn.buyerArea || "N/A",
        });
      });
    });

    transactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch transactions",
    });
  }
});

// ------------------------------------------------------
// EXPORT CSV / PDF
// ------------------------------------------------------
router.get("/export/:format", fetchuser, async (req, res) => {
  try {
    const stocks = await Portfolio.find({
      user: req.user.id,
    });

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

    if (req.params.format === "pdf") {
      const doc = new PDFDocument();

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.pdf"
      );

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(18)
        .text("Transaction History", {
          align: "center",
        });

      transactions.forEach((txn) => {
        doc.text(
          `${txn.date} - ${txn.type} ${txn.quantity} ${txn.symbol} @ $${txn.price} | Buyer: ${txn.buyerName} (${txn.buyerArea})`
        );
      });

      doc.end();

      return;
    }

    res.status(400).json({
      error: "Invalid format",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to export",
    });
  }
});

// ------------------------------------------------------
// MARKET NEWS
// ------------------------------------------------------
router.get("/market-news", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=stock+market&language=en&pageSize=40&apiKey=${process.env.API_KEY}`
    );

    res.json(response.data.articles || []);
  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

module.exports = router;