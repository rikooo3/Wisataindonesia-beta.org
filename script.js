// Data diambil dari db-sim.js
const daerahOptions = ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Bali", "DKI Jakarta", "Nusa Tenggara Timur", "Tangerang"];
const placeholders = ["Cari Wisata", "Pantai Indah, Bali", "Liburan Seru", "Wonderful Indonesia", "Mau Jalan Jalan?"];
let placeholderIndex = 0;

function animatePlaceholder() {
    const input = document.getElementById('search-input');
    if (input) {
        input.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }
}
setInterval(animatePlaceholder, 2500);

// Menghitung Rata-rata Rating Dinamis
function calculateAvgRating(ulasan) {
    if (!ulasan || ulasan.length === 0) return 0;
    const total = ulasan.reduce((sum, u) => sum + u.rating, 0);
    return (total / ulasan.length).toFixed(1);
}

// Fungsi untuk membuat bintang HTML
function getStarRatingHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<i class="fas fa-star" style="color:#ffc107;"></i>'; 
        } else if (i === fullStars && halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt" style="color:#ffc107;"></i>'; 
        } else {
            starsHtml += '<i class="far fa-star" style="color:#ddd;"></i>'; 
        }
    }
    return starsHtml;
}

// Fungsi untuk menampilkan wisata
function displayWisata(wisataList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; 
    container.innerHTML = '';
    
    if (wisataList.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; margin-top: 30px; font-size: 1.2em;">Tidak ada wisata yang ditemukan. Coba cari dengan kata kunci lain.</p>';
        return;
    }

    wisataList.forEach(wisata => {
        const avgRating = calculateAvgRating(wisata.ulasan); 
        const item = document.createElement('div');
        item.className = 'wisata-item';
        item.innerHTML = `
            <img src="${wisata.gambar[0]}" alt="${wisata.nama}">
            <div class="wisata-content">
                <h3>${wisata.nama}</h3>
                <p>Daerah: <strong>${wisata.daerah}</strong></p>
                <p>Harga: <strong>Rp ${wisata.harga.toLocaleString('id-ID')}</strong></p>
                <p>Rating: <strong>${avgRating}</strong> (${getStarRatingHTML(avgRating)})</p>
                <a href="wisata-detail.html?id=${wisata.id}" class="detail-link">Lihat Detail <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        container.appendChild(item);
    });
}

// FUNGSI LOAD DETAIL WISATA
function loadWisataDetail(wisata) {
    document.getElementById('wisata-nama').textContent = wisata.nama;
    document.getElementById('deskripsi-text').textContent = wisata.deskripsi;
    document.getElementById('harga').textContent = `Rp ${wisata.harga.toLocaleString('id-ID')}`;
    document.getElementById('lokasi').href = wisata.lokasi;

    // Rating
    const avgRating = calculateAvgRating(wisata.ulasan);
    document.getElementById('rating').textContent = avgRating;
    document.getElementById('rating-stars').innerHTML = getStarRatingHTML(avgRating);

    // --- PERBAIKAN GALERI GAMBAR BARU ---
    const galleryContainer = document.getElementById('gambar-wisata');
    galleryContainer.innerHTML = ''; // Kosongkan container untuk menghindari duplikasi

    // Gambar Utama
    const mainImageHtml = `<img id="main-image" src="${wisata.gambar[0]}" alt="${wisata.nama}" class="main-wisata-img">`;
    
    // Thumbnail Strip
    const thumbnailHtml = wisata.gambar.map(src => 
        `<img src="${src}" class="thumbnail-img" onclick="document.getElementById('main-image').src='${src}'" onerror="this.src='placeholder.jpg'">`
    ).join(''); // Tambahkan onerror untuk mengatasi URL yang tidak valid

    galleryContainer.innerHTML = `
        ${mainImageHtml}
        <div class="thumbnail-strip">
            ${thumbnailHtml}
        </div>
    `;
    
    // Ulasan
    const ulasanList = document.getElementById('ulasan-list');
    const user = window.getLoggedInUser();
    const isAdmin = user && user.role === 'admin';

    if (wisata.ulasan.length === 0) {
        ulasanList.innerHTML = '<p style="color: #666; font-style: italic;">Belum ada ulasan untuk wisata ini.</p>';
    } else {
        ulasanList.innerHTML = wisata.ulasan.map((u, index) => `
            <div class="ulasan-item">
                <div class="ulasan-header">
                    <strong>${u.nama}</strong> 
                    <span class="ulasan-rating">${getStarRatingHTML(u.rating)}</span>
                    ${isAdmin ? `<button onclick="window.deleteUlasan(${wisata.id}, ${index})" class="action-btn-small" style="background: #f0a0a0; color: #a00; border: none; margin-left: 10px;"><i class="fas fa-trash"></i> Hapus</button>` : ''}
                </div>
                <p>${u.text}</p>
            </div>
        `).join('');
    }

    // Deskripsi Toggle
    const descText = document.getElementById('deskripsi-text');
    const toggleBtn = document.getElementById('toggle-deskripsi');
    const maxLen = 200;

    if (wisata.deskripsi.length > maxLen) {
        descText.textContent = wisata.deskripsi.substring(0, maxLen) + '...';
        toggleBtn.style.display = 'block';
        let isExpanded = false;

        toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                descText.textContent = wisata.deskripsi;
                toggleBtn.innerHTML = '<i class="fas fa-angle-up"></i> Tampilkan Lebih Sedikit';
            } else {
                descText.textContent = wisata.deskripsi.substring(0, maxLen) + '...';
                toggleBtn.innerHTML = '<i class="fas fa-angle-down"></i> Tampilkan Lebih Banyak';
            }
        });
    } else {
        toggleBtn.style.display = 'none';
    }
}


// --- FUNGSI GLOBAL LAINNYA ---

// Logika Save
window.toggleSavedWisata = (wisataId) => {
    const user = window.getLoggedInUser();
    if (!user) {
        alert("Anda harus login untuk menyimpan rencana perjalanan!");
        window.location.href = 'account.html?action=login'; 
        return;
    }

    const index = user.saved.indexOf(wisataId);
    const saveBtn = document.getElementById('save-btn');

    if (index === -1) {
        user.saved.push(wisataId);
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Tersimpan';
        saveBtn.classList.add('saved');
        alert("Wisata berhasil disimpan ke rencana Anda!");
    } else {
        user.saved.splice(index, 1);
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i> Simpan';
        saveBtn.classList.remove('saved');
        alert("Wisata dihapus dari rencana Anda.");
    }
    window.saveUserData(user); 
}

// Logika Tambah Ulasan
window.handleAddUlasan = (e, wisata) => {
    e.preventDefault();
    
    const user = window.getLoggedInUser();
    if (!user) {
        alert("Anda harus login untuk memberikan ulasan!");
        window.location.href = 'account.html?action=login';
        return;
    }

    const ratingInput = document.getElementById('rating-input');
    const ulasanInput = document.getElementById('ulasan-input');
    const rating = parseFloat(ratingInput.value);
    const text = ulasanInput.value.trim();

    if (text === "" || rating < 1 || rating > 5) {
        alert("Rating dan ulasan tidak boleh kosong dan rating harus antara 1-5.");
        return;
    }
    
    const newUlasan = { nama: user.profileName, rating: rating, text: text, date: new Date().toLocaleDateString() };
    wisata.ulasan.unshift(newUlasan); 

    if (window.updateWisata(wisata)) {
        alert('Ulasan berhasil ditambahkan!');
        window.location.reload(); 
    } else {
        alert('Gagal menyimpan ulasan.');
    }
}

// Logika Hapus Ulasan (Admin Only)
window.deleteUlasan = (wisataId, ulasanIndex) => {
    if (!window.getLoggedInUser() || window.getLoggedInUser().role !== 'admin') {
        alert("Akses ditolak.");
        return;
    }
    
    if (!confirm(`Yakin ingin menghapus ulasan ke-${ulasanIndex + 1} ini?`)) return;

    const data = window.getWisataData();
    const wisata = data.find(w => w.id === wisataId);

    if (wisata && wisata.ulasan[ulasanIndex]) {
        wisata.ulasan.splice(ulasanIndex, 1);
        
        if (window.updateWisata(wisata)) {
            alert('Ulasan berhasil dihapus!');
            window.location.reload();
        }
    }
}

// Logika Filter
function filterWisata() {
    const currentWisataData = window.getWisataData();
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    const daerah = document.getElementById('filter-daerah')?.value || '';
    const hargaFilter = document.getElementById('filter-harga')?.value || '';
    const rating = document.getElementById('filter-rating')?.value || '';

    const filtered = currentWisataData.filter(w => {
        const avgRating = parseFloat(calculateAvgRating(w.ulasan));
        let hargaMatch = true;
        if (hargaFilter === '0-200000') {
            hargaMatch = w.harga <= 200000;
        } else if (hargaFilter === '200000-500000') {
            hargaMatch = w.harga > 200000 && w.harga <= 500000;
        } else if (hargaFilter === '>500000') {
            hargaMatch = w.harga > 500000;
        }

        return (w.nama.toLowerCase().includes(search) || w.daerah.toLowerCase().includes(search)) &&
               (!daerah || w.daerah === daerah) &&
               hargaMatch &&
               (!rating || avgRating >= parseFloat(rating));
    });
    displayWisata(filtered, 'wisata-list');
}

let debounceTimer;
function filterWisataDebounced() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterWisata, 300); 
}

// --- INISIALISASI HALAMAN ---
document.addEventListener('DOMContentLoaded', () => {
    // Home Wisata (wisata-home.html)
    if (document.getElementById('search-filter')) {
        const daerahSelect = document.getElementById('filter-daerah');
        daerahOptions.forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            daerahSelect.appendChild(option);
        });

        document.getElementById('filter-btn').addEventListener('click', filterWisata);
        document.getElementById('search-input').addEventListener('input', filterWisataDebounced);
        document.getElementById('filter-daerah').addEventListener('change', filterWisata);
        document.getElementById('filter-harga').addEventListener('change', filterWisata);
        document.getElementById('filter-rating').addEventListener('change', filterWisata);

        filterWisata(); // Panggil pertama kali untuk menampilkan semua data
    }
    
    // Home Utama (index.html) - menggunakan fungsi displayWisata
    if (document.querySelector('.home-main')) {
         const currentWisataData = window.getWisataData(); 
         if (currentWisataData && currentWisataData.length > 0) {
             const rekomendasi = currentWisataData.sort(() => 0.5 - Math.random()).slice(0, 4);
             displayWisata(rekomendasi, 'rekomendasi-list');
         }
    }
    
    // Detail Wisata (wisata-detail.html)
    if (window.location.pathname.includes('wisata-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id'));
        const wisata = window.getWisataData().find(w => w.id === id);

        if (wisata) {
            loadWisataDetail(wisata);

            // Logika Toggle Save
            const user = window.getLoggedInUser();
            const isSaved = user?.saved.includes(wisata.id) || false;

            const saveBtn = document.getElementById('save-btn');
            if(saveBtn) {
                saveBtn.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i> Tersimpan' : '<i class="far fa-bookmark"></i> Simpan';
                if (isSaved) saveBtn.classList.add('saved');
                saveBtn.addEventListener('click', () => window.toggleSavedWisata(wisata.id));
            }
            
            // Logika Ulasan Form
            const ulasanForm = document.getElementById('tambah-ulasan');
            if (ulasanForm) {
                 ulasanForm.addEventListener('submit', (e) => window.handleAddUlasan(e, wisata));
            }
        } else {
             document.querySelector('main').innerHTML = `<h2 style="text-align: center; margin-top: 50px;">Wisata tidak ditemukan.</h2>`;
        }
    }
});