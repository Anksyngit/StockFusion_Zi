// my-app/src/components/CompanyInfo.jsx
import React, { useState } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import {
  FaBuilding,
  FaUserTie,
  FaChartLine,
  FaMoneyBillWave,
  FaChevronDown,
} from "react-icons/fa";
import "./CompanyInfo.css";

const companies = [
  {
    id: 1,
    name: "Apple Inc.",
    symbol: "AAPL",
    sector: "Technology",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California, USA",
    price: "$221.45",
    marketCap: "3.6T",
    peRatio: "32.1",
    description:
      "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, and accessories worldwide.",
    chartData: [
      { day: "Mon", value: 220 },
      { day: "Tue", value: 223 },
      { day: "Wed", value: 218 },
      { day: "Thu", value: 225 },
      { day: "Fri", value: 221 },
    ],
  },
  {
    id: 2,
    name: "Microsoft Corporation",
    symbol: "MSFT",
    sector: "Technology",
    ceo: "Satya Nadella",
    headquarters: "Redmond, Washington, USA",
    price: "$417.83",
    marketCap: "3.3T",
    peRatio: "36.5",
    description:
      "Microsoft develops and supports software, services, devices, and solutions worldwide, including Azure and Office 365.",
    chartData: [
      { day: "Mon", value: 412 },
      { day: "Tue", value: 416 },
      { day: "Wed", value: 420 },
      { day: "Thu", value: 418 },
      { day: "Fri", value: 417 },
    ],
  },
  {
    id: 3,
    name: "Tesla, Inc.",
    symbol: "TSLA",
    sector: "Automotive",
    ceo: "Elon Musk",
    headquarters: "Austin, Texas, USA",
    price: "$267.20",
    marketCap: "870B",
    peRatio: "72.3",
    description:
      "Tesla designs and manufactures electric vehicles, energy storage systems, and solar energy products.",
    chartData: [
      { day: "Mon", value: 265 },
      { day: "Tue", value: 268 },
      { day: "Wed", value: 266 },
      { day: "Thu", value: 270 },
      { day: "Fri", value: 267 },
    ],
  },
  {
    id: 4,
    name: "Reliance Industries Limited",
    symbol: "RELIANCE.NS",
    sector: "Conglomerate",
    ceo: "Mukesh D. Ambani",
    headquarters: "Mumbai, Maharashtra, India",
    price: "₹2,485.50",
    marketCap: "16.8T INR",
    peRatio: "25.2",
    description:
      "Reliance Industries operates in energy, petrochemicals, textiles, natural resources, retail, and telecommunications.",
    chartData: [
      { day: "Mon", value: 2470 },
      { day: "Tue", value: 2490 },
      { day: "Wed", value: 2485 },
      { day: "Thu", value: 2505 },
      { day: "Fri", value: 2488 },
    ],
  },
  {
    id: 5,
    name: "Infosys Limited",
    symbol: "INFY.NS",
    sector: "Information Technology",
    ceo: "Salil Parekh",
    headquarters: "Bengaluru, Karnataka, India",
    price: "₹1,594.30",
    marketCap: "6.6T INR",
    peRatio: "27.1",
    description:
      "Infosys provides consulting, technology, outsourcing, and next-generation digital services to enterprises worldwide.",
    chartData: [
      { day: "Mon", value: 1580 },
      { day: "Tue", value: 1590 },
      { day: "Wed", value: 1600 },
      { day: "Thu", value: 1595 },
      { day: "Fri", value: 1594 },
    ],
  },
  {
    id: 6,
    name: "Tata Consultancy Services",
    symbol: "TCS.NS",
    sector: "Information Technology",
    ceo: "K. Krithivasan",
    headquarters: "Mumbai, Maharashtra, India",
    price: "₹3,850.40",
    marketCap: "14.1T INR",
    peRatio: "31.6",
    description:
      "TCS is a global leader in IT services, consulting, and business solutions with innovation at the core of its operations.",
    chartData: [
      { day: "Mon", value: 3820 },
      { day: "Tue", value: 3835 },
      { day: "Wed", value: 3845 },
      { day: "Thu", value: 3860 },
      { day: "Fri", value: 3850 },
    ],
  },
  {
    id: 7,
    name: "HDFC Bank Limited",
    symbol: "HDFCBANK.NS",
    sector: "Banking & Finance",
    ceo: "Sashidhar Jagdishan",
    headquarters: "Mumbai, Maharashtra, India",
    price: "₹1,592.10",
    marketCap: "12.2T INR",
    peRatio: "21.8",
    description:
      "HDFC Bank provides banking and financial services including retail banking, wholesale banking, and treasury operations.",
    chartData: [
      { day: "Mon", value: 1585 },
      { day: "Tue", value: 1590 },
      { day: "Wed", value: 1592 },
      { day: "Thu", value: 1598 },
      { day: "Fri", value: 1592 },
    ],
  },
  {
    id: 9,
    name: "Amazon.com, Inc.",
    symbol: "AMZN",
    sector: "E-Commerce & Cloud",
    ceo: "Andy Jassy",
    headquarters: "Seattle, Washington, USA",
    price: "$164.27",
    marketCap: "1.7T",
    peRatio: "52.4",
    description:
      "Amazon operates the world’s largest e-commerce marketplace and leading cloud platform AWS.",
    chartData: [
      { day: "Mon", value: 162 },
      { day: "Tue", value: 165 },
      { day: "Wed", value: 167 },
      { day: "Thu", value: 163 },
      { day: "Fri", value: 164 },
    ],
  },
  {
    id: 10,
    name: "Alphabet Inc. (Google)",
    symbol: "GOOGL",
    sector: "Technology & AI",
    ceo: "Sundar Pichai",
    headquarters: "Mountain View, California, USA",
    price: "$153.12",
    marketCap: "1.9T",
    peRatio: "29.7",
    description:
      "Alphabet operates Google Search, YouTube, Android, and leads major AI and cloud innovations.",
    chartData: [
      { day: "Mon", value: 150 },
      { day: "Tue", value: 152 },
      { day: "Wed", value: 155 },
      { day: "Thu", value: 154 },
      { day: "Fri", value: 153 },
    ],
  },
  {
    id: 11,
    name: "Meta Platforms, Inc.",
    symbol: "META",
    sector: "Social Media & VR",
    ceo: "Mark Zuckerberg",
    headquarters: "Menlo Park, California, USA",
    price: "$489.10",
    marketCap: "1.2T",
    peRatio: "34.4",
    description:
      "Meta owns Facebook, Instagram, WhatsApp and develops VR/AR devices under the Meta Quest brand.",
    chartData: [
      { day: "Mon", value: 480 },
      { day: "Tue", value: 482 },
      { day: "Wed", value: 490 },
      { day: "Thu", value: 487 },
      { day: "Fri", value: 489 },
    ],
  },
  {
    id: 12,
    name: "Netflix, Inc.",
    symbol: "NFLX",
    sector: "Entertainment & Streaming",
    ceo: "Ted Sarandos",
    headquarters: "Los Gatos, California, USA",
    price: "$593.40",
    marketCap: "262B",
    peRatio: "49.8",
    description:
      "Netflix is the global leader in streaming entertainment with over 260M subscribers worldwide.",
    chartData: [
      { day: "Mon", value: 585 },
      { day: "Tue", value: 590 },
      { day: "Wed", value: 600 },
      { day: "Thu", value: 592 },
      { day: "Fri", value: 593 },
    ],
  },
  {
    id: 13,
    name: "NVIDIA Corporation",
    symbol: "NVDA",
    sector: "Semiconductors & AI",
    ceo: "Jensen Huang",
    headquarters: "Santa Clara, California, USA",
    price: "$922.14",
    marketCap: "2.2T",
    peRatio: "74.3",
    description:
      "NVIDIA designs GPUs and is the global leader in AI hardware and accelerated computing.",
    chartData: [
      { day: "Mon", value: 900 },
      { day: "Tue", value: 915 },
      { day: "Wed", value: 930 },
      { day: "Thu", value: 925 },
      { day: "Fri", value: 922 },
    ],
  },
  {
    id: 14,
    name: "Broadcom Inc.",
    symbol: "AVGO",
    sector: "Semiconductors",
    ceo: "Hock Tan",
    headquarters: "San Jose, California, USA",
    price: "$1348.60",
    marketCap: "625B",
    peRatio: "55.1",
    description:
      "Broadcom develops semiconductors and infrastructure software used in networking and data centers.",
    chartData: [
      { day: "Mon", value: 1300 },
      { day: "Tue", value: 1320 },
      { day: "Wed", value: 1355 },
      { day: "Thu", value: 1340 },
      { day: "Fri", value: 1348 },
    ],
  },
  {
    id: 15,
    name: "Walmart Inc.",
    symbol: "WMT",
    sector: "Retail",
    ceo: "Doug McMillon",
    headquarters: "Bentonville, Arkansas, USA",
    price: "$59.72",
    marketCap: "475B",
    peRatio: "28.9",
    description:
      "Walmart is the world's largest retailer, operating supermarkets, hypermarkets, and e-commerce platforms.",
    chartData: [
      { day: "Mon", value: 58 },
      { day: "Tue", value: 59 },
      { day: "Wed", value: 60 },
      { day: "Thu", value: 59.5 },
      { day: "Fri", value: 59.7 },
    ],
  },
  {
    id: 16,
    name: "HCL Technologies",
    symbol: "HCLTECH.NS",
    sector: "Information Technology",
    ceo: "C. Vijayakumar",
    headquarters: "Noida, Uttar Pradesh, India",
    price: "₹1715.20",
    marketCap: "4.7T INR",
    peRatio: "25.4",
    description:
      "HCL Technologies provides software solutions, cloud services, and digital transformation expertise.",
    chartData: [
      { day: "Mon", value: 1700 },
      { day: "Tue", value: 1708 },
      { day: "Wed", value: 1712 },
      { day: "Thu", value: 1718 },
      { day: "Fri", value: 1715 },
    ],
  },
  {
    id: 8,
    name: "Cognizant Technology Solutions",
    symbol: "CTSH",
    sector: "Information Technology",
    ceo: "Ravi Kumar S.",
    headquarters: "Teaneck, New Jersey, USA",
    price: "$75.60",
    marketCap: "37.5B",
    peRatio: "18.4",
    description:
      "Cognizant provides IT consulting and business process outsourcing services, helping enterprises modernize technology.",
    chartData: [
      { day: "Mon", value: 74 },
      { day: "Tue", value: 76 },
      { day: "Wed", value: 75 },
      { day: "Thu", value: 76.5 },
      { day: "Fri", value: 75.6 },
    ],
  },
];

