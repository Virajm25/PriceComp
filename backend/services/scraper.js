const axios = require('axios');
const cheerio = require('cheerio');
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Upgrade-Insecure-Requests': '1'
};

async function fetchFlipkartData(query) {
    try {
        const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&marketplace=FLIPKART`;
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        const results = [];
        $('div._1AtVbE, div.cPHDOP').each((i, el) => {
            const name = $(el).find('div._4rR01T, div.KzDlHZ, a.s1Q9rs').first().text().trim();
            const priceText = $(el).find('div._30jeq3, div.Nx9bqj').first().text().trim();
            let link = $(el).find('a._1fQZEK, a.s1Q9rs, a.CGtC98').first().attr('href');

            if (name && priceText) {
                const price = parseFloat(priceText.replace(/[₹,]/g, ''));
                if (link && !link.startsWith('http')) {
                    link = `https://www.flipkart.com${link}`;
                }

                results.push({ 
                    store: 'Flipkart', 
                    name, 
                    price, 
                    inStock: true, 
                    link 
                });
            }
        });

        return results.filter(i => i.price > 0).slice(0, 15);
    } catch (error) { 
        console.error(`[Scraper] Flipkart error: ${error.message}`);
        return []; 
    }
}

async function fetchSnapdealData(query) {
    try {
        const url = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        const results = [];

        $('.product-tuple-listing').each((i, el) => {
            const name = $(el).find('p.product-title').text().trim();
            const priceText = $(el).find('span.product-price').text().trim();
            const link = $(el).find('a.dp-widget-link').attr('href');

            if (name && priceText) {
                const price = parseFloat(priceText.replace(/[Rs.,]/g, ''));
                results.push({ 
                    store: 'Snapdeal', 
                    name, 
                    price, 
                    inStock: true, 
                    link 
                });
            }
        });

        return results.slice(0, 15);
    } catch (error) { 
        console.error(`[Scraper] Snapdeal error: ${error.message}`);
        return []; 
    }
}

async function fetchWebContext(query) {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { headers: HEADERS });
        
        const $ = cheerio.load(data);
        let snippets = [];
        
        $('.result__body').each((i, el) => {
            if (i < 3) {
                const title = $(el).find('.result__a').text().trim();
                const snippet = $(el).find('.result__snippet').text().trim();
                snippets.push(`- ${title}: ${snippet}`);
            }
        });
        
        return snippets.join('\n') || "No web results found.";
    } catch (error) {
        console.error(`[Scraper] DDG error: ${error.message}`);
        return "Could not search the web.";
    }
}

module.exports = { fetchFlipkartData, fetchSnapdealData, fetchWebContext };