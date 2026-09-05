fetch('videos.json')
    .then(response => response.json())
    .then(data => {
        const videos = data.videos;
        const categories = [...new Set(videos.map(v => v.category))];
        
        // Build category filter buttons
        const filterContainer = document.getElementById('categoryFilters');
        const allButton = document.createElement('button');
        allButton.className = 'filter-btn active';
        allButton.textContent = 'All';
        allButton.dataset.category = 'all';
        filterContainer.appendChild(allButton);
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = cat;
            btn.dataset.category = cat;
            filterContainer.appendChild(btn);
        });
        
        // Filter button event listeners
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterAndRender(videos, btn.dataset.category, document.getElementById('searchInput').value);
            });
        });
        
        // Search input listener
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
            filterAndRender(videos, activeCategory, searchInput.value);
        });
        
        // Initial render
        filterAndRender(videos, 'all', '');
    })
    .catch(error => {
        console.error('Error loading videos.json:', error);
        document.getElementById('videoGrid').innerHTML = '<p style="text-align:center; color:red;">Failed to load videos.</p>';
    });

function filterAndRender(videos, category, searchTerm) {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = '';
    
    const filtered = videos.filter(video => {
        const matchesCategory = category === 'all' || video.category === category;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              video.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No videos found.</p>';
        return;
    }
    
    filtered.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        // Extract RuTube video ID from URL and build embed URL
        const videoId = getRutubeId(video.rutubeUrl);
        if (!videoId) {
            console.error('Invalid RuTube URL:', video.rutubeUrl);
            return;
        }
        const embedUrl = `https://rutube.ru/play/embed/${videoId}`;
        
        card.innerHTML = `
            <div class="video-wrapper">
                <iframe src="${embedUrl}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <span class="category">${video.category}</span>
                <h3>${video.title}</h3>
                <p>${video.description || ''}</p>
                <p style="font-size:0.8rem; color:#999;">${video.date || ''}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Extract RuTube video ID from various URL formats
function getRutubeId(url) {
    // Patterns:
    // https://rutube.ru/video/VIDEO_ID/
    // https://rutube.ru/video/private/VIDEO_ID/
    // https://rutube.ru/play/embed/VIDEO_ID
    // https://rutube.ru/video/VIDEO_ID?params...
    // The ID is typically a long alphanumeric string (hex-like)
    
    // Try to match /video/VIDEO_ID or /video/private/VIDEO_ID
    let match = url.match(/rutube\.ru\/video\/(?:private\/)?([a-f0-9]{32})/i);
    if (match) return match[1];
    
    // Try to match /play/embed/VIDEO_ID
    match = url.match(/rutube\.ru\/play\/embed\/([a-f0-9]{32})/i);
    if (match) return match[1];
    
    // If the URL itself is just the ID (32 hex chars)
    match = url.match(/^([a-f0-9]{32})$/i);
    if (match) return match[1];
    
    return null;
}
