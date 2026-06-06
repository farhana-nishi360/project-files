document.addEventListener('DOMContentLoaded', function() {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    console.log('Booking page loaded for:', userName);
    
    // Load email history from localStorage
    loadEmailHistoryFromLocal();
});

function goBack() {
    window.location.href = 'home.html';
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
    window.open(whatsappUrl, '_blank');
    
    saveToHistory(partnerName, phoneNumber, 'WhatsApp');
    alert(`📱 Opening WhatsApp to contact ${partnerName}...`);
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

// Open email with AUTO-FILL email address
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
    
    // Option 1: Try to open email client with auto-filled address
    const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Try to open default email client
    window.location.href = mailtoLink;
    
    // Save to email history
    saveEmailToLocalStorage(partnerName, partnerEmail, subject, body);
    
    // Show instructions
    setTimeout(() => {
        alert(`📧 Email window should open with:\n\nTo: ${partnerEmail}\nSubject: ${subject}\n\nIf email didn't open, please check your default email settings.\n\nThe email has been saved to your history.`);
        loadEmailHistoryFromLocal();
    }, 1000);
}

// Alternative: Open Gmail web with auto-filled email
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
    
    // Gmail compose URL with auto-filled fields
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(partnerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(gmailUrl, '_blank');
    
    // Save to email history
    saveEmailToLocalStorage(partnerName, partnerEmail, subject, body);
    
    alert(`📧 Gmail opened with auto-filled email!\n\nTo: ${partnerEmail}\n\nEmail saved to history.`);
    setTimeout(() => loadEmailHistoryFromLocal(), 500);
}

// Alternative: Open Outlook web with auto-filled email
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
    
    // Outlook web compose URL
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(partnerEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(outlookUrl, '_blank');
    
    // Save to email history
    saveEmailToLocalStorage(partnerName, partnerEmail, subject, body);
    
    alert(`📧 Outlook opened with auto-filled email!\n\nTo: ${partnerEmail}\n\nEmail saved to history.`);
    setTimeout(() => loadEmailHistoryFromLocal(), 500);
}

// Show email options menu
function showEmailOptions(partnerName, partnerEmail) {
    // Create modal with options
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
                        <span>Default Email App</span>
                        <small>Outlook, Thunderbird, Apple Mail</small>
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
                        <small>Paste anywhere</small>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy email to clipboard
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
    
    saveEmailToLocalStorage(partnerName, partnerEmail, subject, body);
    
    alert(`📋 Email content copied!\n\nTo: ${partnerEmail}\n\nYou can now paste it into any email app.`);
    loadEmailHistoryFromLocal();
}

// Save email to localStorage
function saveEmailToLocalStorage(partnerName, partnerEmail, subject, body) {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const emailRecord = {
        id: Date.now(),
        toName: partnerName,
        toEmail: partnerEmail,
        subject: subject,
        body: body,
        sentAt: new Date().toLocaleString(),
        status: 'prepared',
        user: userName,
        userEmail: userEmail
    };
    
    const existingEmails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    existingEmails.unshift(emailRecord);
    localStorage.setItem('emailHistory', JSON.stringify(existingEmails.slice(0, 50)));
    
    console.log('Email saved:', emailRecord);
}

// Load email history
function loadEmailHistoryFromLocal() {
    const emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    displayEmailHistory(emails);
}

// Display email history
function displayEmailHistory(emails) {
    const historyTableBody = document.getElementById('emailHistoryTableBody');
    
    if (!historyTableBody) {
        console.log('Table body not found');
        return;
    }
    
    if (emails.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">📭 No emails sent yet. Click "Send Email" to get started!</td></tr>';
        return;
    }
    
    historyTableBody.innerHTML = '';
    
    emails.forEach(email => {
        const row = historyTableBody.insertRow();
        row.insertCell(0).textContent = email.sentAt;
        row.insertCell(1).textContent = email.toName;
        row.insertCell(2).textContent = email.toEmail;
        row.insertCell(3).innerHTML = email.subject.length > 35 ? email.subject.substring(0, 35) + '...' : email.subject;
        row.insertCell(4).innerHTML = `
            <button class="action-btn view-btn" onclick="viewEmail('${email.id}')">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="action-btn copy-btn" onclick="copyExistingEmail('${email.id}')">
                <i class="fas fa-copy"></i> Copy
            </button>
            <button class="action-btn send-btn" onclick="resendExistingEmail('${email.id}')">
                <i class="fas fa-paper-plane"></i> Send
            </button>
            <button class="action-btn delete-btn" onclick="deleteEmail('${email.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
    });
    
    window.emailList = emails;
}

// View email
function viewEmail(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
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
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
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
}

// Resend existing email
function resendExistingEmail(emailId) {
    const email = window.emailList?.find(e => e.id == emailId);
    if (!email) return;
    
    // Open email with auto-filled address
    const mailtoLink = `mailto:${email.toEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    window.location.href = mailtoLink;
    
    alert(`📧 Opening email to ${email.toName}\n\nTo: ${email.toEmail}\nSubject: ${email.subject}`);
}

// Delete email
function deleteEmail(emailId) {
    if (confirm('Delete this email from history?')) {
        let emails = JSON.parse(localStorage.getItem('emailHistory') || '[]');
        emails = emails.filter(e => e.id != emailId);
        localStorage.setItem('emailHistory', JSON.stringify(emails));
        loadEmailHistoryFromLocal();
        alert('✅ Email deleted from history');
    }
}

// Video consultation
function openVideoConsultation(platform) {
    const userEmail = localStorage.getItem('userEmail') || '';
    const partnerEmail = prompt(`Enter healthcare provider email for ${platform}:`);
    
    if (!partnerEmail) return;
    
    const subject = `${platform.toUpperCase()} Consultation Request`;
    const body = `Hi,\n\nI would like to schedule a ${platform} consultation.\n\nMy email: ${userEmail}\n\nPlease share meeting details.\n\nThank you.`;
    
    const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    saveEmailToLocalStorage('Healthcare Provider', partnerEmail, subject, body);
    alert(`📧 Opening email for ${platform} consultation...`);
    setTimeout(() => loadEmailHistoryFromLocal(), 500);
}

// Bottom navigation
document.querySelectorAll('.bottom-nav i').forEach(icon => {
    icon.addEventListener('click', function() {
        const iconClass = this.className;
        if (iconClass.includes('fa-home')) {
            window.location.href = 'home.html';
        } else if (iconClass.includes('fa-user')) {
            const userName = localStorage.getItem('userName');
            if (userName) {
                alert(`Logged in as: ${userName}`);
            } else {
                window.location.href = 'login.html';
            }
        } else {
            alert('Coming soon!');
        }
    });
});