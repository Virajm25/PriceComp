const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const axios = require('axios');

//Import the custom services we created
const { fetchFlipkartData, fetchSnapdealData, fetchWebContext } = require('./services/scraper');
const { generateAIResponse } = require('./services/aiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//Initialize Cache (TTL: 1 hour)
const searchCache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

//Amazon API (RapidAPI) ---
async function fetchAmazonData(query) {
    if (!process.env.RAPIDAPI_KEY) return [];
    try {
        const response = await axios.get('https://real-time-amazon-data.p.rapidapi.com/search', {
            params: { query: query, page: '1', country: 'IN' },
            headers: { 
                'x-rapidapi-key': process.env.RAPIDAPI_KEY, 
                'x-rapidapi-host': process.env.RAPIDAPI_HOST 
            }
        });
        
        const products = response.data.data.products || [];
        return products.map(item => ({
            store: 'Amazon',
            name: item.product_title,
            price: item.product_price ? parseFloat(item.product_price.replace(/[₹,]/g, '')) : 0,
            inStock: true,
            rating: item.product_star_rating || 0,
            link: item.product_url
        })).filter(i => i.price > 0);
    } catch (error) {
        console.error('[Amazon API] Error:', error.message);
        return [];
    }
}

// 1. Search Endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';

    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    // Check Cache First
    if (searchCache.has(query)) {
        console.log(`[Cache] Hit for "${query}"`);
        return res.json(searchCache.get(query));
    }

    console.log(`[Search] New request for "${query}"`);

    try {
        // Run all data fetchers in parallel
        const [amazonResults, flipkartResults, snapdealResults] = await Promise.all([
            fetchAmazonData(query),
            fetchFlipkartData(query),
            fetchSnapdealData(query)
        ]);

        // Combine and sort by price (Low to High)
        const allResults = [...amazonResults, ...flipkartResults, ...snapdealResults]
            .sort((a, b) => a.price - b.price);
        
        const responseData = { results: allResults, query };
        
        // Save to cache
        searchCache.set(query, responseData);
        
        res.json(responseData);

    } catch (error) {
        console.error('[Server] Search Error:', error.message);
        res.status(500).json({ results: [], error: 'Internal Server Error' });
    }
});

// 2. Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, product } = req.body;

    if (!product) return res.status(400).json({ response: "No product selected." });

    try {
        // Retrieve product context from cache to give AI "eyes" on the price
        const cachedData = searchCache.get(product.toLowerCase());
        let priceContext = "Market data not available (User hasn't searched yet).";
        
        if (cachedData && cachedData.results.length > 0) {
            // Take top 5 cheapest results for context
            const topResults = cachedData.results.slice(0, 5);
            priceContext = topResults.map(i => `- ${i.store}: ₹${i.price} (${i.name})`).join('\n');
        }

        // Get general web info (DuckDuckGo)
        const webContext = await fetchWebContext(`${product} ${message}`);

        // Ask AI
        const aiResponse = await generateAIResponse(message, product, priceContext, webContext);
        
        res.json({ response: aiResponse, product });

    } catch (error) {
        console.error('[Server] Chat Error:', error.message);
        res.status(500).json({ response: "Internal server error." });
    }
});

// Placeholder for context endpoint (kept for frontend compatibility)
app.post('/api/chat/context', (req, res) => res.json({ success: true }));

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});