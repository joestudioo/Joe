const cards = [
    {
        title: "Don't Trust Cat",
        thumbnail: "image/miaouu.png",
        video: "video/miaouu.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    },
    {
        title: "The Time",
        thumbnail: "image/the_time.png",
        video: "video/the_time.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    },
    {
        title: "The Flower",
        thumbnail: "image/the_flower.png",
        video: "video/the_flower.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    },
    {
        title: "The Escalators",
        thumbnail: "image/the_escalators.png",
        video: "video/the_escalators.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    },
    {
        title: "Good Dog",
        thumbnail: "image/chien.avif",
        video: "video/good_dog.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    },
    {
        title: "joe",
        thumbnail: "image/joe.png",
        video: "video/joe.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png"
    }
];

let highestZIndex = 10;
let draggedCard = null;
let offsetX = 0;
let offsetY = 0;

window.addEventListener('scroll', function() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.getElementById('header');
    const headerc = document.getElementById('headerc');
    const pageHr = document.getElementById('pageHr');
    const windowHeight = window.innerHeight;
    
    if (header) {
        header.style.backgroundPositionY = (-st/20) + 'px';
    }
    if (headerc) {
        headerc.style.top = (-st/5) + 'px';
        headerc.style.bottom = (st/5) + 'px';
    }
    
    if (pageHr) {
        const maxScroll = windowHeight;
        const progress = Math.min(st / maxScroll, 1);
        pageHr.style.transform = `translateY(-${progress * windowHeight}px)`;
    }
});

function calculateLayout() {
    const container = document.getElementById('container');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        return layoutMobile();
    } else {
        return layoutDesktop();
    }
}

function layoutDesktop() {
    const containerWidth = window.innerWidth - 40;
    const containerHeight = window.innerHeight - 80;
    
    const layoutConfig = [
        { x: 15, y: 35, width: 18, heightRatio: 1.5, zIndex: 12 },
        { x: 25, y: 15, width: 18, heightRatio: 1.7, zIndex: 13 },
        { x: 38, y: 28, width: 18, heightRatio: 1.6, zIndex: 14 },
        { x: 48, y: 23, width: 16, heightRatio: 1.4, zIndex: 15 },
        { x: 58, y: 37, width: 16, heightRatio: 1.7, zIndex: 10 },
        { x: 68, y: 28, width: 17, heightRatio: 1.5, zIndex: 9 }
    ];
    
    return layoutConfig.map(config => {
        const cardWidth = (containerWidth * config.width) / 100;
        const cardHeight = cardWidth * config.heightRatio;
        
        return {
            x: (containerWidth * config.x) / 100,
            y: (containerHeight * config.y) / 100,
            width: cardWidth,
            height: cardHeight,
            zIndex: config.zIndex
        };
    });
}

function layoutMobile() {
    const spacing = 20;
    const cardWidth = Math.min(280, window.innerWidth - 40);
    
    let positions = [];
    let currentY = 20;
    
    cards.forEach((card, index) => {
        const aspectRatio = 1.5;
        const cardHeight = cardWidth * aspectRatio;
        
        positions.push({
            x: 0, // Position relative, sera centrée par le CSS
            y: currentY,
            width: cardWidth,
            height: cardHeight,
            zIndex: 10 + index
        });
        
        currentY += cardHeight + spacing;
    });
    
    // Ajuster la hauteur du container en fonction du contenu
    const container = document.getElementById('container');
    if (container) {
        container.style.minHeight = `${currentY + 20}px`;
    }
    
    // Ajuster la hauteur de #page pour qu'elle couvre tout le contenu
    const page = document.getElementById('page');
    if (page) {
        page.style.minHeight = `${currentY + 60}px`;
    }
    
    return positions;
}

function createCards() {
    const container = document.getElementById('container');
    container.innerHTML = '';
    
    const positions = calculateLayout();
    const isMobile = window.innerWidth <= 768;
    
    cards.forEach((card, index) => {
        const cardEl = createCard(card, index, positions[index], isMobile);
        container.appendChild(cardEl);
    });
}

function createCard(cardData, index, position, isMobile) {
    const card = document.createElement('div');
    card.className = 'card';
    
    if (isMobile) {
        // En mode mobile, on utilise position relative pour le centrage automatique
        card.style.position = 'relative';
        card.style.marginTop = index === 0 ? '0' : '20px';
    } else {
        // En mode desktop, on garde la position absolue
        card.style.position = 'absolute';
        card.style.left = `${position.x}px`;
        card.style.top = `${position.y}px`;
    }
    
    card.style.width = `${position.width}px`;
    card.style.height = `${position.height}px`;
    card.style.zIndex = position.zIndex;
    card.dataset.video = cardData.video;

    card.innerHTML = `
        <div class="card-content">
            <img src="${cardData.thumbnail}" alt="${cardData.title}" class="card-thumbnail">
            <div class="play-button"></div>
        </div>
        <div class="card-header">
            <div class="card-title">${cardData.title}</div>
            <img src="${cardData.logo}" alt="Logo" class="logo">
        </div>
    `;

    const header = card.querySelector('.card-header');
    if (!isMobile) {
        header.addEventListener('mousedown', (e) => startDrag(e, card));
        header.addEventListener('touchstart', (e) => startDrag(e.touches[0], card));
    }

    const content = card.querySelector('.card-content');
    content.addEventListener('click', () => playVideo(cardData.video));

    return card;
}

function startDrag(e, card) {
    e.preventDefault();
    draggedCard = card;
    
    const rect = card.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    card.classList.add('dragging');
    highestZIndex++;
    card.style.zIndex = highestZIndex;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!draggedCard) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    const container = document.getElementById('container');
    const maxX = container.offsetWidth - draggedCard.offsetWidth;
    const maxY = container.offsetHeight - draggedCard.offsetHeight;

    draggedCard.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    draggedCard.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
}

function dragTouch(e) {
    if (!draggedCard) return;
    e.preventDefault();
    drag(e.touches[0]);
}

function stopDrag() {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', dragTouch);
    document.removeEventListener('touchend', stopDrag);
}

function playVideo(videoPath) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    video.src = videoPath;
    modal.classList.add('active');
    video.play();
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    video.pause();
    video.src = '';
    modal.classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVideo();
    }
});

document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') {
        closeVideo();
    }
});

createCards();

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createCards();
    }, 250);
});