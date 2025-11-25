const CATEGORY_RULES = {
    mobile: {
        include: ['mobile', 'phone', 'smartphone', 'android', 'iphone', 'samsung', 'oneplus', 'redmi', 'realme', 'xiaomi', 'pixel', 'vivo', 'oppo', 'motorola', 'nokia', 'nothing phone'],
        requiredSpecs: ['gb', 'tb', '5g', '4g', 'ram', 'rom', 'storage', 'dual sim', 'android', 'ios'],
        exclude: ['case', 'cover', 'glass', 'guard', 'protector', 'holder', 'stand', 'cable', 'charger', 'adapter', 'usb', 'converter', 'earphone', 'headphone', 'jack', 'cleaner', 'kit']
    },
    laptop: {
        include: ['laptop', 'notebook', 'macbook', 'thinkpad', 'ideapad', 'pavilion', 'rog', 'tuf', 'zenbook', 'aspire', 'nitro', 'omen', 'victus', 'loq', 'predator', 'alienware', 'galaxy book', 'surface'],
        requiredSpecs: ['intel', 'amd', 'ryzen', 'core', 'processor', 'windows', 'mac', 'ssd', 'hdd', 'ram', 'rtx', 'gtx', 'graphics'],
        
        exclude: ['bag', 'sleeve', 'skin', 'cover', 'keyboard', 'mouse', 'adapter', 'charger', 'battery', 'fan', 'cooling', 'protector', 'screen', 'spare', 'part', 'compatible', 'decals']
    },
    clothing: {
        include: ['shirt', 'pant', 't-shirt', 'jeans', 'trouser', 'cotton', 'wear', 'dress', 'jacket', 'hoodie', 'men', 'women', 'kurta', 'saree', 'top', 'blazer'],
        requiredSpecs: [],
        exclude: ['cover', 'case', 'sticker', 'doll', 'toy']
    },
    shoes: {
        include: ['shoe', 'sneaker', 'boot', 'sandal', 'slipper', 'footwear', 'nike', 'adidas', 'puma', 'crocs', 'loafer', 'slide', 'running', 'walking'],
        requiredSpecs: [],
        exclude: ['rack', 'polish', 'lace', 'sock', 'cleaner', 'box']
    },
    watch: {
        include: ['watch', 'smartwatch', 'band', 'strap', 'tracker', 'wearable'],
        requiredSpecs: [],
        exclude: ['glass', 'guard', 'charger', 'protector', 'cable']
    }
};

let globalProductData = [];

function setCategoryData(products) {
    globalProductData = products;
}

function filterByCategory(category) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    const clickedBtn = event.target.closest('.cat-btn');
    if (clickedBtn) clickedBtn.classList.add('active');

    const priceGrid = document.getElementById('priceGrid');
    const resultsCount = document.getElementById('resultsCount');
    const bestDealBanner = document.getElementById('bestDealBanner');
    const bestDealText = document.getElementById('bestDealText');
    
    priceGrid.innerHTML = ''; 
    if (category === 'all') {
        displayFilteredItems(globalProductData);
        return;
    }

    const rules = CATEGORY_RULES[category];
    
    const filteredItems = globalProductData.filter(item => {
        const title = item.name.toLowerCase();
        const hasKeyword = rules.include.some(word => title.includes(word));
        const isJunk = rules.exclude.some(word => title.includes(word));
        let hasTechSpec = true; 
        if (rules.requiredSpecs && rules.requiredSpecs.length > 0) {
            hasTechSpec = rules.requiredSpecs.some(spec => title.includes(spec));
        }
        return hasKeyword && !isJunk && hasTechSpec;
    });

    displayFilteredItems(filteredItems);
}

function displayFilteredItems(items) {
    const priceGrid = document.getElementById('priceGrid');
    const resultsCount = document.getElementById('resultsCount');
    const bestDealBanner = document.getElementById('bestDealBanner');
    const bestDealText = document.getElementById('bestDealText');

    if (items.length === 0) {
        priceGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: #666;">No items found in this category.</p>';
        resultsCount.textContent = `0 results`;
        bestDealBanner.style.display = 'none';
        return;
    }

    resultsCount.textContent = `Showing ${items.length} results`;
    items.sort((a, b) => a.price - b.price);
    const bestDeal = items[0]; 
    if (bestDeal) {
        bestDealText.textContent = `Best deal found at ${bestDeal.store} - Save big!`;
        bestDealBanner.style.display = 'block';
    }

    items.forEach(item => {
        const card = createPriceCard(item, item === bestDeal);
        priceGrid.appendChild(card);
    });
}