// --- LOGIKA MENU HAMBURGER DAN OTENTIKASI UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeBtn = document.querySelector('.side-menu .close-btn');
    const accountLink = document.getElementById('account-link');

    // --- LOGIKA MENU HAMBURGER (Aktif di SEMUA halaman) ---
    if (hamburgerBtn && sideMenu && closeBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sideMenu.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        });
        
        closeBtn.addEventListener('click', () => {
            sideMenu.classList.remove('open');
            document.body.style.overflow = '';
        });

        sideMenu.addEventListener('click', (e) => {
            if (e.target === sideMenu) {
                sideMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    } else {
        // Jika tidak ada hamburger/side-menu (misal di halaman index.html yang tidak pakai)
        console.log("Hamburger/Side Menu tidak ditemukan di halaman ini.");
    }

    // --- LOGIKA TEMA ---
    const primaryColor = localStorage.getItem(window.THEME_COLOR_KEY) || '#0077b6';
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--primary-color-light', primaryColor + 'cc');

    // --- LOGIKA OTENTIKASI, BAN, DAN ADMIN LINK ---
    const user = window.getLoggedInUser();
    
    if (user) {
        // 1. Cek Ban Status
        const bannedUsers = window.getBannedUsers();
        const banInfo = bannedUsers.find(b => b.id === user.id);
        
        if (banInfo) {
            const unbanTime = new Date(banInfo.unbanTime);
            if (unbanTime > new Date()) {
                // User sedang di-ban
                window.localStorage.setItem('isLoggedIn', 'false'); // Paksa logout
                alert(`Akun Anda telah dibanned hingga ${unbanTime.toLocaleString()}. Anda akan di-logout.`);
                window.location.href = 'account.html';
                return; // Hentikan script
            } else {
                // Ban sudah kedaluwarsa, hapus ban
                window.unbanUser(user.id);
            }
        }

        // 2. Tampilkan Link Akun & Admin
        if (accountLink) {
             accountLink.innerHTML = `<i class="fas fa-user-circle"></i> Akun (${user.profileName})`;
             accountLink.href = 'account.html?view=profile';
        }

        if (user.role === 'admin' && sideMenu) {
             const adminLink = document.createElement('a');
             adminLink.href = 'admin.html';
             adminLink.innerHTML = `<i class="fas fa-user-lock"></i> Halaman Admin`;
             adminLink.classList.add('admin-link');
             
             const nav = sideMenu.querySelector('nav');
             const separator = sideMenu.querySelector('.separator');
             if (nav && separator) {
                nav.insertBefore(adminLink, separator.nextSibling); 
             }
        }
    } else if (accountLink) {
        accountLink.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login / Daftar`;
        accountLink.href = 'account.html?action=login';
    }
    
    // --- LOGIKA BROADCAST MESSAGE ---
    const broadcast = window.getBroadcastStatus();
    if (broadcast.active && broadcast.message) {
        const broadcastDiv = document.createElement('div');
        broadcastDiv.className = 'broadcast-bar';
        broadcastDiv.innerHTML = `<i class="fas fa-bullhorn"></i> ${broadcast.message}`;
        document.body.prepend(broadcastDiv);
    }
    
    // --- LOGIKA MAINTENANCE ---
    if (window.getMaintenanceStatus()) {
        const msg = localStorage.getItem('maintenanceMessage');
        const mainElement = document.querySelector('main');
        if (mainElement) {
             mainElement.innerHTML = `<div style="text-align: center; padding: 50px; background: #ffe0b2; border: 1px solid #ffb74d; border-radius: 10px; margin: 20px;"><h2><i class="fas fa-wrench"></i> Website Sedang Maintenance</h2><p>${msg}</p><p>Silakan coba lagi nanti.</p></div>`;
        }
    }
});