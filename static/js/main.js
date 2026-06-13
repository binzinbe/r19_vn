/* JavaScript */

/* =========================
   GLOBAL STATE
========================= */
let allCharacters = [];

/* =========================
   VIDEO CONFIG
========================= */
const VIDEO_CONFIG = {
    loopStart: 0.3,
    endSafety: 0.08
};

/* =========================
   SAFARI / IOS CHECK
   iPhone / iPad / Safari sẽ hiện poster thay vì WebM
========================= */
function isSafariPosterOnlyBrowser() {
    const ua = navigator.userAgent || '';

    const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isSafari =
        /Safari/.test(ua) &&
        !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPR|Opera|Android/.test(ua);

    return isIOS || isSafari;
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
   CHECK VIDEO FILE
========================= */
function isVideoFile(src) {
    if (!src) return false;

    const cleanSrc = String(src).toLowerCase().split('?')[0].split('#')[0];

    return (
        cleanSrc.endsWith('.webm') ||
        cleanSrc.endsWith('.mp4') ||
        cleanSrc.endsWith('.mov')
    );
}

/* =========================
   LOAD CHARACTERS
========================= */
async function loadCharacters() {
    const grid = document.querySelector('.characters-grid');

    try {
        const response = await fetch('data/characters.json', {
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`Không tải được characters.json: ${response.status}`);
        }

        allCharacters = await response.json();
        renderCharacters(allCharacters);
    } catch (error) {
        console.error('Error loading characters:', error);

        if (grid) {
            grid.innerHTML = '<p class="no-results">Không tải được danh sách nhân vật.</p>';
        }
    }
}

/* =========================
   BUILD NORMAL CHAR IMAGE
   Ảnh thường và poster Safari dùng chung class này
========================= */
function buildNormalCharImage(src, alt) {
    return `<img class="char-main-img" src="${src}" alt="${alt}">`;
}

/* =========================
   BUILD MEDIA ELEMENT
========================= */
function buildMediaElement(char) {
    const name = escapeHTML(char.name);
    const image = escapeHTML(char.image || '');
    const poster = escapeHTML(char.poster || '');

    const isVideo = isVideoFile(char.image);

    /*
        video_width / video_height / video_left / video_top:
        dùng cho WebM trên PC/Android.
        Safari/iPhone không dùng wrapper này, chỉ hiện poster như ảnh thường.
    */
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

    const videoInnerStyleParts = [];

    if (char.video_position) {
        videoInnerStyleParts.push(`object-position: ${escapeHTML(char.video_position)}`);
    }

    if (char.video_inner_transform) {
        videoInnerStyleParts.push(`transform: ${escapeHTML(char.video_inner_transform)}`);
    }

    const videoInnerStyle = videoInnerStyleParts.length
        ? videoInnerStyleParts.join('; ') + ';'
        : '';

    const loopStart = escapeHTML(char.loop_start ?? VIDEO_CONFIG.loopStart);
    const loopEnd = escapeHTML(char.loop_end ?? '');

    /*
        Safari / iPhone:
        Không render video.
        Không render video-wrapper.
        Poster sẽ giống ảnh char thường 100%.
    */
    if (isVideo && isSafariPosterOnlyBrowser()) {
        if (poster) {
            return buildNormalCharImage(poster, name);
        }

        return `
            <div class="media-missing">
                <span>Missing poster</span>
            </div>
        `;
    }

    /*
        PC / Android / trình duyệt hỗ trợ video:
        Dùng WebM/MP4/MOV.
        Poster nằm dưới video, video chỉ hiện khi đã sẵn sàng.
    */
    if (isVideo) {
        return `
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
                    webkit-playsinline
                    preload="auto"
                    ${poster ? `poster="${poster}"` : ''}
                    data-loop-start="${loopStart}"
                    data-loop-end="${loopEnd}"
                    style="${videoInnerStyle}">
                </video>
            </div>
        `;
    }

    /*
        Ảnh char thường.
    */
    return buildNormalCharImage(image, name);
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
        const link = escapeHTML(char.link || '#');
        const afflatus = escapeHTML(char.afflatus);
        const rarity = escapeHTML(char.rarities);

        const euImage = char.eu === '1'
            ? `
                <img class="overlay-eu" src="image/rarities/eu.webp" alt="EU">
                <span class="char-eu-name">EU ${nameEU}</span>
              `
            : '';

        const mediaElement = buildMediaElement(char);

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
   CSS AUTO INJECT
   Fix ảnh, video, overlay
========================= */
function injectVideoCSS() {
    if (document.getElementById('auto-video-css')) return;

    const style = document.createElement('style');
    style.id = 'auto-video-css';

    style.textContent = `
        /*
            Ảnh char thường + poster Safari.
            Đè lại .char-card img { width:100%; height:100%; }
            để ảnh/poster không bị méo khác nhau.
        */
        .char-card .container > img.char-main-img{
            position: relative !important;
            z-index: 2 !important;
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
            transform: none !important;
        }

        /*
            Video wrapper phải absolute để không phá layout card.
            Width/height/left/top lấy từ inline style trong characters.json.
        */
        .char-card .video-wrapper{
            position: absolute !important;
            overflow: hidden !important;
            display: block !important;
            z-index: 4 !important;
            border-radius: 3px !important;
            pointer-events: none !important;
        }

        /*
            Video/poster trong wrapper.
            cover giống CSS gốc của bạn.
            Nếu muốn không crop, đổi cover thành contain.
        */
        .char-card .video-wrapper .video-poster,
        .char-card .video-wrapper .char-video{
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center;
            pointer-events: none !important;
        }

        .char-card .video-wrapper .video-poster{
            z-index: 1 !important;
            opacity: 1;
            transition: opacity .18s linear;
        }

        .char-card .video-wrapper .char-video{
            z-index: 2 !important;
            opacity: 0;
            transition: opacity .18s linear;
        }

        .char-card .video-wrapper .char-video.video-ready{
            opacity: 1;
        }

        .char-card .video-wrapper .video-poster.poster-hide{
            opacity: 0;
        }

        /*
            Overlay background.
            Không để global img height:100% làm nền bị kéo méo.
        */
        .char-card .overlay-bg{
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
            z-index: 1 !important;
            pointer-events: none !important;
        }

        /*
            Afflatus.
            Không set top để giữ vị trí CSS gốc của bạn.
        */
        .char-card .overlay-afflatus{
            width: 20px !important;
            height: 35px !important;
            object-fit: contain !important;
            z-index: 8 !important;
            pointer-events: none !important;
			top: 0px !important;
        }

        /*
            Rarity.
            Không set top/left/transform để giữ vị trí CSS gốc của bạn.
        */
        .char-card .overlay-rarity{
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
            z-index: 9 !important;
            pointer-events: none !important;
			top: 96px !important;
        }

        /*
            EU overlay.
            Chỉ tăng tầng, không phá vị trí gốc.
        */
        .char-card .overlay-eu{
            z-index: 17 !important;
            pointer-events: none !important;
        }

        .char-card .char-eu-name{
            z-index: 18 !important;
            pointer-events: none !important;
        }

        .char-card .char-name{
            z-index: 19 !important;
            pointer-events: none !important;
        }

        .char-card .media-missing{
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: rgba(255,255,255,.55);
            background: rgba(255,255,255,.04);
        }
    `;

    document.head.appendChild(style);
}

/* =========================
   SETUP VIDEOS
========================= */
function setupVideos() {
    injectVideoCSS();

    /*
        Safari/iPhone không có .char-video
        vì đã render poster thành ảnh thường.
    */
    document.querySelectorAll('.char-video').forEach(video => {
        if (video.dataset.readySetup === '1') return;
        video.dataset.readySetup = '1';

        const wrapper = video.closest('.video-wrapper');
        const poster = wrapper ? wrapper.querySelector('.video-poster') : null;

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';

        const showVideo = () => {
            video.classList.add('video-ready');

            if (poster) {
                poster.classList.add('poster-hide');
            }

            video.play().catch(() => {});
        };

        video.addEventListener('loadeddata', showVideo, { once: true });
        video.addEventListener('canplay', showVideo, { once: true });
        video.addEventListener('playing', showVideo, { once: true });

        setupOptionalCustomLoop(video);

        video.play().catch(() => {});
    });
}

/* =========================
   OPTIONAL CUSTOM LOOP
   Chỉ dùng nếu character có loop_end
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
            video.currentTime = isNaN(loopStart)
                ? VIDEO_CONFIG.loopStart
                : loopStart;
        } catch (err) {}
    }

    function checkLoop() {
        if (video.seeking) {
            requestAnimationFrame(checkLoop);
            return;
        }

        if (video.currentTime >= loopEnd - VIDEO_CONFIG.endSafety) {
            restart();
        }

        if (!video.paused && !video.ended) {
            requestAnimationFrame(checkLoop);
        }
    }

    video.addEventListener('play', () => {
        requestAnimationFrame(checkLoop);
    });

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

    /*
        HTML của bạn dùng:
        <div class="filter-buttons" data-filter-type="afflatus">
    */
    const container = document.querySelector(`.filter-buttons[data-filter-type="${filterType}"]`);

    if (container) {
        const buttons = container.querySelectorAll('.filter-btn');

        buttons.forEach(btn => {
            btn.classList.remove('active');

            if (btn.dataset.value === value) {
                btn.classList.add('active');
            }
        });
    }

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
        const charNameEU = String(char.name_eu || '').toLowerCase();

        const matchAfflatus =
            afflatus === 'all' ||
            charAfflatus === String(afflatus).toLowerCase();

        const matchDamageType =
            damageType === 'all' ||
            charDamageType === String(damageType).toLowerCase();

        const matchRarity =
            rarity === 'all' ||
            charRarity === String(rarity);

        const matchQuery =
            query === '' ||
            charName.includes(query) ||
            charNameEU.includes(query);

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
    injectVideoCSS();

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
        if (!document.hidden && !isSafariPosterOnlyBrowser()) {
            document.querySelectorAll('.char-video').forEach(video => {
                video.play().catch(() => {});
            });
        }
    });

    loadCharacters();
});

/* =========================
   EXPOSE GLOBAL FUNCTIONS
   Cho onclick="handleSearch()" trong HTML
========================= */
window.setFilter = setFilter;
window.filterCharacters = filterCharacters;
window.handleSearch = handleSearch;
window.loadCharacters = loadCharacters;