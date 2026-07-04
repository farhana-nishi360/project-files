document.addEventListener('DOMContentLoaded', function() {
    
    // ============ GET USER NAME (PRIORITIZE ADMIN) ============
    let userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminName = localStorage.getItem('adminName');
    
    if (isAdmin && adminName) {
        userName = adminName;
        localStorage.setItem('userName', adminName);
        console.log('👑 Admin logged in as:', userName);
    } else {
        console.log('👤 Regular user logged in as:', userName);
    }
    
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

    // Function to scroll to meditation music section
    function scrollToMeditationMusic() {
        const musicSection = document.getElementById('meditationMusicSection');
        if (musicSection) {
            musicSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            musicSection.style.transition = 'background 0.5s ease';
            musicSection.style.background = 'rgba(81, 59, 86, 0.05)';
            musicSection.style.borderRadius = '20px';
            setTimeout(() => {
                musicSection.style.background = '';
            }, 1000);
        }
    }

    // Add event listener for music icon in bottom navigation
    const bottomMusicIcon = document.getElementById('bottomMusicIcon');
    if (bottomMusicIcon) {
        bottomMusicIcon.addEventListener('click', scrollToMeditationMusic);
    }

    // YouTube iFrame Player Variables
    let currentPlayer = null;
    let currentMusicName = '';

    // Toggle music play/pause with iFrame
    window.toggleMusic = function(musicId) {
        console.log('Toggling music:', musicId);
        
        const playerDiv = document.getElementById(musicId);
        if (!playerDiv) {
            console.error('Player div not found for:', musicId);
            return;
        }
        
        const playIcon = document.getElementById('play-' + musicId);
        const musicCard = playerDiv.closest('.music-card');
        const musicName = musicCard.querySelector('.music-name').textContent;
        
        if (currentPlayer === musicId) {
            stopCurrentMusic();
            return;
        }
        
        if (currentPlayer) {
            stopCurrentMusic();
        }
        
        playerDiv.style.display = 'block';
        
        if (playIcon) {
            playIcon.className = 'fas fa-pause-circle';
        }
        
        currentPlayer = musicId;
        currentMusicName = musicName;
        
        document.querySelectorAll('.music-card').forEach(card => {
            card.classList.remove('playing');
        });
        musicCard.classList.add('playing');
        
        showNowPlaying(musicName);
        
        localStorage.setItem('lastPlayedMusic', musicName);
    };

    // Stop current music
    function stopCurrentMusic() {
        if (currentPlayer) {
            const playerDiv = document.getElementById(currentPlayer);
            const playIcon = document.getElementById('play-' + currentPlayer);
            
            if (playerDiv) {
                playerDiv.style.display = 'none';
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

    // Consultation buttons
    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent;
            
            if (action.includes('expert')) {
                window.location.href = 'expert.html';
            } else if (action.includes('Book')) {
                window.location.href = 'booking.html';
            }
        });
    });

    // ============ BOTTOM NAVIGATION ============
    document.querySelectorAll('.bottom-nav i').forEach(icon => {
        icon.addEventListener('click', async function() {
            document.querySelectorAll('.bottom-nav i').forEach(i => {
                i.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const iconClass = this.className;
            if (iconClass.includes('fa-home')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (iconClass.includes('fa-user-shield')) {
                window.location.href = 'admin-login.html';
            } else if (iconClass.includes('fa-music')) {
                scrollToMeditationMusic();
            } else if (iconClass.includes('fa-user')) {
                const currentUser = localStorage.getItem('userName') || 'Guest';
                const isAdminUser = localStorage.getItem('isAdmin') === 'true';
                const adminNameUser = localStorage.getItem('adminName');
                
                if (isAdminUser && adminNameUser) {
                    window.location.href = 'admin-view-users.html';
                } else if (currentUser !== 'Guest') {
                    window.location.href = 'profile.html';
                } else {
                    if (await window.customConfirmAsync('Please login to view profile. Go to login page?')) {
                        window.location.href = 'login.html';
                    }
                }
            }
        });
    });

    // ============ HEADER PROFILE ICON ============
    const profileIcon = document.querySelector('.fa-user-circle');
    if (profileIcon) {
        profileIcon.addEventListener('click', async function() {
            const currentUser = localStorage.getItem('userName') || 'Guest';
            const isAdminUser = localStorage.getItem('isAdmin') === 'true';
            const adminNameUser = localStorage.getItem('adminName');
            
            if (isAdminUser && adminNameUser) {
                window.location.href = 'admin-view-users.html';
            } else if (currentUser && currentUser !== 'Guest') {
                window.location.href = 'profile.html';
            } else {
                if (await window.customConfirmAsync('You are not logged in. Go to login page?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // ============ GREETING ANIMATION ============
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

    // ============ LOGOUT BUTTON ============
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
            
            logoutBtn.addEventListener('click', async function() {
                if (await window.customConfirmAsync('Are you sure you want to logout?')) {
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

    // ============ NOTIFICATION SYSTEM ============
    let notificationCheckInterval = null;
    let notifications = [];
    let unreadCount = 0;

    function initNotifications() {
        const iconContainer = document.getElementById('notificationIconContainer');
        if (iconContainer) {
            iconContainer.addEventListener('click', toggleNotificationDropdown);
        }
        loadNotifications();
        checkTaskReminders();
        if (notificationCheckInterval) clearInterval(notificationCheckInterval);
        notificationCheckInterval = setInterval(checkTaskReminders, 30000);
    }

    function toggleNotificationDropdown(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.toggle('open');
            if (dropdown.classList.contains('open')) {
                loadNotifications();
            }
        }
    }

    async function loadNotifications() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const dropdownBody = document.getElementById('notificationDropdownBody');
        if (dropdownBody) {
            dropdownBody.innerHTML = '<div class="loading-notifications">Loading notifications...</div>';
        }
        
        try {
            const response = await fetch(`/api/auth/tasks?userId=${userId}`);
            const data = await response.json();
            
            if (data.success && data.tasks) {
                generateNotifications(data.tasks);
                displayNotifications();
            } else if (dropdownBody) {
                dropdownBody.innerHTML = '<div class="empty-notifications"><i class="fas fa-check-circle"></i><p>No notifications</p><small>You\'re all caught up!</small></div>';
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    function generateNotifications(tasks) {
        const today = new Date().toDateString();
        notifications = [];
        const todayTasks = tasks.filter(task => new Date(task.createdAt).toDateString() === today && !task.completed);
        todayTasks.forEach(task => {
            notifications.push({ 
                id: `task_${task._id}`, 
                type: 'pending', 
                title: 'Pending Task', 
                message: `You have a pending task: "${task.title}"`, 
                time: new Date(task.createdAt), 
                priority: task.priority, 
                taskId: task._id, 
                read: false 
            });
        });
        
        notifications.sort((a, b) => b.time - a.time);
        unreadCount = notifications.length;
        updateNotificationDotLocal();
    }

    function displayNotifications() {
        const dropdownBody = document.getElementById('notificationDropdownBody');
        if (!dropdownBody) return;
        
        if (notifications.length === 0) {
            dropdownBody.innerHTML = '<div class="empty-notifications"><i class="fas fa-check-circle"></i><p>No notifications</p><small>You\'re all caught up!</small></div>';
            return;
        }
        
        let html = '';
        notifications.forEach(notification => {
            const icon = notification.type === 'pending' ? 'fa-clock' : 'fa-exclamation-triangle';
            const iconColor = notification.type === 'pending' ? '#ff9800' : '#dc3545';
            html += `<div class="notification-item" onclick="handleNotificationClickLocal('${notification.id}', '${notification.taskId}')">
                <div class="notification-icon" style="background: ${iconColor}20;"><i class="fas ${icon}" style="color: ${iconColor};"></i></div>
                <div class="notification-content">
                    <div class="notification-title">${escapeHtml(notification.title)}</div>
                    <div class="notification-message">${escapeHtml(notification.message)}</div>
                    <div class="notification-time">${getTimeAgo(notification.time)}</div>
                </div>
            </div>`;
        });
        dropdownBody.innerHTML = html;
    }

    function updateNotificationDotLocal() {
        const dot = document.getElementById('notificationDot');
        if (!dot) return;
        dot.classList.remove('show', 'has-number');
        dot.textContent = '';
        if (unreadCount > 0) {
            dot.classList.add('show');
            if (unreadCount > 9) {
                dot.classList.add('has-number');
                dot.textContent = unreadCount > 99 ? '99+' : unreadCount;
            }
        }
    }

    window.handleNotificationClickLocal = async function(notificationId, taskId) {
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
            notifications.splice(notificationIndex, 1);
            unreadCount = notifications.length;
            updateNotificationDotLocal();
            displayNotifications();
        }
        if (taskId) {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) dropdown.classList.remove('open');
            window.location.href = 'profile.html';
        }
    };

    async function checkTaskReminders() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const response = await fetch(`/api/auth/tasks?userId=${userId}`);
            const data = await response.json();
            if (data.success && data.tasks) {
                generateNotifications(data.tasks);
                displayNotifications();
            }
        } catch (error) {}
    }

    window.openFullNotifications = function() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) dropdown.classList.remove('open');
        window.location.href = 'notification.html';
    };

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initNotifications();

    // ============ HEADER PROFILE BUTTON ============
    const profileIconBtn = document.getElementById('profileIconBtn');
    if (profileIconBtn) {
        profileIconBtn.addEventListener('click', async function() {
            const currentUser = localStorage.getItem('userName') || 'Guest';
            const isAdminUser = localStorage.getItem('isAdmin') === 'true';
            const adminNameUser = localStorage.getItem('adminName');
            
            if (isAdminUser && adminNameUser) {
                window.location.href = 'admin-view-users.html';
            } else if (currentUser && currentUser !== 'Guest') {
                window.location.href = 'profile.html';
            } else {
                if (await window.customConfirmAsync('Please login to view profile. Go to login page?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // ============ CLOSE DROPDOWN ON OUTSIDE CLICK ============
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('notificationDropdown');
        const iconContainer = document.getElementById('notificationIconContainer');
        if (dropdown && dropdown.classList.contains('open') && iconContainer && !iconContainer.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) dropdown.classList.remove('open');
        }
    });

    window.addEventListener('beforeunload', function() {
        if (notificationCheckInterval) {
            clearInterval(notificationCheckInterval);
        }
    });
});

// ============ GLOBAL FUNCTIONS (for onclick attributes) ============
function goToHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToAdminLogin() {
    window.location.href = 'admin-login.html';
}

function goToProfile() {
    const userName = localStorage.getItem('userName');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminName = localStorage.getItem('adminName');
    
    if (isAdmin && adminName) {
        window.location.href = 'admin-view-users.html';
    } else if (userName && userName !== 'Guest') {
        window.location.href = 'profile.html';
    } else {
        if (confirm('Please login to view profile. Go to login page?')) {
            window.location.href = 'login.html';
        }
    }
}

function goToMusic() {
    const musicSection = document.getElementById('meditationMusicSection');
    if (musicSection) {
        musicSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        musicSection.style.transition = 'background 0.5s ease';
        musicSection.style.background = 'rgba(81, 59, 86, 0.05)';
        musicSection.style.borderRadius = '20px';
        setTimeout(() => {
            musicSection.style.background = '';
        }, 1000);
    }
}

window.scrollToMeditationMusic = function() {
    const musicSection = document.getElementById('meditationMusicSection');
    if (musicSection) {
        musicSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        musicSection.style.transition = 'background 0.5s ease';
        musicSection.style.background = 'rgba(81, 59, 86, 0.05)';
        musicSection.style.borderRadius = '20px';
        setTimeout(() => {
            musicSection.style.background = '';
        }, 1000);
    }
};