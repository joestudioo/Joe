const cards = [
    {
        title: "Don't Trust Cat",
        thumbnail: "image/miaouu.png",
        video: "video/miaouu.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 1.0
    },
    {
        title: "The Time",
        thumbnail: "image/the_time.png",
        video: "video/the_time.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 0.3
    },
    {
        title: "The Flower",
        thumbnail: "image/the_flower.png",
        video: "video/the_flower.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 0.6
    },
    {
        title: "The Escalators",
        thumbnail: "image/the_escalators.png",
        video: "video/the_escalators.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 0.4
    },
    {
        title: "Good Dog",
        thumbnail: "image/chien.avif",
        video: "video/good_dog.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 0.5
    },
    {
        title: "joe",
        thumbnail: "image/joe.png",
        video: "video/joe.mp4",
        author: "Joe",
        logo: "image/logo_joe_pasouf_mieux.png",
        volume: 0.5
    }
];

let highestZIndex = 10;
let draggedCard = null;
let offsetX = 0;
let offsetY = 0;
let ticking = false;

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
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
                const clampedScroll = Math.max(0, st);
                const progress = Math.min(clampedScroll / maxScroll, 1);
                const translateValue = -progress * windowHeight;
                // Pas d'animation, changement direct
                pageHr.style.transform = `translateY(${translateValue}px)`;
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
}, { passive: true });

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
            x: 0,
            y: currentY,
            width: cardWidth,
            height: cardHeight,
            zIndex: 10 + index
        });
        
        currentY += cardHeight + spacing;
    });
    
    const container = document.getElementById('container');
    if (container) {
        container.style.minHeight = `${currentY + 20}px`;
    }
    
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
        card.style.position = 'relative';
        card.style.marginTop = index === 0 ? '0' : '20px';
    } else {
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
    content.addEventListener('click', () => playVideo(cardData.video, cardData.volume || 0.5));

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

function playVideo(videoPath, volume = 0.5) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    video.src = videoPath;
    video.volume = volume;
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

(function() {
    const activationCode = "mousse";
    const imagesFolder = "image/chats/";
    const imageCount = 12;
    const soundFile = "sounds/miaou.mp3";

    let typed = "";
    let catsEnabled = false;

    const audio = new Audio(soundFile);
    audio.volume = 0.3;

    function unlockAudio() {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("keydown", unlockAudio);
    }
    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    const layer = document.createElement("div");
    layer.style.position = "fixed";
    layer.style.top = "0";
    layer.style.left = "0";
    layer.style.width = "100%";
    layer.style.height = "100%";
    layer.style.zIndex = "99";
    layer.style.pointerEvents = "none";
    layer.style.overflow = "hidden";
    document.body.appendChild(layer);

    function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function spawnCat() {
        const img = document.createElement("img");
        const randomIndex = Math.floor(Math.random() * imageCount) + 1;
        img.src = `${imagesFolder}${randomIndex}.png`;

        img.style.position = "absolute";
        img.style.width = getRandomInt(150, 250) + "px";
        img.style.transform = "rotate("+getRandomInt(-45,45)+"deg)";
        img.style.userSelect = "none";
        img.style.opacity = "1";

        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 150);
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;

        layer.appendChild(img);
    }

    document.addEventListener("keydown", (e) => {
        if (e.key.length === 1) {
            typed += e.key.toLowerCase();
            if (typed.length > activationCode.length) {
                typed = typed.slice(-activationCode.length);
            }
        }

        if (typed.endsWith(activationCode)) {
            catsEnabled = true;
            audio.currentTime = 0;
            audio.play().catch(err => console.warn("Le son n’a pas pu être joué :", err));
        }

        if (catsEnabled && e.key === "Enter") {
            spawnCat();
        }
    });
})();