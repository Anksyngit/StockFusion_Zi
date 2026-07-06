import React, { useState, useContext } from "react";
import StockContext from "../context/StockContext";
import "../css/AllStockCards.css";

const manualStocks = [
    { symbol: "AAPL", name: "Apple Inc.", currentPrice: 150 },
    { symbol: "MSFT", name: "Microsoft Corp.", currentPrice: 320 },
    { symbol: "GOOGL", name: "Alphabet Inc. Class A", currentPrice: 280 },
    { symbol: "GOOG", name: "Alphabet Inc. Class C", currentPrice: 281 },
    { symbol: "AMZN", name: "Amazon.com Inc.", currentPrice: 3400 },
    { symbol: "TSLA", name: "Tesla Inc.", currentPrice: 700 },
    { symbol: "META", name: "Meta Platforms Inc.", currentPrice: 250 },
    { symbol: "NFLX", name: "Netflix Inc.", currentPrice: 500 },
    { symbol: "NVDA", name: "NVIDIA Corp.", currentPrice: 600 },
    { symbol: "INTC", name: "Intel Corp.", currentPrice: 50 },
    { symbol: "AMD", name: "Advanced Micro Devices Inc.", currentPrice: 100 },
    { symbol: "ADBE", name: "Adobe Inc.", currentPrice: 550 },
    { symbol: "ORCL", name: "Oracle Corp.", currentPrice: 120 },
    { symbol: "CRM", name: "Salesforce Inc.", currentPrice: 210 },
    { symbol: "PYPL", name: "PayPal Holdings Inc.", currentPrice: 75 },
    { symbol: "PEP", name: "PepsiCo Inc.", currentPrice: 180 },
    { symbol: "KO", name: "Coca-Cola Co.", currentPrice: 60 },
    { symbol: "V", name: "Visa Inc.", currentPrice: 230 },
    { symbol: "MA", name: "Mastercard Inc.", currentPrice: 380 },
    { symbol: "DIS", name: "Walt Disney Co.", currentPrice: 90 },
];

const StockCards = () => {
    const { addStock } = useContext(StockContext);

    // ⭐ Shuffle stocks ONCE on component mount — keeps everything same except order
    const shuffledStocks = React.useMemo(() => {
        return [...manualStocks].sort(() => Math.random() - 0.5);
    }, []);

    const [quantities, setQuantities] = useState({});
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);

    // OTP states
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    const increaseQuantity = (symbol) => {
        setQuantities((prev) => ({
            ...prev,
            [symbol]: (prev[symbol] || 0) + 1,
        }));
    };

    const decreaseQuantity = (symbol) => {
        setQuantities((prev) => ({
            ...prev,
            [symbol]: Math.max((prev[symbol] || 0) - 1, 0),
        }));
    };

    const handleConfirmBuy = () => {
        if (!showOtp) {
            alert("Please click 'Show OTP' and enter the code before confirming.");
            return;
        }

        if (otpInput !== generatedOtp) {
            alert("Incorrect OTP. Try again!");
            return;
        }

        const qty = quantities[selectedStock.symbol] || 0;
        if (qty <= 0) {
            alert("Please select a valid quantity.");
            return;
        }

        addStock(
            selectedStock.symbol,
            selectedStock.name,
            qty,
            selectedStock.currentPrice
        );

        alert("Purchase Successful!");
        setShowBuyModal(false);
    };

    const openBuyModal = (stock) => {
        setSelectedStock(stock);
        setShowBuyModal(true);
    };

    const handleToggleShowOtp = () => {
        if (!showOtp) {
            if (!generatedOtp) {
                const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
                setGeneratedOtp(otpCode);
                setOtpInput("");
            }
            setShowOtp(true);
        } else {
            setShowOtp(false);
        }
    };

    return (
        <div className="container dark-theme">
            <h2 className="title">Available Stocks</h2>

            {/* BUY MODAL */}
            {showBuyModal && selectedStock && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Buy {selectedStock.name}</h2>

                        <p><strong>Symbol:</strong> {selectedStock.symbol}</p>
                        <p><strong>Price:</strong> ${selectedStock.currentPrice}</p>

                        <label>Quantity</label>
                        <p className="qty-display">{quantities[selectedStock.symbol] || 0}</p>

                        <div style={{ margin: "12px 0" }}>
                            <button
                                className="show-otp-btn"
                                onClick={handleToggleShowOtp}
                            >
                                {showOtp ? "Hide OTP" : "Click to Show OTP"}
                            </button>
                        </div>

                        {showOtp && (
                            <div className="otp-box">
                                <p>Your OTP is:</p>
                                <h2 style={{ color: "#4ade80", marginBottom: "10px" }}>
                                    {generatedOtp}
                                </h2>

                                <input
                                    type="text"
                                    maxLength="4"
                                    placeholder="Enter OTP"
                                    className="otp-input"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="modal-btns">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowBuyModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-btn"
                                onClick={handleConfirmBuy}
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⭐ NOW SHOW SHUFFLED STOCKS */}
            <div className="stock-grid">
                {shuffledStocks.map((stock, index) => (
                    <div className="stock-card" key={index}>
                        <h3>{stock.name}</h3>
                        <p><strong>Symbol:</strong> {stock.symbol}</p>
                        <p><strong>Current Price:</strong> ${stock.currentPrice}</p>

                        <div className="quantity-control">
                            <button className="qty-btn" onClick={() => decreaseQuantity(stock.symbol)}>-</button>
                            <p>{quantities[stock.symbol] || 0}</p>
                            <button className="qty-btn" onClick={() => increaseQuantity(stock.symbol)}>+</button>
                        </div>

                        <button
                            className="add-stock-btn"
                            onClick={() => openBuyModal(stock)}
                            disabled={quantities[stock.symbol] <= 0}
                        >
                            Buy
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockCards;
