// Ganti URL ini dengan alamat backend PHP Anda yang bisa diakses publik
const apiUrl = "http://alamat-server-php-anda.com/data.php";

// Elements for status indicator (dalam main-content)
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Elements for warning messages
const warningTemperature = document.getElementById('warning-temperature');
const warningHumidity = document.getElementById('warning-humidity');
const warningLight = document.getElementById('warning-light');

// Elements for landing page and main content
const landingPage = document.getElementById('landing-page');
const mainContent = document.getElementById('main-content');
const enterDashboardBtn = document.getElementById('enter-dashboard-btn');

// Elements for menu and sections (sesuai dengan HTML yang diperbarui)
const menuToggle = document.getElementById('menu-toggle');
const sidebarMenu = document.getElementById('sidebar-menu');
const menuOverlay = document.getElementById('menu-overlay');
const menuRegistration = document.getElementById('menu-registration');
const menuHistory = document.getElementById('menu-history');
const backToLanding = document.getElementById('back-to-landing'); // Menggunakan ID asli dari HTML

// Sections (Sekarang elemen-elemen ini akan ditemukan karena sudah ada di HTML)
const dashboardSensors = document.getElementById('dashboard-sensors');
const registrationSection = document.getElementById('registration-section');
const historySection = document.getElementById('history-section');

// Interval untuk fetching data (akan di-manage saat switch section)
let dataInterval = null;

/**
 * @brief Updates the system status indicator and text.
 * @param {string} type - Type of status ('connecting', 'connected', 'error').
 * @param {string} message - Message to display for the status.
 */
function updateStatus(type, message) {
    // Safety check: Pastikan elemen status ada sebelum mencoba memanipulasinya
    if (!statusIndicator || !statusText) {
        console.warn("Status indicator or text element not found in DOM.");
        return;
    }
    statusIndicator.className = 'status-indicator'; // Reset classes
    if (type === 'connecting') {
        statusIndicator.classList.add('status-connecting');
        statusText.textContent = message;
    } else if (type === 'connected') {
        statusIndicator.classList.add('status-connected');
        statusText.textContent = message;
    } else if (type === 'error') {
        statusIndicator.classList.add('status-error');
        statusText.textContent = message;
    }
}

/**
 * @brief Updates the displayed connection time.
 * (Elemen 'connection-time' tidak ada di HTML yang diberikan, jadi fungsi ini tidak akan berfungsi kecuali elemen ditambahkan)
 */
function updateConnectionTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const connectionTimeEl = document.getElementById('connection-time');
    if (connectionTimeEl) {
        connectionTimeEl.textContent = `Terhubung sejak: ${timeString}`;
    }
}

/**
 * @brief Checks temperature value and displays a warning if outside normal range.
 * @param {number} temp - The current temperature value.
 */
function checkTemperatureWarning(temp) {
    if (!warningTemperature) return; // Safety check
    if (temp < 18) {
        warningTemperature.textContent = `PERINGATAN: Suhu terlalu dingin (${temp}°C)!`;
        warningTemperature.style.display = 'block';
    } else if (temp > 25) {
        warningTemperature.textContent = `PERINGATAN: Suhu terlalu panas (${temp}°C)!`;
        warningTemperature.style.display = 'block';
    } else {
        warningTemperature.style.display = 'none';
    }
}

/**
 * @brief Checks humidity value and displays a warning if outside normal range.
 * @param {number} hum - The current humidity value.
 */
function checkHumidityWarning(hum) {
    if (!warningHumidity) return; // Safety check
    if (hum < 40) {
        warningHumidity.textContent = `PERINGATAN: Kelembaban terlalu rendah (${hum}%)!`;
        warningHumidity.style.display = 'block';
    } else if (hum > 60) {
        warningHumidity.textContent = `PERINGATAN: Kelembaban terlalu tinggi (${hum}%)!`;
        warningHumidity.style.display = 'block';
    } else {
        warningHumidity.style.display = 'none';
    }
}

/**
 * @brief Checks light value and displays a warning if outside normal range.
 * @param {number} light - The current light value.
 */
