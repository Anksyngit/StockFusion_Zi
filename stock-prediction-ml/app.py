from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
from alpha_vantage.timeseries import TimeSeries
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# API Key
API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

if not API_KEY:
    raise Exception("ALPHA_VANTAGE_API_KEY not found in .env")

# Load trained model
model = load_model("lstm_model.h5")


def get_next_trading_day():
    """Return the next trading day (excluding weekends)."""
    next_day = datetime.today() + timedelta(days=1)

    while next_day.weekday() >= 5:
        next_day += timedelta(days=1)

    return next_day.strftime("%Y-%m-%d")


def get_stock_data(symbol):
    ts = TimeSeries(key=API_KEY, output_format="pandas")
    data, meta_data = ts.get_daily(symbol=symbol.upper(), outputsize="full")

    if data.empty:
        raise Exception("No stock data found.")

    return data[['4. close']].iloc[::-1]


def predict_stock_price(symbol):
    df = get_stock_data(symbol)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df)

    last_50_days = scaled_data[-50:]

    X_test = np.reshape(last_50_days, (1, 50, 1))

    prediction = model.predict(X_test, verbose=0)

    prediction = scaler.inverse_transform(prediction)

    return float(prediction[0][0]), get_next_trading_day()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "StockFusion ML API is running 🚀"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is missing."
        }), 400

    symbol = data.get("symbol")

    if not symbol:
        return jsonify({
            "error": "Stock symbol is required."
        }), 400

    try:
        predicted_price, predicted_date = predict_stock_price(symbol)

        return jsonify({
            "symbol": symbol.upper(),
            "predicted_price": round(predicted_price, 2),
            "predicted_date": predicted_date
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)