const Groq = require('groq-sdk');
require('dotenv').config();

let groqClient = null;

if (process.env.GROQ_API_KEY) {
    try {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
        console.log('[System] Groq AI initialized successfully.');
    } catch (error) {
        console.error('[System] Failed to initialize Groq:', error.message);
    }
} else {
    console.warn('[System] Warning: GROQ_API_KEY is missing in .env');
}

/**
 * Generates a chat response using Llama via Groq
 * @param {string} userMessage - The user's question
 * @param {string} productQuery - The product name being discussed
 * @param {string} priceContext - Formatted string of available prices
 * @param {string} webContext - Information scraped from the web
 */
async function generateAIResponse(userMessage, productQuery, priceContext, webContext) {
    if (!groqClient) {
        return "AI features are currently offline (API Key missing).";
    }

    const systemPrompt = `
    You are a helpful Shopping Assistant.
    The user is interested in: "${productQuery}".

    CURRENT MARKET DATA:
    ${priceContext || "No live price data available."}

    WEB INFORMATION:
    ${webContext}

    INSTRUCTIONS:
    1. Answer the user's question based on the data above.
    2. If asked for price, quote the specific stores from the Market Data.
    3. If the price data looks empty, suggest checking the links manually.
    4. Keep your answer concise (2-3 sentences max).
    5. Do not explicitly mention "I searched the web" or "I found in the context". Just answer naturally.
    `;

    try {
        const chat = await groqClient.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,  
            max_tokens: 300
        });
        
        return chat.choices[0]?.message?.content || "I couldn't generate a response.";

    } catch (error) {
        console.error('[AI Service] API Error:', error.message);
        return "I'm having trouble processing that request right now.";
    }
}

module.exports = { generateAIResponse };