function checkLightWarning(light) {
    if (!warningLight) return; // Safety check
    if (light < 50) {
        warningLight.textContent = `PERINGATAN: Cahaya terlalu gelap (${light} Lux)!`;
        warningLight.style.display = 'block';
    } else if (light > 500) { // Example threshold for very bright
        warningLight.textContent = `PERINGATAN: Cahaya terlalu terang (${light} Lux)!`;
        warningLight.style.display = 'block';
    } else {
        warningLight.style.display = 'none';
    }
}

/**
 * @brief Fetches sensor data from the API and updates the dashboard.
 *        Also triggers warning checks. Hanya dijalankan jika dashboard aktif.
 */
async function fetchSensorData() {
    // Hanya fetch jika dashboard sensors aktif
    if (!dashboardSensors || !dashboardSensors.classList.contains('active')) return;

    try {
        updateStatus('connecting', 'Mengambil data sensor...');
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data.connected) {
            // Update Temperature
            const temp = data.temperature.toFixed(1);
            document.getElementById('sensor-temperature').textContent = temp;
            document.getElementById('time-temperature').textContent = `Terakhir diperbarui: ${data.time}`;
            checkTemperatureWarning(parseFloat(temp));

            // Update Humidity
            const hum = data.humidity.toFixed(1);
            document.getElementById('sensor-humidity').textContent = hum;
            document.getElementById('time-humidity').textContent = `Terakhir diperbarui: ${data.time}`;
            checkHumidityWarning(parseFloat(hum));

            // Update Light
            const light = data.light.toFixed(0);
            document.getElementById('sensor-light').textContent = light;
            document.getElementById('time-light').textContent = `Terakhir diperbarui: ${data.time}`;
            checkLightWarning(parseFloat(light));

            updateStatus('connected', 'Terhubung ke sensor - Data real-time aktif');
        } else {
            // Sensor not connected, clear data and show error status
            document.getElementById('sensor-temperature').textContent = '--';
            document.getElementById('time-temperature').textContent = '';
            if (warningTemperature) warningTemperature.style.display = 'none'; // Hide warning if sensor not connected

            document.getElementById('sensor-humidity').textContent = '--';
            document.getElementById('time-humidity').textContent = '';
            if (warningHumidity) warningHumidity.style.display = 'none'; // Hide warning if sensor not connected

            document.getElementById('sensor-light').textContent = '--';
            document.getElementById('time-light').textContent = '';
            if (warningLight) warningLight.style.display = 'none'; // Hide warning if sensor not connected

            updateStatus('error', 'Sensor belum terhubung - Menunggu koneksi sensor');
        }
    } catch (error) {
        console.error('Gagal mengambil data sensor:', error);
        updateStatus('error', 'Koneksi error - Cek kembali sensor');
        // Hide all warnings on connection error
        if (warningTemperature) warningTemperature.style.display = 'none';
        if (warningHumidity) warningHumidity.style.display = 'none';
        if (warningLight) warningLight.style.display = 'none';
    }
}

/**
 * @brief Starts the sensor data fetching interval (hanya untuk dashboard).
 */
function startSensorFetching() {
    if (dataInterval) clearInterval(dataInterval); // Clear existing jika ada
    // updateConnectionTime(); // Initial call for connection time (dihapus karena elemen tidak ada)
    fetchSensorData(); // Initial fetch of sensor data
    dataInterval = setInterval(fetchSensorData, 3000); // Fetch data every 3 seconds
}

/**
 * @brief Stops the sensor data fetching interval.
 */
function stopSensorFetching() {
    if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
    }
}

/**
 * @brief Shows a specific section and manages fetching.
 * @param {string} sectionId - ID of the section to show (e.g., 'dashboard-sensors', 'registration-section').
 */
