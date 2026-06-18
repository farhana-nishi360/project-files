const userId = localStorage.getItem('userId');

// Notification variables
let notificationCheckInterval = null;
let notifications = [];
let unreadCount = 0;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    if (!userId) {
        console.log('No userId found');
        return;
    }
    
    try {
        const response = await fetch(`/api/auth/user/${userId}`);
        const data = await response.json();
        if (data.success && data.user) {
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || 'farhananishi2020@gmail.com';
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('displayUserName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?background=513B56&color=fff&rounded=true&size=80&bold=true&name=${encodeURIComponent(userName)}`;
    }
    
    let memberSince = localStorage.getItem('memberSince');
    if (!memberSince) {
        memberSince = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        localStorage.setItem('memberSince', memberSince);
    }
    document.getElementById('memberSince').textContent = memberSince;
    
    // Initialize footer navigation
    if (typeof initFooterNavigation === 'function') {
        initFooterNavigation();
    }
    
    // Initialize music navigation
    if (typeof initMusicNavigation === 'function') {
        initMusicNavigation();
    }
    
    // Initialize notification system
    initNotifications();
    requestNotificationPermission();
    
    // Load tasks
    loadTasksFromDB();
});

function goBack() {
    window.location.href = 'home.html';
}

function editUserName() {
    document.getElementById('editNameModal').style.display = 'flex';
    document.getElementById('newUserName').value = localStorage.getItem('userName');
}

async function saveUserName() {
    const newName = document.getElementById('newUserName').value.trim();
    if (!newName) {
        alert('Please enter a valid name');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/update-name', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newName })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('userName', newName);
            location.reload();
        } else {
            alert(data.message || 'Error updating name');
        }
    } catch (error) {
        alert('Error updating name');
    }
}

// ============ TASK MANAGEMENT FUNCTIONS ============

async function viewTaskSchedule() {
    const modal = document.getElementById('taskScheduleModal');
    if (modal) {
        modal.style.display = 'flex';
        await loadTasksFromDB();
    }
}

async function loadTasksFromDB() {
    if (!userId) {
        alert('Please login first');
        return;
    }
    
    try {
        const response = await fetch(`/api/auth/tasks?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.tasks) {
            let filteredTasks = data.tasks;
            if (currentFilter === 'pending') {
                filteredTasks = data.tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = data.tasks.filter(task => task.completed);
            }
            displayTasks(filteredTasks, data.tasks);
        } else {
            displayTasks([], []);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        displayTasks([], []);
    }
}

function displayTasks(filteredTasks, allTasks) {
    const tasksList = document.getElementById('tasksList');
    const allTasksArray = allTasks || filteredTasks;
    const totalTasks = allTasksArray.length;
    const completedTasks = allTasksArray.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    if (filteredTasks.length === 0) {
        if (currentFilter === 'pending') {
            tasksList.innerHTML = '<div class="empty-tasks">✅ No pending tasks! Great job!</div>';
        } else if (currentFilter === 'completed') {
            tasksList.innerHTML = '<div class="empty-tasks">📝 No completed tasks yet. Complete some tasks!</div>';
        } else {
            tasksList.innerHTML = '<div class="empty-tasks">✨ No tasks yet. Add your first task!</div>';
        }
        return;
    }
    
    tasksList.innerHTML = '';
    filteredTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}')">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}<span class="task-priority-badge priority-${task.priority}">${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}</span></div>
                <div class="task-date">Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                ${task.completed ? `<div class="task-completed-date">Completed: ${new Date(task.completedAt).toLocaleDateString()}</div>` : ''}
            </div>
            <button class="delete-task" onclick="deleteTask('${task._id}')"><i class="fas fa-trash"></i></button>
        `;
        tasksList.appendChild(taskDiv);
    });
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadTasksFromDB();
}

async function addTask() {
    const title = document.getElementById('newTaskInput').value.trim();
    const priority = document.getElementById('taskPriority').value;
    
    if (!title) {
        alert('Please enter a task');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/tasks/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, title, priority })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('newTaskInput').value = '';
            await loadTasksFromDB();
            await checkTaskReminders();
            alert('✅ Task added successfully!');
        }
    } catch (error) {
        alert('Error adding task');
    }
}

