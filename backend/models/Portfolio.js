const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number, required: true },

  transactions: [
    {
      type: { type: String, enum: ["BUY", "SELL"], required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now },

      // ⭐ Added fields to store buyer details (Fix #1)
      buyerName: { type: String, default: null },
      buyerArea: { type: String, default: null },
    },
  ],
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