function showSection(sectionId) {
    // Sembunyikan semua bagian yang memiliki kelas 'section' di dalam 'main-content'
    const allSections = document.querySelectorAll('#main-content .section');
    allSections.forEach(section => section.classList.remove('active'));

    // Tampilkan bagian yang dipilih
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Kelola fetching: mulai jika dashboard, hentikan jika tidak
    if (sectionId === 'dashboard-sensors') {
        startSensorFetching();
        // Pastikan menu toggle terlihat di dashboard
        if (menuToggle) menuToggle.style.display = 'block';
    } else {
        stopSensorFetching();
        // Hapus baris ini agar menu toggle tetap terlihat di semua halaman
        // if (menuToggle) menuToggle.style.display = 'none';
    }

    // Tutup menu setelah navigasi
    closeMenu();
}

/**
 * @brief Toggles the sidebar menu visibility.
 */
function toggleMenu() {
    sidebarMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

/**
 * @brief Closes the sidebar menu.
 */
function closeMenu() {
    sidebarMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
}

/**
 * @brief Fetches and displays history data (dummy implementation; ganti dengan API jika ada).
 */
function fetchHistory() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;

    // Dummy data (ganti dengan fetch ke API history, misalnya fetch('http://api/history.php'))
    const sampleData = [
        { time: '2025-01-15 10:00:00', temp: 22.5, hum: 55.2, light: 300 },
        { time: '2025-01-15 10:03:00', temp: 23.1, hum: 56.0, light: 310 },
        { time: '2025-01-15 10:06:00', temp: 21.8, hum: 54.5, light: 290 }
    ];

    tbody.innerHTML = ''; // Clear existing
    if (sampleData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">Tidak ada data history.</td></tr>';
    } else {
        sampleData.forEach(data => {
            const row = `
                <tr>
                    <td>${data.time}</td>
                    <td>${data.temp}</td>
                    <td>${data.hum}</td>
                    <td>${data.light}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
}

// --- Event Listeners ---

// Landing Page Logic: Enter Dashboard
enterDashboardBtn.addEventListener('click', () => {
    landingPage.style.display = 'none'; // Hide the landing page
    mainContent.style.display = 'block'; // Show the main dashboard content

    // Pastikan body tidak lagi flex untuk landing page, agar main-content bisa jadi blok normal
    // Hapus manipulasi style body di sini, biarkan CSS yang mengelola
    // document.body.style.display = 'block';
    // document.body.style.justifyContent = 'initial';
    // document.body.style.alignItems = 'initial';

    // Show menu toggle
    if (menuToggle) menuToggle.style.display = 'block';

    // Set initial active section to dashboard
    showSection('dashboard-sensors');
});

// Menu Toggle (Hamburger)
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}

// Menu Overlay (Click to close)
if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}

// Menu Item: Registration
if (menuRegistration) {
    menuRegistration.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('registration-section');
    });
}

// Menu Item: History
if (menuHistory) {
    menuHistory.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('history-section');
        fetchHistory(); // Load history data
    });
}

// Back to Dashboard Button
if (backToLanding) { // Menggunakan ID asli dari HTML
    backToLanding.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('dashboard-sensors');
    });
}

// Registration Form Submit (Demo)
const regForm = document.querySelector('#registration-section form');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Registrasi berhasil! Akun Anda telah dibuat. (Ini adalah demo - integrasikan dengan backend nyata.)');
        // Di sini bisa tambahkan logic submit ke API
    });
}

// Google Registration Button (Demo)
const googleBtn = document.querySelector('#registration-section .google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        alert('Integrasi Google OAuth (Demo) - Arahkan ke halaman login Google.');
        // Di sini bisa tambahkan logic Google Sign-In
    });
}

// Initial setup: Hide main content and menu toggle until dashboard is entered
document.addEventListener('DOMContentLoaded', () => {
    mainContent.style.display = 'none';
    if (menuToggle) menuToggle.style.display = 'none';

    // Pastikan landing page terpusat saat pertama kali dimuat
    // Hapus manipulasi style body di sini, biarkan CSS yang mengelola
    // landingPage.style.display = 'flex';
    // document.body.style.display = 'flex';
    // document.body.style.justifyContent = 'center';
    // document.body.style.alignItems = 'center';
});
