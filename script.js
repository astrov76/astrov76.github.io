// Fetch video data from videos.json
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
        
        // Add click event to filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const selectedCategory = btn.dataset.category;
                filterAndRender(videos, selectedCategory, document.getElementById('searchInput').value);
            });
        });
        
        // Search input handler
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
            filterAndRender(videos, activeCategory, searchInput.value);
        });
        
        // Initial render (all videos)
        filterAndRender(videos, 'all', '');
    })
    .catch(error => {
        console.error('Error loading videos.json:', error);
        document.getElementById('videoGrid').innerHTML = '<p style="text-align:center; color:red;">Failed to load videos. Check console for details.</p>';
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
        
        // Extract YouTube video ID from URL
        const videoId = getYouTubeId(video.youtubeUrl);
        const embedUrl = video.youtubeUrl;
        
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

function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
