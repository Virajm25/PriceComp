const API_URL = 'http://localhost:3000/api';
let currentProduct = '';
let chatHistory = [];

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const priceGrid = document.getElementById('priceGrid');
const searchedProduct = document.getElementById('searchedProduct');
const resultsCount = document.getElementById('resultsCount');
const bestDealBanner = document.getElementById('bestDealBanner');
const bestDealText = document.getElementById('bestDealText');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const toggleChat = document.getElementById('toggleChat');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotToggle = document.getElementById('chatbotToggle');

searchBtn.addEventListener('click', searchProduct);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProduct();
});

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

toggleChat.addEventListener('click', () => {
    chatbotContainer.classList.toggle('minimized');
});

chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.toggle('active');
});

async function searchProduct() {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a product name');
        return;
    }

    currentProduct = query;
    
    resultsSection.style.display = 'block';
    loadingSpinner.style.display = 'block';
    priceGrid.innerHTML = '';
    bestDealBanner.style.display = 'none';
    searchedProduct.textContent = query;
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        loadingSpinner.style.display = 'none';

        if (data.results && data.results.length > 0) {
            document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.cat-btn');
            if(allBtn) allBtn.classList.add('active');

            if (typeof setCategoryData === 'function') {
                setCategoryData(data.results); 
            }

            displayResults(data.results);
            enableChatbot();
            informChatbot(query);
        } else {
            priceGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray);">No results found. Try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error fetching prices:', error);
        loadingSpinner.style.display = 'none';
        priceGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading results. Please try again.</p>';
    }
}

function displayResults(results) {
    resultsCount.textContent = `Found ${results.length} results`;
    
    const bestDeal = results.reduce((min, item) => 
        item.price < min.price ? item : min
    );

    results.forEach(item => {
        const isBestDeal = item.price === bestDeal.price;
        const card = createPriceCard(item, isBestDeal);
        priceGrid.appendChild(card);
    });

    bestDealText.textContent = `Best deal found at ${bestDeal.store} - Save up to ${bestDeal.discount || '20%'}!`;
    bestDealBanner.style.display = 'block';
}

function createPriceCard(item, isBestDeal) {
    const card = document.createElement('div');
    card.className = `price-card ${isBestDeal ? 'best-deal' : ''}`;
    
    const discountPercent = item.originalPrice 
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    const formatPrice = (price) => {
        return price.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        });
    };

    card.innerHTML = `
        ${isBestDeal ? '<div class="best-deal-badge"><i class="fas fa-star"></i> Best Deal</div>' : ''}
        
        <div class="store-logo">
            <i class="${getStoreIcon(item.store)}"></i>
            <h4>${item.store}</h4>
        </div>

        <div class="product-info">
            <p class="product-name">${item.name}</p>
            
            <div class="price-info">
                <span class="current-price">${formatPrice(item.price)}</span>
                ${item.originalPrice > item.price ? `<span class="original-price">${formatPrice(item.originalPrice)}</span>` : ''}
                ${discountPercent > 0 ? `<span class="discount">${discountPercent}% OFF</span>` : ''}
            </div>

            <div class="availability ${item.inStock ? 'in-stock' : 'out-of-stock'}">
                <i class="fas ${item.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                ${item.inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            ${item.rating ? `
                <div class="rating">
                    ${'★'.repeat(Math.floor(item.rating))}${'☆'.repeat(5 - Math.floor(item.rating))}
                    <span style="color: var(--gray);">(${item.rating})</span>
                </div>
            ` : ''}
        </div>

        <a href="${item.link}" target="_blank" class="view-product-btn">
            <i class="fas fa-external-link-alt"></i> View on ${item.store}
        </a>
    `;

    return card;
}

function getStoreIcon(store) {
    const storeLower = store.toLowerCase();
    
    if (storeLower.includes('amazon')) return 'fab fa-amazon';
    if (storeLower.includes('flipkart')) return 'fas fa-shopping-bag';
    if (storeLower.includes('snapdeal')) return 'fas fa-box-open'; 
    if (storeLower.includes('croma')) return 'fas fa-laptop';
    
    return 'fas fa-shopping-cart'; 
}

function enableChatbot() {
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.placeholder = `Ask me anything about ${currentProduct}...`;
}

async function informChatbot(product) {
    try {
        await fetch(`${API_URL}/chat/context`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product })
        });
        
        addBotMessage(`Great! I can now help you with questions about ${product}. What would you like to know?`);
    } catch (error) {
        console.error('Error informing chatbot:', error);
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;

    addUserMessage(message);
    chatInput.value = '';

    const typingIndicator = addTypingIndicator();

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                product: currentProduct,
                history: chatHistory
            })
        });

        const data = await response.json();

        typingIndicator.remove();

        if (data.response) {
            addBotMessage(data.response);
            chatHistory.push({ user: message, bot: data.response });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        typingIndicator.remove();
        addBotMessage('Sorry, I encountered an error. Please try again.');
    }
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <i class="fas fa-user"></i>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <i class="fas fa-robot"></i>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <i class="fas fa-robot"></i>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}