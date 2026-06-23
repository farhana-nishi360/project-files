document.addEventListener('DOMContentLoaded', function() {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    console.log('Booking page loaded for:', userName);
    
    // Load email history from database
    loadEmailHistoryFromDB();
    
    // Initialize music navigation
    if (typeof initMusicNavigation === 'function') {
        initMusicNavigation();
    }
    
    // Initialize notifications
    initNotifications();
    
    // User Icon Click Handler
    const profileIconBtn = document.getElementById('profileIconBtn');
    if (profileIconBtn) {
        profileIconBtn.addEventListener('click', async function() {
            const currentUserName = localStorage.getItem('userName');
            if (currentUserName && currentUserName !== 'Guest') {
                window.location.href = 'profile.html';
            } else {
                if (window.customConfirmAsync) {
                    const goToLogin = await window.customConfirmAsync('Please login to view profile. Go to login page?');
                    if (goToLogin) {
                        window.location.href = 'login.html';
                    }
                } else {
                    if (confirm('Please login to view profile. Go to login page?')) {
                        window.location.href = 'login.html';
                    }
                }
            }
        });
    }
});

function goBack() {
    window.location.href = 'home.html';
}

// Visit Website
function visitWebsite(url) {
    window.open(url, '_blank');
}

// Make phone call
function makeCall(phoneNumber) {
    if (/(android|iphone|ipad|ipod)/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
    } else {
        alert(`Call this number: ${phoneNumber}`);
        navigator.clipboard.writeText(phoneNumber);
        alert('Phone number copied to clipboard!');
    }
}

// Open WhatsApp
function openWhatsApp(phoneNumber, partnerName) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const message = `Hello ${partnerName},%0A%0AI'm ${userName} from AuraSense. I would like to schedule an appointment.%0A%0APlease let me know your available time slots.%0A%0AThank you.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    try {
        window.open(whatsappUrl, '_blank');
        saveToHistory(partnerName, phoneNumber, 'WhatsApp');
    } catch (error) {
        console.error("Error in openWhatsApp:", error);
    }
}

// Save to history
function saveToHistory(name, contact, method) {
    const history = JSON.parse(localStorage.getItem('contactHistory') || '[]');
    history.unshift({
        id: Date.now(),
        name: name,
        contact: contact,
        method: method,
        date: new Date().toLocaleString(),
        user: localStorage.getItem('userName') || 'Guest'
    });
    localStorage.setItem('contactHistory', JSON.stringify(history.slice(0, 50)));
}

// ============ EMAIL FUNCTIONS WITH DATABASE ============

// Save email to database
async function saveEmailToDatabase(partnerName, partnerEmail, subject, body, status = 'sent') {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    if (!userId) {
        console.warn('No userId found, saving to localStorage only');
        saveEmailToLocalStorage(partnerName, partnerEmail, subject, body, status);
        return;
    }
    
    try {
        const response = await fetch('/api/auth/save-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                to: partnerEmail,
                toName: partnerName,
                subject: subject,
                body: body,
                emailType: 'appointment',
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Email saved to database with status: ${status}`);
            saveEmailToLocalStorage(partnerName, partnerEmail, subject, body, status);
        } else {
            console.error('Failed to save email:', data.message);
            saveEmailToLocalStorage(partnerName, partnerEmail, subject, body, status);
        }
    } catch (error) {
        console.error('Error saving email to database:', error);
        saveEmailToLocalStorage(partnerName, partnerEmail, subject, body, status);
    }
}

// Save email to localStorage (fallback)
function saveEmailToLocalStorage(partnerName, partnerEmail, subject, body, status = 'sent') {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Check if this email already exists as draft to avoid duplicates
    const existingEmails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    const isDuplicate = existingEmails.some(e => 
        e.toEmail === partnerEmail && 
        e.subject === subject && 
        e.status === 'draft' && 
        status === 'draft'
    );
    
    if (isDuplicate) {
        console.log('⏭️ Duplicate draft email detected, skipping save');
        return;
    }
    
    const emailRecord = {
        id: Date.now(),
        toName: partnerName,
        toEmail: partnerEmail,
        subject: subject,
        body: body,
        sentAt: new Date().toLocaleString(),
        status: status,
        user: userName,
        userEmail: userEmail
    };
    
    existingEmails.unshift(emailRecord);
    localStorage.setItem('emailHistory', JSON.stringify(existingEmails.slice(0, 50)));
    
    console.log(`📧 Email saved to localStorage with status: ${status}`);
}

