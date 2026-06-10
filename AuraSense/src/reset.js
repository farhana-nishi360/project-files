// Get DOM elements
const resetEmail = document.getElementById('reset-email');
const sendBtn = document.getElementById('sendOtpBtn');
const messageDiv = document.getElementById('messageDiv');

// Send OTP when button is clicked
sendBtn.addEventListener('click', sendResetCode);

async function sendResetCode() {
    const email = resetEmail.value.trim();
    
    if (!email) {
        showMessage('Please enter your email', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Store email for OTP verification
    localStorage.setItem('resetEmail', email);
    
    // Disable button and show loading
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    showMessage('Sending verification code...', 'info');
    
    try {
        const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('✅ OTP sent to your email! Redirecting...', 'success');
            
            // Store a demo OTP for testing (remove in production)
            const demoOTP = Math.floor(1000 + Math.random() * 9000).toString();
            localStorage.setItem('generatedOTP', demoOTP);
            console.log('Demo OTP (for testing):', demoOTP);
            
            setTimeout(() => {
                window.location.href = 'otp.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Failed to send OTP. Please try again.', 'error');
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Reset Code';
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Fallback - Generate demo OTP for testing
        const demoOTP = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('generatedOTP', demoOTP);
        localStorage.setItem('resetEmail', email);
        
        showMessage(`⚠️ Demo Mode: Your OTP is ${demoOTP}. Redirecting...`, 'warning');
        
        setTimeout(() => {
            window.location.href = 'otp.html';
        }, 2000);
        
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Reset Code';
    }
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message-${type}`;
    
    // Set colors based on type
    switch(type) {
        case 'error':
            messageDiv.style.color = '#dc3545';
            break;
        case 'success':
            messageDiv.style.color = '#28a745';
            break;
        case 'warning':
            messageDiv.style.color = '#ffc107';
            break;
        default:
            messageDiv.style.color = '#513B56';
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
        if (messageDiv.textContent === message) {
            messageDiv.textContent = '';
        }
    }, 5000);
}