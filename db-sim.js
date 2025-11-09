// --- SIMULASI DATABASE LOKAL DENGAN LOCALSTORAGE ---
const ADMIN_USER = { username: "Rikooo", password: "Arif02", role: "admin" };
const MAINTENANCE_KEY = 'websiteMaintenance';
const ALL_USERS_KEY = 'allUsers';
const WISATA_DATA_KEY = 'wisataData';
const THEME_COLOR_KEY = 'themePrimaryColor';
const BROADCAST_KEY = 'broadcastMessage';
const BAN_STATUS_KEY = 'bannedUsers'; // Kunci untuk status ban

const initialWisataData = [
    { id: 1, nama: "Pantai Kuta, Bali", daerah: "Bali", harga: 50000, rating: 4.5, ulasan: [{ nama: "Anonim", rating: 5, text: "Pantai indah sekali!" }], deskripsi: "Pantai Kuta adalah pantai terkenal di Bali dengan pasir putih dan ombak besar. Cocok untuk bersantai dan olahraga air.", gambar: ["kutabali/bali1.jfif", "kutabali/bali2.jfif", "kutabali/bali3.jfif", "kutabali/bali4.jfif"], lokasi: "#" },
    { id: 2, nama: "Pantai Ancol, Jakarta", daerah: "DKI Jakarta", harga: 30000, rating: 3.8, ulasan: [{ nama: "Pengunjung", rating: 4, text: "Dekat dengan kota." }], deskripsi: "Pantai berpasir ramai ini menjadi tempat anak-anak bermain di air yang tenang dengan penjaga pantai & sunset.", gambar: ["ancol/ancol1.jpeg", "ancol/ancol2.jfif", "ancol/ancol3.jfif", "ancol/ancol4.jfif"], lokasi: "#" },
    { id: 3, nama: "Pantai Ulee Lheue, Aceh", daerah: "Aceh", harga: 20000, rating: 4.2, ulasan: [{ nama: "Lokal", rating: 4, text: "Tenang dan indah." }], deskripsi: "Pantai Ulee Lheue menawarkan keindahan laut Aceh yang masih alami. Dengan pasir putih dan air laut jernih, pantai ini ideal untuk diving.", gambar: ["ulee/ule1.jfif", "ulee/ule2.jfif", "ulee/ule3.jfif", "ulee/ule4.jfif"], lokasi: "#" },
    { id: 5, nama: "Pink Beach, NTT", daerah: "Nusa Tenggara Timur", harga: 100000, rating: 5.0, ulasan: [{ nama: "Wisatawan", rating: 5, text: "Pantai merah muda yang menakjubkan!" }], deskripsi: "Pink Beach, atau Pantai Merah Muda, adalah salah satu dari tujuh pantai berpasir merah muda di dunia.", gambar: ["pink1/pink1.jpg", "pink1/pink2.jfif", "pink1/pink3.jfif", "pink1/pink4.jfif"], lokasi: "#" },
];

function initializeDB() {
    // Inisialisasi User (pastikan Admin ada)
    let users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
    if (!users || !users.find(u => u.username === ADMIN_USER.username)) {
        users = [
            { id: 1, username: ADMIN_USER.username, password: ADMIN_USER.password, role: ADMIN_USER.role, profileName: "Admin Rikooo", saved: [] },
        ];
        const oldUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY)) || [];
        let nextId = 2;
        oldUsers.forEach(u => {
             if (u.username !== ADMIN_USER.username) {
                 u.id = u.id || nextId++; // Tambahkan ID jika belum ada
                 users.push(u);
             }
        });
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }
    
    // Inisialisasi Data Wisata
    if (!localStorage.getItem(WISATA_DATA_KEY) || JSON.parse(localStorage.getItem(WISATA_DATA_KEY)).length === 0) {
        localStorage.setItem(WISATA_DATA_KEY, JSON.stringify(initialWisataData));
    }
    
    // Inisialisasi Sistem
    if (localStorage.getItem(MAINTENANCE_KEY) === null) {
        localStorage.setItem(MAINTENANCE_KEY, 'false');
        localStorage.setItem('maintenanceMessage', 'Website sedang dalam perbaikan rutin.');
    }
    if (localStorage.getItem(THEME_COLOR_KEY) === null) {
        localStorage.setItem(THEME_COLOR_KEY, '#0077b6'); 
    }
    if (localStorage.getItem(BROADCAST_KEY) === null) {
        localStorage.setItem(BROADCAST_KEY, JSON.stringify({ active: false, message: "" }));
    }
    if (localStorage.getItem(BAN_STATUS_KEY) === null) {
        localStorage.setItem(BAN_STATUS_KEY, JSON.stringify([]));
    }
}
initializeDB();

// --- FUNGSI GLOBAL DATABASE DAN OTENTIKASI ---
window.getWisataData = () => JSON.parse(localStorage.getItem(WISATA_DATA_KEY));
window.saveWisataData = (data) => { localStorage.setItem(WISATA_DATA_KEY, JSON.stringify(data)); };
window.updateWisata = (updatedWisata) => {
    const data = getWisataData();
    const index = data.findIndex(w => w.id === updatedWisata.id);
    if (index !== -1) {
        data[index] = updatedWisata;
        saveWisataData(data);
        return true;
    }
    return false;
};

window.getLoggedInUser = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const username = localStorage.getItem('currentUsername');
        const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
        return users.find(u => u.username === username);
    }
    return null;
};
window.saveUserData = (user) => {
    const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }
};

window.getNextId = () => {
    const data = getWisataData();
    return Math.max(...data.map(w => w.id), 0) + 1;
};
window.getMaintenanceStatus = () => localStorage.getItem(MAINTENANCE_KEY) === 'true';

// FUNGSI ADMIN BARU
window.getBroadcastStatus = () => JSON.parse(localStorage.getItem(BROADCAST_KEY));
window.setBroadcastStatus = (active, message) => {
    localStorage.setItem(BROADCAST_KEY, JSON.stringify({ active, message }));
};
window.getAllUsers = () => JSON.parse(localStorage.getItem(ALL_USERS_KEY));
window.getBannedUsers = () => JSON.parse(localStorage.getItem(BAN_STATUS_KEY));
window.banUser = (userId, banUntilTimestamp) => {
    const bannedUsers = window.getBannedUsers();
    const filteredBanned = bannedUsers.filter(b => b.id !== userId);
    filteredBanned.push({ id: userId, unbanTime: banUntilTimestamp });
    localStorage.setItem(BAN_STATUS_KEY, JSON.stringify(filteredBanned));
};
window.unbanUser = (userId) => {
    const bannedUsers = window.getBannedUsers();
    const filteredBanned = bannedUsers.filter(b => b.id !== userId);
    localStorage.setItem(BAN_STATUS_KEY, JSON.stringify(filteredBanned));
};


window.THEME_COLOR_KEY = THEME_COLOR_KEY;