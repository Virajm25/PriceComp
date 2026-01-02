# PriceComp - AI-Powered Price Comparison Engine

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20Hybrid-blue)
![Docker](https://img.shields.io/badge/Container-Dockerized-2496ED)

**PriceComp** is a real-time e-commerce aggregator that scrapes and compares prices across India's top retailers (**Amazon, Flipkart, Snapdeal**) simultaneously. It features an integrated **GenAI Chatbot (Llama 3)** to provide contextual product advice and technical specifications.

---

## Key Features

*   **Hybrid Scraping Engine:** 
    *   **Amazon:** Utilizes RapidAPI for stable, structured data.
    *   **Flipkart & Snapdeal:** Custom-built **Stealth Scrapers** (Cheerio + Axios) with User-Agent rotation and Proxy support to bypass anti-bot protections.
*   **High Performance:** 
    *   Implements `Promise.all()` for **concurrent data fetching** (Parallel Processing).
    *   **Server-Side Caching (`node-cache`)** reduces API latency by 90% for repeated queries.
*   **AI Shopping Assistant:** 
    *   Integrated **Groq SDK (Llama 3)** to answer user questions about the specific product being viewed.
    *   Context-aware prompting ("Is this phone 5G compatible?").
*   **Modern UI/UX:** 
    *   Fully responsive, mobile-first design.
    *   Instagram-style **Category Filters** (Phones, Laptops, etc.) with smart price-floor logic to filter out accessories/junk.
    *   Automatic **"Best Deal"** detection algorithm.
*   **Dockerized:** Fully containerized backend for consistent deployment across environments.

---

## Tech Stack

**Backend:**
*   **Runtime:** Node.js (v20) & Express.js
*   **Scraping:** Cheerio, Axios, ScraperAPI (Proxy rotation)
*   **AI:** Groq SDK (Llama 3 8B Model)
*   **Caching:** Node-cache (In-memory TTL)
*   **DevOps:** Docker & Docker Compose

**Frontend:**
*   **Core:** HTML5, CSS3 (Custom Variables & Flexbox/Grid), Vanilla JavaScript (ES6+)
*   **Design:** Mobile-Responsive & Glassmorphism effects
