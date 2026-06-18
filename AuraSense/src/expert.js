document.addEventListener('DOMContentLoaded', function() {
    // Get user info from localStorage
    const userName = localStorage.getItem('userName') || 'Guest';
    console.log('Expert page loaded for:', userName);
    
    if (typeof initMusicNavigation === 'function') {
        initMusicNavigation();
    }
    
    // Initialize notifications
    initNotifications();
    
    // User Icon Click Handler
    const profileIconBtn = document.getElementById('profileIconBtn');
    if (profileIconBtn) {
        profileIconBtn.addEventListener('click', async function() {
            const userName = localStorage.getItem('userName');
            if (userName && userName !== 'Guest') {
                window.location.href = 'profile.html';
            } else {
                if (async function deleteTask(taskId) {
    if (await window.customConfirmAsync('Delete this task?')) {
        try {
            const response = await fetch(`/api/auth/tasks/delete/${taskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            if (data.success) {
                await loadTasksFromDB();
                await checkTaskReminders();
                alert('Task deleted');
            }
        } catch (error) {
            alert('Error deleting task');
        }
    }
}
('Please login to view profile. Go to login page?')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }
});

// Go back to previous page
function goBack() {
    window.location.href = 'home.html';
}

// Connect with expert
async function connectWithExpert(expertName, phoneNumber) {
    // ১. প্রথম কনফার্মেশন (ফাংশনের আগে async এবং এখানে await যোগ করা হয়েছে)
    const userConfirmed = await window.customConfirmAsync(`Would you like to connect with ${expertName}?\n\nWe'll help you schedule a consultation.`);
    
    if (userConfirmed) {
        localStorage.setItem('selectedExpert', expertName);
        localStorage.setItem('expertPhone', phoneNumber);
        
        // ২. দ্বিতীয় কনফার্মেশন (এখানেও await যোগ করা হয়েছে)
        const action = await window.customConfirmAsync(`How would you like to connect?\n\nOK - Call ${expertName}\nCancel - Send Message`);
        
        if (action) {
            if (/(android|iphone|ipad|ipod)/i.test(navigator.userAgent)) {
                window.location.href = `tel:${phoneNumber}`;
            } else {
                // এই alert টি অটোমেটিক কাস্টম মডালে ওপেন হবে
                alert(`Call ${expertName} at: ${phoneNumber}\n\nFor mobile users, tap to call directly.`);
                
                // নোট: prompt ব্রাউজারের ডিফল্টটাই থাকবে, কারণ কপি করার জন্য ডিফল্ট ইনপুট বক্স দরকার
                prompt('Copy this number to call:', phoneNumber);
            }
        } else {
            // মেসেজ লেখার জন্য ব্রাউজারের ডিফল্ট prompt-ই কাজ করবে
            const message = prompt(`Send a message to ${expertName}:`, "Hello, I'd like to book a consultation.");
            if (message) {
                // এই alert টিও অটোমেটিক কাস্টম মডালে কনভার্ট হয়ে যাবে
                alert(`Message sent to ${expertName}!\n\nThey will contact you soon.`);
            }
        }
    }
}

// ============ NOTIFICATION FUNCTIONS ============

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
        if (dropdownBody) {
            dropdownBody.innerHTML = '<div class="empty-notifications"><i class="fas fa-exclamation-triangle"></i><p>Error loading notifications</p></div>';
        }
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
    updateNotificationDot();
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
        html += `<div class="notification-item" onclick="handleNotificationClick('${notification.id}', '${notification.taskId}')">
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

function updateNotificationDot() {
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

async function handleNotificationClick(notificationId, taskId) {
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
        notifications.splice(notificationIndex, 1);
        unreadCount = notifications.length;
        updateNotificationDot();
        displayNotifications();
    }
    if (taskId) {
        closeNotificationDropdown();
        window.location.href = 'profile.html';
    }
}

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

function markAllNotificationsRead() {
    notifications = [];
    unreadCount = 0;
    updateNotificationDot();
    displayNotifications();
}

function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) dropdown.classList.remove('open');
}

function openFullNotifications() {
    closeNotificationDropdown();
    window.location.href = 'notification.html';
}

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

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const iconContainer = document.getElementById('notificationIconContainer');
    if (dropdown && dropdown.classList.contains('open') && iconContainer && !iconContainer.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('open');
    }
});

// Escape key to close dropdown
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) dropdown.classList.remove('open');
    }
});

// Clean up interval
window.addEventListener('beforeunload', function() {
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
});

// Make functions available globally
window.openFullNotifications = openFullNotifications;
window.markAllNotificationsRead = markAllNotificationsRead;
window.handleNotificationClick = handleNotificationClick;