async function toggleTask(taskId) {
    try {
        const response = await fetch(`/api/auth/tasks/toggle/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (data.success) {
            await loadTasksFromDB();
            await loadProgressFromDB();
            await checkTaskReminders();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(taskId) {
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

// ============ PROGRESS FUNCTIONS ============

async function viewProgress() {
    const modal = document.getElementById('progressModal');
    if (modal) {
        modal.style.display = 'flex';
        await loadProgressFromDB();
    }
}

async function loadProgressFromDB() {
    if (!userId) return;
    
    try {
        const response = await fetch(`/api/auth/progress-reports?userId=${userId}`);
        const data = await response.json();
        if (data.success && data.reports && data.reports.length > 0) {
            displayProgress(data.reports[data.reports.length - 1]);
        } else {
            displayDefaultProgress();
        }
    } catch (error) {
        displayDefaultProgress();
    }
}

function displayProgress(report) {
    document.getElementById('weeklyStreak').textContent = report.streak || 0;
    document.getElementById('weeklyCompleted').textContent = report.completedTasks || 0;
    document.getElementById('achievementRate').textContent = (report.completionRate || 0) + '%';
    document.getElementById('insightMessage').innerHTML = report.insights || 'Complete tasks to get insights!';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyData = days.map(day => report.dailyBreakdown?.[day] || 0);
    
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: { labels: days, datasets: [{ label: 'Tasks Completed', data: dailyData, backgroundColor: '#513B56', borderRadius: 10 }] },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }
    });
}

function displayDefaultProgress() {
    document.getElementById('weeklyStreak').textContent = '0';
    document.getElementById('weeklyCompleted').textContent = '0';
    document.getElementById('achievementRate').textContent = '0%';
    document.getElementById('insightMessage').innerHTML = '🌱 Start completing tasks to see your progress!';
}

async function generateWeeklyReport() {
    if (!userId) return alert('Please login first');
    try {
        const response = await fetch('/api/auth/reports/generate-weekly', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (data.success) {
            alert('✅ Weekly report generated successfully!');
            await loadProgressFromDB();
        } else {
            alert(data.message || 'Error generating report');
        }
    } catch (error) {
        alert('Error generating report');
    }
}

function viewReportsHistory() {
    closeModal('progressModal');
    window.location.href = 'reports-history.html';
}

// ============ PASSWORD FUNCTIONS ============

function changePassword() {
    document.getElementById('changePasswordModal').style.display = 'flex';
}

async function saveNewPassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) return alert('Please fill all fields');
    if (newPassword !== confirmPassword) return alert('Passwords do not match');
    if (newPassword.length < 6) return alert('Password must be at least 6 characters');
    
    try {
        const response = await fetch('/api/auth/update-password', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentPassword, newPassword })
        });
        const data = await response.json();
        if (data.success) {
            alert('Password changed! Please login again.');
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error updating password');
    }
}
//eikhane logout er notun code deselam
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout-btn');

    if (logoutBtn) {
        // বাটনে ক্লিক করলে কি হবে তা এখানে ডিফাইন করা হলো
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault(); // পেজ যেন রিফ্রেশ না হয়ে যায়
            
            // utils.js এ থাকা আপনার তৈরি কেনার কাস্টম মডাল কল করা হলো
            const confirmLogout = await window.customConfirmAsync('Are you sure you want to logout?');
            
            if (confirmLogout) {
                // ইউজার OK চাপলে ডাটা ক্লিয়ার হবে
                localStorage.clear();
                sessionStorage.clear();
                alert('Logged out successfully'); 
                window.location.href = 'login.html'; // লগইন পেজে নিয়ে যাবে
            }
        });
    }
});
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ NOTIFICATION FUNCTIONS ============

function initNotifications() {
    const iconContainer = document.getElementById('notificationIconContainer');
    if (iconContainer) {
        iconContainer.removeEventListener('click', toggleNotificationDropdown);
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
        if (dropdown.classList.contains('open')) loadNotifications();
    }
}

async function loadNotifications() {
    if (!userId) return;
    const dropdownBody = document.getElementById('notificationDropdownBody');
    if (dropdownBody) dropdownBody.innerHTML = '<div class="loading-notifications">Loading notifications...</div>';
    
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
        notifications.push({ id: `task_${task._id}`, type: 'pending', title: 'Pending Task', message: `You have a pending task: "${task.title}"`, time: new Date(task.createdAt), priority: task.priority, taskId: task._id, read: false });
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
            <div class="notification-content"><div class="notification-title">${escapeHtml(notification.title)}</div><div class="notification-message">${escapeHtml(notification.message)}</div><div class="notification-time">${getTimeAgo(notification.time)}</div></div>
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
        await viewTaskSchedule();
    }
}

async function checkTaskReminders() {
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

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Close dropdown when clicking outside
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
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
});