// Load email history from database
async function loadEmailHistoryFromDB() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        console.warn('No userId found, loading from localStorage');
        loadEmailHistoryFromLocal();
        return;
    }
    
    // Show loading state
    const historyTableBody = document.getElementById('emailHistoryTableBody');
    if (historyTableBody) {
        historyTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    }
    
    try {
        const response = await fetch(`/api/auth/email-history?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.emails) {
            // Merge with local storage to keep drafts
            const localEmails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
            const localDrafts = localEmails.filter(e => e.status === 'draft');
            
            const displayEmails = data.emails.map(email => ({
                id: email._id,
                toName: email.toName,
                toEmail: email.to,
                subject: email.subject,
                body: email.body,
                sentAt: new Date(email.sentAt).toLocaleString(),
                status: email.status || 'sent'
            }));
            
            // Add local drafts that are not already in database
            localDrafts.forEach(draft => {
                const exists = displayEmails.some(e => 
                    e.toEmail === draft.toEmail && 
                    e.subject === draft.subject && 
                    e.status === 'draft'
                );
                if (!exists) {
                    displayEmails.unshift(draft);
                }
            });
            
            localStorage.setItem('emailHistory', JSON.stringify(displayEmails));
            displayEmailHistory(displayEmails);
            console.log('✅ Email history loaded from database:', displayEmails.length, 'emails');
        } else {
            loadEmailHistoryFromLocal();
        }
    } catch (error) {
        console.error('Error loading email history:', error);
        loadEmailHistoryFromLocal();
    }
}

// Load email history from localStorage (fallback)
function loadEmailHistoryFromLocal() {
    const emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    displayEmailHistory(emails);
}

// Display email history with status badges
function displayEmailHistory(emails) {
    const historyTableBody = document.getElementById('emailHistoryTableBody');
    
    if (!historyTableBody) {
        console.log('Table body not found');
        return;
    }
    
    if (emails.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">📭 No emails sent yet. Click "Send Email" to get started!</td></tr>';
        return;
    }
    
    historyTableBody.innerHTML = '';
    
    // Sort emails by sentAt (newest first)
    const sortedEmails = [...emails].sort((a, b) => {
        return new Date(b.sentAt) - new Date(a.sentAt);
    });
    
    sortedEmails.forEach(email => {
        const row = historyTableBody.insertRow();
        
        // Date
        row.insertCell(0).textContent = email.sentAt;
        
        // To Name
        row.insertCell(1).textContent = email.toName || 'Unknown';
        
        // To Email
        row.insertCell(2).textContent = email.toEmail || 'N/A';
        
        // Subject
        row.insertCell(3).innerHTML = email.subject.length > 30 ? email.subject.substring(0, 30) + '...' : email.subject;
        
        // Status Badge with click to mark as sent for drafts
        let statusBadge = '';
        const status = email.status || 'prepared';
        if (status === 'sent') {
            statusBadge = '<span class="status-badge status-sent"><i class="fas fa-check-circle"></i> Sent</span>';
        } else if (status === 'draft') {
            statusBadge = `<span class="status-badge status-draft" style="cursor: pointer;" onclick="markEmailAsSent('${email.id}')" title="Click to mark as sent">
                <i class="fas fa-pencil-alt"></i> Draft (click to mark sent)
            </span>`;
        } else if (status === 'prepared') {
            statusBadge = `<span class="status-badge status-prepared" style="cursor: pointer;" onclick="markEmailAsSent('${email.id}')" title="Click to mark as sent">
                <i class="fas fa-clock"></i> Prepared
            </span>`;
        } else {
            statusBadge = `<span class="status-badge status-prepared"><i class="fas fa-file"></i> ${status}</span>`;
        }
        row.insertCell(4).innerHTML = statusBadge;
        
        // Actions - Added "Mark Sent" button for drafts
        let actionsHtml = `
            <button class="action-btn view-btn" onclick="viewEmail('${email.id}')" title="View">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn copy-btn" onclick="copyExistingEmail('${email.id}')" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn send-btn" onclick="resendExistingEmail('${email.id}')" title="Send">
                <i class="fas fa-paper-plane"></i>
            </button>
        `;
        
        // Add "Mark Sent" button only for drafts and prepared emails
        if (status === 'draft' || status === 'prepared') {
            actionsHtml += `
                <button class="action-btn mark-sent-btn" onclick="markEmailAsSent('${email.id}')" title="Mark as Sent">
                    <i class="fas fa-check"></i> Mark Sent
                </button>
            `;
        }
        
        actionsHtml += `
            <button class="action-btn delete-btn" onclick="deleteEmail('${email.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        row.insertCell(5).innerHTML = actionsHtml;
    });
    
    window.emailList = sortedEmails;
}

