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
    if (userIcon) userIcon.addEventListener('click', () => {
        const userName = localStorage.getItem('userName');
        if (userName && userName !== 'Guest') window.location.href = 'profile.html';
        else if (confirm('Please login to view profile. Go to login page?')) window.location.href = 'login.html';
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
