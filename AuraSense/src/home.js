document.addEventListener('DOMContentLoaded', function() {
    
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    console.log('Home page loaded for:', userName);
    
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        const hour = new Date().getHours();
        if (hour < 12) {
            welcomeMessage.textContent = 'Good morning!';
        } else if (hour < 18) {
            welcomeMessage.textContent = 'Good afternoon!';
        } else {
            welcomeMessage.textContent = 'Good evening!';
        }
    }

    // YouTube iFrame Player Variables
    let currentPlayer = null;
    let currentMusicName = '';

    // Toggle music play/pause with iFrame
    window.toggleMusic = function(musicId) {
        const playerDiv = document.getElementById(musicId);
        const playIcon = document.getElementById('play-' + musicId);
        const musicCard = playerDiv.closest('.music-card');
        const musicName = musicCard.querySelector('.music-name').textContent;
        
        // If this music is already playing, stop it
        if (currentPlayer === musicId) {
            stopCurrentMusic();
            return;
        }
        
        // Stop current music if playing
        if (currentPlayer) {
            stopCurrentMusic();
        }
        
        // Show and play new music
        playerDiv.style.display = 'block';
        
        // Change play icon to pause
        if (playIcon) {
            playIcon.className = 'fas fa-pause-circle';
        }
        
        currentPlayer = musicId;
        currentMusicName = musicName;
        
        // Add playing class to music card
        document.querySelectorAll('.music-card').forEach(card => {
            card.classList.remove('playing');
        });
        musicCard.classList.add('playing');
        
        // Show now playing indicator
        showNowPlaying(musicName);
        
        // Store last played
        localStorage.setItem('lastPlayedMusic', musicName);
    };

    // Stop current music
    function stopCurrentMusic() {
        if (currentPlayer) {
            const playerDiv = document.getElementById(currentPlayer);
            const playIcon = document.getElementById('play-' + currentPlayer);
            
            if (playerDiv) {
                playerDiv.style.display = 'none';
                // Stop the iframe video by reloading
                const iframe = playerDiv.querySelector('iframe');
                if (iframe) {
                    const src = iframe.src;
                    iframe.src = '';
                    setTimeout(() => {
                        iframe.src = src;
                    }, 100);
                }
            }
            
            if (playIcon) {
                playIcon.className = 'fas fa-play-circle';
            }
            
            // Remove playing class
            document.querySelectorAll('.music-card').forEach(card => {
                card.classList.remove('playing');
            });
            
            currentPlayer = null;
            currentMusicName = '';
            hideNowPlaying();
        }
    }

    // Show now playing indicator
    function showNowPlaying(musicName) {
        const nowPlaying = document.getElementById('nowPlaying');
        const nowPlayingText = document.getElementById('nowPlayingText');
        if (nowPlaying && nowPlayingText) {
            nowPlayingText.textContent = `Now playing: ${musicName}`;
            nowPlaying.style.display = 'flex';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                if (!currentPlayer) {
                    nowPlaying.style.display = 'none';
                }
            }, 5000);
        }
    }

    // Hide now playing indicator
    function hideNowPlaying() {
        const nowPlaying = document.getElementById('nowPlaying');
        if (nowPlaying && !currentPlayer) {
            nowPlaying.style.display = 'none';
        }
    }

    // Stop all music button
    const stopAllBtn = document.getElementById('stopAllMusic');
    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', function() {
            stopCurrentMusic();
        });
    }

    // Lumi chat interaction
    const lumiCard = document.querySelector('.lumi-card');
    if (lumiCard) {
        lumiCard.addEventListener('click', function() {
            alert('Opening chat with Lumi...');
            localStorage.setItem('chatWith', 'Lumi');
        });
    }

    // Consultation buttons - UPDATED to navigate to new pages
    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent;
            
            if (action.includes('expert')) {
                // Navigate to Talk with Expert page
                window.location.href = 'expert.html';
            } else if (action.includes('Book')) {
                // Navigate to Book a Call page
                window.location.href = 'booking.html';
            }
        });
    });

    // Bottom navigation
    document.querySelectorAll('.bottom-nav i').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.bottom-nav i').forEach(i => {
                i.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const iconClass = this.className;
            if (iconClass.includes('fa-home')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (iconClass.includes('fa-compass')) {
                alert('Explore page coming soon!');
            } else if (iconClass.includes('fa-music')) {
                alert('Music library coming soon!');
            } else if (iconClass.includes('fa-user')) {
                if (userName !== 'Guest') {
                    alert(`Profile for ${userName}\nEmail: ${userEmail}`);
                } else {
                    if (confirm('Please login to view profile. Go to login page?')) {
                        window.location.href = 'login.html';
                    }
                }
            }
        });
    });

    // Header notifications
    const notificationBell = document.querySelector('.fa-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            alert('No new notifications');
        });
    }

    // Header profile icon
    const profileIcon = document.querySelector('.fa-user-circle');
    if (profileIcon) {
        profileIcon.addEventListener('click', function() {
            if (userName !== 'Guest') {
                alert(`Logged in as: ${userName}\nEmail: ${userEmail}`);
            } else {
                if (confirm('You are not logged in. Go to login page?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // Greeting animation
    const greeting = document.querySelector('.greeting h1');
    if (greeting) {
        greeting.style.opacity = '0';
        greeting.style.transform = 'translateY(20px)';

        setTimeout(() => {
            greeting.style.transition = 'all 0.5s ease';
            greeting.style.opacity = '1';
            greeting.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add logout button
    function addLogoutButton() {
        const headerIcons = document.querySelector('.header-icons');
        if (headerIcons && !document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('i');
            logoutBtn.id = 'logout-btn';
            logoutBtn.className = 'fas fa-sign-out-alt';
            logoutBtn.style.marginLeft = '10px';
            logoutBtn.style.cursor = 'pointer';
            logoutBtn.style.color = '#ffffff';
            logoutBtn.style.fontSize = '22px';
            logoutBtn.title = 'Logout';
            
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    stopCurrentMusic(); // Stop music on logout
                    localStorage.clear();
                    alert('Logged out successfully');
                    window.location.href = 'login.html';
                }
            });
            
            headerIcons.appendChild(logoutBtn);
        }
    }
    
    addLogoutButton();

});