// View email
function viewEmail(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
    // Remove any existing modal
    const existingModal = document.querySelector('.email-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'email-modal';
    modal.innerHTML = `
        <div class="email-modal-content">
            <div class="email-detail-header">
                <h3><i class="fas fa-envelope"></i> Email Details</h3>
                <button class="close-modal" onclick="this.closest('.email-modal').remove()">&times;</button>
            </div>
            <div class="email-detail-body">
                <p><strong>To:</strong> ${email.toName} (${email.toEmail})</p>
                <p><strong>Subject:</strong> ${email.subject}</p>
                <p><strong>Created:</strong> ${email.sentAt}</p>
                <p><strong>Status:</strong> ${email.status || 'Prepared'}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <pre class="email-body-preview">${escapeHtml(email.body)}</pre>
                <div class="modal-actions">
                    <button class="copy-email-btn" onclick="copyExistingEmail('${email.id}'); document.querySelector('.email-modal').remove();">
                        <i class="fas fa-copy"></i> Copy to Clipboard
                    </button>
                    <button class="send-email-btn" onclick="resendExistingEmail('${email.id}'); document.querySelector('.email-modal').remove();">
                        <i class="fas fa-paper-plane"></i> Send Again
                    </button>
                    ${email.status === 'draft' || email.status === 'prepared' ? `
                    <button class="mark-sent-modal-btn" onclick="markEmailAsSent('${email.id}'); document.querySelector('.email-modal').remove();">
                        <i class="fas fa-check"></i> Mark as Sent
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Mark email as sent - NEW FUNCTION
function markEmailAsSent(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
    if (confirm(`Mark this email to ${email.toName} as SENT?`)) {
        // Update status in database
        saveEmailToDatabase(email.toName, email.toEmail, email.subject, email.body, 'sent');
        
        // Also update in localStorage
        let emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
        const index = emails.findIndex(e => e.id == emailId);
        if (index !== -1) {
            emails[index].status = 'sent';
            localStorage.setItem('emailHistory', JSON.stringify(emails));
        }
        
        alert('✅ Email marked as SENT!');
        loadEmailHistoryFromDB();
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy existing email
function copyExistingEmail(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
    const emailContent = `To: ${email.toEmail}\nSubject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(emailContent);
    alert('📋 Email content copied to clipboard! You can now paste it into your email app.');
    
    // Save as draft when copied
    saveEmailToDatabase(email.toName, email.toEmail, email.subject, email.body, 'draft');
}

// Resend existing email
function resendExistingEmail(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
    const mailtoLink = `mailto:${email.toEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    window.location.href = mailtoLink;
    
    alert(`📧 Opening email to ${email.toName}\n\nTo: ${email.toEmail}\nSubject: ${email.subject}`);
}

// Delete email from history
async function deleteEmail(emailId) {
    let confirmDelete = false;
    if (window.customConfirmAsync) {
        confirmDelete = await window.customConfirmAsync('Delete this email from history?');
    } else {
        confirmDelete = confirm('Delete this email from history?');
    }

    if (confirmDelete) {
        const userId = localStorage.getItem('userId');
        
        try {
            const response = await fetch(`/api/auth/delete-email/${emailId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove from localStorage
                let emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
                emails = emails.filter(e => e.id != emailId);
                localStorage.setItem('emailHistory', JSON.stringify(emails));
                loadEmailHistoryFromLocal();
                alert('✅ Email deleted from database');
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            // Fallback: Delete from localStorage only
            let emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
            emails = emails.filter(e => e.id != emailId);
            localStorage.setItem('emailHistory', JSON.stringify(emails));
            loadEmailHistoryFromLocal();
            alert('✅ Email deleted from history (Database sync failed)');
        }
    }
}

// Open email with AUTO-FILL email address - FIXED: Save as DRAFT first
function openEmail(partnerName, partnerEmail) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const subject = `Appointment Request from ${userName}`;
    const body = `Dear ${partnerName},

I would like to schedule an appointment.

My name: ${userName}
My email: ${userEmail}

Please let me know available time slots.

Thank you.

Best regards,
${userName}`;
    
    // ✅ Save as DRAFT first (not sent yet)
    saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'draft');
    
    const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
        // ✅ Ask user if they actually sent the email
        const userSent = confirm(`📧 Did you actually send the email to ${partnerName}?\n\nIf yes, click OK to mark as SENT.\nIf no, click Cancel to keep as DRAFT.`);
        
        if (userSent) {
            // Update status to sent
            saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'sent');
            alert('✅ Email marked as SENT!');
        } else {
            alert('📝 Email saved as DRAFT. You can send it later.');
        }
        loadEmailHistoryFromDB();
    }, 1000);
}

// Open Gmail web with auto-filled email - FIXED: Save as DRAFT first
function openGmail(partnerName, partnerEmail) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const subject = `Appointment Request from ${userName}`;
    const body = `Dear ${partnerName},

I would like to schedule an appointment.

My name: ${userName}
My email: ${userEmail}

Please let me know available time slots.

Thank you.

Best regards,
${userName}`;
    
    // ✅ Save as DRAFT first (not sent yet)
    saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'draft');
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(partnerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    
    setTimeout(() => {
        // ✅ Ask user if they actually sent the email
        const userSent = confirm(`📧 Did you actually send the email to ${partnerName} via Gmail?\n\nIf yes, click OK to mark as SENT.\nIf no, click Cancel to keep as DRAFT.`);
        
        if (userSent) {
            saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'sent');
            alert('✅ Email marked as SENT!');
        } else {
            alert('📝 Email saved as DRAFT.');
        }
        loadEmailHistoryFromDB();
    }, 1000);
}

// Open Outlook web with auto-filled email - FIXED: Save as DRAFT first
function openOutlook(partnerName, partnerEmail) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const subject = `Appointment Request from ${userName}`;
    const body = `Dear ${partnerName},

I would like to schedule an appointment.

My name: ${userName}
My email: ${userEmail}

Please let me know available time slots.

Thank you.

Best regards,
${userName}`;
    
    // ✅ Save as DRAFT first (not sent yet)
    saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'draft');
    
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(partnerEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, '_blank');
    
    setTimeout(() => {
        // ✅ Ask user if they actually sent the email
        const userSent = confirm(`📧 Did you actually send the email to ${partnerName} via Outlook?\n\nIf yes, click OK to mark as SENT.\nIf no, click Cancel to keep as DRAFT.`);
        
        if (userSent) {
            saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'sent');
            alert('✅ Email marked as SENT!');
        } else {
            alert('📝 Email saved as DRAFT.');
        }
        loadEmailHistoryFromDB();
    }, 1000);
}

// Show email options menu
function showEmailOptions(partnerName, partnerEmail) {
    // Remove existing modal
    const existingModal = document.querySelector('.email-options-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'email-options-modal';
    modal.innerHTML = `
        <div class="email-options-content">
            <div class="email-options-header">
                <h3><i class="fas fa-envelope"></i> Send Email to ${partnerName}</h3>
                <button class="close-options" onclick="this.closest('.email-options-modal').remove()">&times;</button>
            </div>
            <div class="email-options-body">
                <p class="email-address-display">
                    <i class="fas fa-at"></i> ${partnerEmail}
                </p>
                <div class="email-options-grid">
                    <button class="email-option-btn" onclick="openEmail('${partnerName}', '${partnerEmail}'); document.querySelector('.email-options-modal')?.remove();">
                        <i class="fas fa-envelope-open-text"></i>
                        <span>Send Email</span>
                        <small>Open email client</small>
                    </button>
                    <button class="email-option-btn gmail-btn" onclick="openGmail('${partnerName}', '${partnerEmail}'); document.querySelector('.email-options-modal')?.remove();">
                        <i class="fab fa-google"></i>
                        <span>Gmail (Web)</span>
                        <small>Open in browser</small>
                    </button>
                    <button class="email-option-btn outlook-btn" onclick="openOutlook('${partnerName}', '${partnerEmail}'); document.querySelector('.email-options-modal')?.remove();">
                        <i class="fab fa-windows"></i>
                        <span>Outlook (Web)</span>
                        <small>Open in browser</small>
                    </button>
                    <button class="email-option-btn copy-btn" onclick="copyEmailToClipboard('${partnerName}', '${partnerEmail}'); document.querySelector('.email-options-modal')?.remove();">
                        <i class="fas fa-copy"></i>
                        <span>Copy to Clipboard</span>
                        <small>Save as draft</small>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy email to clipboard (saves as DRAFT)
function copyEmailToClipboard(partnerName, partnerEmail) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const subject = `Appointment Request from ${userName}`;
    const body = `Dear ${partnerName},

I would like to schedule an appointment.

My name: ${userName}
My email: ${userEmail}

Please let me know available time slots.

Thank you.

Best regards,
${userName}`;
    
    const emailContent = `To: ${partnerEmail}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailContent);
    
    // Save as DRAFT
    saveEmailToDatabase(partnerName, partnerEmail, subject, body, 'draft');
    
    alert(`📋 Email content copied!\n\nTo: ${partnerEmail}\n\nSaved as DRAFT. You can paste it into your email app.`);
    loadEmailHistoryFromDB();
}

// Video consultation
function openVideoConsultation(platform) {
    const userEmail = localStorage.getItem('userEmail') || '';
    const partnerEmail = prompt(`Enter healthcare provider email for ${platform}:`);
    
    if (!partnerEmail) return;
    
    const subject = `${platform.toUpperCase()} Consultation Request`;
    const body = `Hi,\n\nI would like to schedule a ${platform} consultation.\n\nMy email: ${userEmail}\n\nPlease share meeting details.\n\nThank you.`;
    
    // Save as DRAFT first
    saveEmailToDatabase('Healthcare Provider', partnerEmail, subject, body, 'draft');
    
    const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
        const userSent = confirm(`📧 Did you actually send the email for ${platform} consultation?\n\nIf yes, click OK to mark as SENT.\nIf no, click Cancel to keep as DRAFT.`);
        
        if (userSent) {
            saveEmailToDatabase('Healthcare Provider', partnerEmail, subject, body, 'sent');
            alert('✅ Email marked as SENT!');
        } else {
            alert('📝 Email saved as DRAFT.');
        }
        loadEmailHistoryFromDB();
    }, 500);
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

// Function to manually refresh email history (for the refresh button)
function refreshEmailHistory() {
    const refreshBtn = document.querySelector('.refresh-history-btn');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        refreshBtn.disabled = true;
    }
    
    loadEmailHistoryFromDB().then(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }).catch(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshBtn.disabled = false;
        }
    });
}

// Make refresh function available globally
window.refreshEmailHistory = refreshEmailHistory;