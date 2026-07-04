// Footer Navigation - Shared across all pages
function initFooterNavigation() {
    const homeIcon = document.getElementById('footerHome');
    const adminIcon = document.getElementById('footerAdmin');
    const musicIcon = document.getElementById('footerMusic');
    const userIcon = document.getElementById('footerUser');
    
    if (homeIcon) homeIcon.addEventListener('click', () => window.location.href = 'home.html');
    if (adminIcon) adminIcon.addEventListener('click', () => window.location.href = 'admin-login.html');
    if (musicIcon) musicIcon.addEventListener('click', () => {
        sessionStorage.setItem('scrollToMusic', 'true');
        window.location.href = 'home.html';
    });
    
    // এখানে async যোগ করা হয়েছে কাস্টম কনফার্ম মডাল সঠিকভাবে হ্যান্ডেল করার জন্য
    if (userIcon) userIcon.addEventListener('click', async () => {
        const userName = localStorage.getItem('userName');
        if (userName && userName !== 'Guest') {
            window.location.href = 'profile.html';
        } else {
            // পুরনো confirm() এর বদলে কাস্টম এসিনক্রোনাস কনফার্ম মডাল ব্যবহার করা হয়েছে
            const shouldLogin = await window.customConfirmAsync('Please login to view profile. Go to login page?');
            if (shouldLogin) {
                window.location.href = 'login.html';
            }
        }
    });
    
    // Set active state
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.bottom-nav i').forEach(icon => icon.classList.remove('active'));
    if (currentPage === 'home.html' || currentPage === '' || currentPage === '/') homeIcon?.classList.add('active');
    else if (currentPage === 'profile.html') userIcon?.classList.add('active');
    else if (currentPage === 'admin-login.html') adminIcon?.classList.add('active');
}

function checkAndScrollToMusic() {
    if (sessionStorage.getItem('scrollToMusic') === 'true') {
        sessionStorage.removeItem('scrollToMusic');
        setTimeout(() => {
            const musicSection = document.getElementById('meditationMusicSection');
            if (musicSection) musicSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initFooterNavigation();
    checkAndScrollToMusic();
});

// =========================================================================
// GLOBAL ALERTS & CONFIRMS OVERRIDE (Pasted right at the bottom)
// =========================================================================

function modernModalEngine({ title, message, isConfirmType }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-box">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="custom-modal-buttons">
                    ${isConfirmType ? `<button class="custom-modal-btn custom-modal-btn-cancel" id="modalCancelBtn">Cancel</button>` : ''}
                    <button class="custom-modal-btn custom-modal-btn-confirm" id="modalConfirmBtn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);

        const close = (value) => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve(value);
            }, 200);
        };

        overlay.querySelector('#modalConfirmBtn').addEventListener('click', () => close(true));
        
        if (isConfirmType) {
            overlay.querySelector('#modalCancelBtn').addEventListener('click', () => close(false));
        }
    });
}

// সাধারণ alert() ইন্টারসেপ্ট করার জন্য
window.alert = function(message) {
    modernModalEngine({ title: "AuraSense Notification", message: message, isConfirmType: false });
};

// confirm() চেক করার জন্য কাস্টম এসিনক্রোনাস ফাংশন
window.customConfirmAsync = async function(message) {
    return await modernModalEngine({ title: "Are you sure?", message: message, isConfirmType: true });
};