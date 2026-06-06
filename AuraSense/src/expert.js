document.addEventListener('DOMContentLoaded', function() {
    // Get user info from localStorage
    const userName = localStorage.getItem('userName') || 'Guest';
    console.log('Expert page loaded for:', userName);
});

// Go back to previous page
function goBack() {
    window.location.href = 'home.html';
}

// Connect with expert
function connectWithExpert(expertName, phoneNumber) {
    // Show confirmation dialog
    const userConfirmed = confirm(`Would you like to connect with ${expertName}?\n\nWe'll help you schedule a consultation.`);
    
    if (userConfirmed) {
        // Store selected expert info
        localStorage.setItem('selectedExpert', expertName);
        localStorage.setItem('expertPhone', phoneNumber);
        
        // Show options
        const action = confirm(`How would you like to connect?\n\nOK - Call ${expertName}\nCancel - Send Message`);
        
        if (action) {
            // Initiate phone call (on mobile) or show number (on desktop)
            if (/(android|iphone|ipad|ipod)/i.test(navigator.userAgent)) {
                window.location.href = `tel:${phoneNumber}`;
            } else {
                alert(`Call ${expertName} at: ${phoneNumber}\n\nFor mobile users, tap to call directly.`);
                // Show number in a prompt for easy copy
                prompt('Copy this number to call:', phoneNumber);
            }
        } else {
            // Show message option
            const message = prompt(`Send a message to ${expertName}:`, "Hello, I'd like to book a consultation.");
            if (message) {
                alert(`Message sent to ${expertName}!\n\nThey will contact you soon.`);
                // Here you can add API call to save message
            }
        }
    }
}

// Bottom navigation
document.querySelectorAll('.bottom-nav i').forEach(icon => {
    icon.addEventListener('click', function() {
        const iconClass = this.className;
        if (iconClass.includes('fa-home')) {
            window.location.href = 'home.html';
        } else if (iconClass.includes('fa-compass')) {
            alert('Explore page coming soon!');
        } else if (iconClass.includes('fa-music')) {
            alert('Music library coming soon!');
        } else if (iconClass.includes('fa-user')) {
            const userName = localStorage.getItem('userName');
            if (userName) {
                alert(`Logged in as: ${userName}`);
            } else {
                window.location.href = 'login.html';
            }
        }
    });
});