/* JavaScript */
let allCharacters = [];

/* =========================
   VIDEO CONFIG
========================= */
const VIDEO_CONFIG = {
    loopStart: 0.3,
    endSafety: 0.08
};

/* =========================
   LOAD CHARACTERS
========================= */
async function loadCharacters() {
    try {
        const response = await fetch('data/characters.json');

        if (!response.ok) {
            throw new Error(`Không tải được characters.json: ${response.status}`);
        }

        allCharacters = await response.json();
        renderCharacters(allCharacters);
    } catch (error) {
        console.error('Error loading characters:', error);

        const grid = document.querySelector('.characters-grid');
        if (grid) {
            grid.innerHTML = '<p class="no-results">Không tải được danh sách nhân vật.</p>';
        }
    }
}

/* =========================
   CHECK VIDEO
========================= */
function isVideoFile(src) {
    if (!src) return false;

    const cleanSrc = src.toLowerCase().split('?')[0].split('#')[0];

    return (
        cleanSrc.endsWith('.webm') ||
        cleanSrc.endsWith('.mp4')
    );
}

/* =========================
   ESCAPE HTML
========================= */
function escapeHTML(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* =========================
   RENDER CHARACTERS
========================= */
function renderCharacters(characters) {
    const grid = document.querySelector('.characters-grid');
    if (!grid) return;

    if (!characters || characters.length === 0) {
        grid.innerHTML = '<p class="no-results">Không tìm thấy nhân vật nào.</p>';
        return;
    }

    grid.innerHTML = characters.map(char => {
        const name = escapeHTML(char.name);
        const nameEU = escapeHTML(char.name_eu);
        const image = escapeHTML(char.image);
        const link = escapeHTML(char.link || '#');
        const afflatus = escapeHTML(char.afflatus);
        const rarity = escapeHTML(char.rarities);

        const euImage = char.eu === "1"
            ? `
                <img class="overlay-eu" src="image/rarities/eu.webp" alt="EU">
                <span class="char-eu-name">EU ${nameEU}</span>
              `
            : '';

        const isVideo = isVideoFile(char.image);

        const videoStyle = isVideo
            ? `
                style="
                    width: ${escapeHTML(char.video_width || '112px')};
                    height: ${escapeHTML(char.video_height || '200px')};
                    left: ${escapeHTML(char.video_left || '0px')};
                    top: ${escapeHTML(char.video_top || '0px')};
                    transform: ${escapeHTML(char.video_transform || 'none')};
                "
              `
            : '';

        const videoInnerStyle = char.video_position
            ? `object-position: ${escapeHTML(char.video_position)};`
            : '';

        /*
            Poster dùng để chống mất hình 0.5s - 1s khi WebM chưa decode xong.
            Trong characters.json nên thêm:
            "poster": "image/char/ten_nhan_vat.webp"
        */
        const poster = escapeHTML(char.poster || '');

        const loopStart = escapeHTML(char.loop_start ?? VIDEO_CONFIG.loopStart);
        const loopEnd = escapeHTML(char.loop_end ?? '');

        const mediaElement = isVideo
            ? `
                <div class="video-wrapper" ${videoStyle}>
                    ${
                        poster
                            ? `<img class="video-poster" src="${poster}" alt="${name}">`
                            : ''
                    }

                    <video
                        class="char-video"
                        src="${image}"
                        muted
                        loop
                        autoplay
                        playsinline
                        preload="auto"
                        ${poster ? `poster="${poster}"` : ''}
                        data-loop-start="${loopStart}"
                        data-loop-end="${loopEnd}"
                        style="${videoInnerStyle}">
                    </video>
                </div>
              `
            : `<img src="${image}" alt="${name}">`;

        return `
            <a href="${link}" class="char-card">
                <div class="container">
                    <img class="overlay-bg" src="image/bg.webp" alt="">
                    ${mediaElement}
                    <img class="overlay-afflatus" src="image/afflatus/${afflatus}.webp" alt="${afflatus}">
                    <img class="overlay-rarity" src="image/rarities/${rarity}.webp" alt="${rarity} stars">
                    ${euImage}
                    <span class="char-name">${name}</span>
                </div>
            </a>
        `;
    }).join('');

    requestAnimationFrame(() => {
        setupVideos();
    });
}

/* =========================
   VIDEO CSS AUTO INJECT
   Không cần sửa CSS riêng
========================= */
function injectVideoCSS() {
    if (document.getElementById('auto-video-css')) return;

    const style = document.createElement('style');
    style.id = 'auto-video-css';

    style.textContent = `
        .video-wrapper{
            position: relative;
            overflow: hidden;
        }

        .video-wrapper .video-poster,
        .video-wrapper .char-video{
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .video-wrapper .video-poster{
            z-index: 1;
            opacity: 1;
            transition: opacity .18s linear;
            pointer-events: none;
        }

        .video-wrapper .char-video{
            z-index: 2;
            opacity: 0;
            transition: opacity .18s linear;
            pointer-events: none;
        }

        .video-wrapper .char-video.video-ready{
            opacity: 1;
        }

        .video-wrapper .video-poster.poster-hide{
            opacity: 0;
        }
    `;

    document.head.appendChild(style);
}

/* =========================
   SETUP VIDEOS
========================= */
function setupVideos() {
    injectVideoCSS();

    document.querySelectorAll('.char-video').forEach(video => {
        if (video.dataset.readySetup === '1') return;
        video.dataset.readySetup = '1';

        const wrapper = video.closest('.video-wrapper');
        const poster = wrapper ? wrapper.querySelector('.video-poster') : null;

        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';

        const showVideo = () => {
            video.classList.add('video-ready');

            if (poster) {
                poster.classList.add('poster-hide');
            }

            video.play().catch(() => {});
        };

        /*
            loadeddata: frame đầu đã decode xong
            canplay / playing: video đã đủ điều kiện hiển thị
        */
        video.addEventListener('loadeddata', showVideo, { once: true });
        video.addEventListener('canplay', showVideo, { once: true });
        video.addEventListener('playing', showVideo, { once: true });

        /*
            Nếu có loop_end riêng thì dùng loop thủ công.
            Nếu không có loop_end thì để browser tự loop.
        */
        setupOptionalCustomLoop(video);

        /*
            Gọi play nhiều lần nhẹ nhàng để mobile/browser không đứng video.
        */
        video.play().catch(() => {});
    });
}

/* =========================
   OPTIONAL CUSTOM LOOP
   Chỉ hoạt động nếu char có "loop_end"
========================= */
function setupOptionalCustomLoop(video) {
    const loopEndRaw = video.dataset.loopEnd;

    if (!loopEndRaw) {
        video.loop = true;
        return;
    }

    const loopStart = parseFloat(video.dataset.loopStart || VIDEO_CONFIG.loopStart);
    const loopEnd = parseFloat(loopEndRaw);

    if (isNaN(loopEnd) || loopEnd <= 0) {
        video.loop = true;
        return;
    }

    video.loop = false;

    function restart() {
        try {
            // Chỉ gán currentTime, KHÔNG gọi lại video.play() ở đây
            // vì gọi play() liên tục có thể làm khựng frame tiếp theo
            video.currentTime = isNaN(loopStart) ? VIDEO_CONFIG.loopStart : loopStart;
        } catch (err) {}
    }

    // Sử dụng requestAnimationFrame để check mượt hơn thay vì timeupdate
    function checkLoop() {
        if (video.seeking) {
            requestAnimationFrame(checkLoop);
            return;
        }

        if (video.currentTime >= loopEnd - VIDEO_CONFIG.endSafety) {
            restart();
        }

        // Tiếp tục theo dõi nếu video chưa kết thúc và đang không bị pause
        if (!video.paused && !video.ended) {
            requestAnimationFrame(checkLoop);
        }
    }

    // Bắt đầu vòng lặp theo dõi khi video chạy
    video.addEventListener('play', () => {
        requestAnimationFrame(checkLoop);
    });

    // Phòng hờ nếu video chạy tuột qua checkLoop do lag trình duyệt
    video.addEventListener('ended', () => {
        restart();
        video.play().catch(() => {});
    });
}

/* =========================
   FILTER
========================= */
function setFilter(filterType, value) {
    const selectedInput = document.getElementById(`selected-${filterType}`);

    if (selectedInput) {
        selectedInput.value = value;
    }

    const buttons = document.querySelectorAll(`[data-filter="${filterType}"]`);

    buttons.forEach(btn => {
        btn.classList.remove('active');

        if (btn.dataset.value === value) {
            btn.classList.add('active');
        }
    });

    filterCharacters();
}

function filterCharacters() {
    const afflatusInput = document.getElementById('selected-afflatus');
    const damageTypeInput = document.getElementById('selected-damage-type');
    const rarityInput = document.getElementById('selected-rarity');
    const searchInput = document.getElementById('search-input');

    const afflatus = afflatusInput ? afflatusInput.value : 'all';
    const damageType = damageTypeInput ? damageTypeInput.value : 'all';
    const rarity = rarityInput ? rarityInput.value : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = allCharacters.filter(char => {
        const charAfflatus = String(char.afflatus || '').toLowerCase();
        const charDamageType = String(char.damage_types || '').toLowerCase();
        const charRarity = String(char.rarities || '');
        const charName = String(char.name || '').toLowerCase();

        const matchAfflatus =
            afflatus === 'all' ||
            charAfflatus === afflatus;

        const matchDamageType =
            damageType === 'all' ||
            charDamageType === damageType;

        const matchRarity =
            rarity === 'all' ||
            charRarity === String(rarity);

        const matchQuery =
            query === '' ||
            charName.includes(query);

        return (
            matchAfflatus &&
            matchDamageType &&
            matchRarity &&
            matchQuery
        );
    });

    renderCharacters(filtered);
}

function handleSearch() {
    filterCharacters();
}

/* =========================
   DOM READY
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterCharacters();
        });
    }

    document.querySelectorAll('.filter-buttons').forEach(container => {
        container.addEventListener('click', function (e) {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            const filterType = this.dataset.filterType;
            const value = btn.dataset.value;

            setFilter(filterType, value);
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            document.querySelectorAll('.char-video').forEach(video => {
                video.play().catch(() => {});
            });
        }
    });

    loadCharacters();
});