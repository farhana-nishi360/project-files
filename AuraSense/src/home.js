// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // CHECK LOGIN STATUS FIRST
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    console.log('Home page loaded for:', userName);
    
    // Update user name in greeting
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Update welcome message
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

    // YouTube Music Player Variables
    let currentPlayer = null;
    let currentMusicName = '';
    const players = {};

    // Initialize YouTube API
    function loadYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

    // This will be called by YouTube API when ready
    window.onYouTubeIframeAPIReady = function() {
        console.log('YouTube API Ready');
    };

    // Toggle music play/pause
    window.toggleMusic = function(musicId) {
        const playerDiv = document.getElementById(musicId);
        const playIcon = document.getElementById('play-' + musicId);
        
        if (!playerDiv) return;
        
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
        
        // Create or get YouTube player
        if (!players[musicId]) {
            players[musicId] = new YT.Player(musicId + ' iframe', {
                events: {
                    'onReady': function(event) {
                        event.target.playVideo();
                    }
                }
            });
        } else {
            players[musicId].playVideo();
        }
        
        // Update UI
        if (playIcon) {
            playIcon.className = 'fas fa-pause-circle';
        }
        
        currentPlayer = musicId;
        
        // Get music name
        const musicCard = playerDiv.closest('.music-card');
        if (musicCard) {
            currentMusicName = musicCard.querySelector('.music-name').textContent;
        }
        
        // Show now playing
        showNowPlaying(currentMusicName);
        
        // Visual feedback
        const musicCards = document.querySelectorAll('.music-card');
        musicCards.forEach(card => {
            card.classList.remove('playing');
        });
        if (musicCard) {
            musicCard.classList.add('playing');
        }
        
        // Store last played
        localStorage.setItem('lastPlayedMusic', currentMusicName);
    };

    // Stop current music
    function stopCurrentMusic() {
        if (currentPlayer) {
            const playerDiv = document.getElementById(currentPlayer);
            const playIcon = document.getElementById('play-' + currentPlayer);
            
            if (players[currentPlayer]) {
                players[currentPlayer].pauseVideo();
            }
            
            if (playerDiv) {
                playerDiv.style.display = 'none';
            }
            
            if (playIcon) {
                playIcon.className = 'fas fa-play-circle';
            }
            
            // Remove playing class
            document.querySelectorAll('.music-card').forEach(card => {
                card.classList.remove('playing');
            });
            
            currentPlayer = null;
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
        }
    }

    // Hide now playing indicator
    function hideNowPlaying() {
        const nowPlaying = document.getElementById('nowPlaying');
        if (nowPlaying) {
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

    // Load YouTube API
    loadYouTubeAPI();

    // Lumi chat interaction
    const lumiCard = document.querySelector('.lumi-card');
    if (lumiCard) {
        lumiCard.addEventListener('click', function() {
            alert('Opening chat with Lumi...');
            localStorage.setItem('chatWith', 'Lumi');
        });
    }

    // Consultation buttons
    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent;
            
            if (action.includes('expert')) {
                alert('Connecting you with an expert...');
                localStorage.setItem('consultationType', 'expert');
            } else if (action.includes('Book')) {
                alert('Opening appointment booking...');
                localStorage.setItem('appointmentRequest', 'true');
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
                alert(`Logged in as: ${userName}\nEmail: ${userEmail || 'No email provided'}`);
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
            logoutBtn.style.color = '#513B56';
            logoutBtn.title = 'Logout';
            
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    // Stop music if playing
                    stopCurrentMusic();
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