export default function CompanyInfo() {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="company-container">
      <h2 className="company-title">Company Insights Dashboard</h2>
      <div className="company-list">
        {companies.map((c) => (
          <div
            key={c.id}
            className={`company-card ${expanded === c.id ? "expanded" : ""}`}
            onClick={() => toggleExpand(c.id)}
          >
            <div className="company-header">
              <div className="header-row">
                <h3>{c.name}</h3>
                <FaChevronDown
                  className={`arrow ${expanded === c.id ? "rotate" : ""}`}
                />
              </div>
              <p className="symbol">{c.symbol}</p>
              <p className="sector">{c.sector}</p>
            </div>

            {expanded === c.id && (
              <div className="company-details">
                <p className="description">{c.description}</p>

                <div className="stats-grid">
                  <div className="stat-card">
                    <FaMoneyBillWave className="icon" />
                    <div>
                      <p className="label">Stock Price</p>
                      <p className="value">{c.price}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <FaChartLine className="icon" />
                    <div>
                      <p className="label">Market Cap</p>
                      <p className="value">{c.marketCap}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <FaUserTie className="icon" />
                    <div>
                      <p className="label">CEO</p>
                      <p className="value">{c.ceo}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <FaBuilding className="icon" />
                    <div>
                      <p className="label">HQ</p>
                      <p className="value">{c.headquarters}</p>
                    </div>
                  </div>
                </div>

                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={c.chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0077b6"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
