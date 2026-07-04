// Display the email from localStorage
const resetEmail = localStorage.getItem('resetEmail');
if (resetEmail) {
    document.getElementById('user-email').textContent = resetEmail;
}

const messageDiv = document.getElementById('messageDiv');
const verifyBtn = document.getElementById('verifyBtn');
const resendLink = document.getElementById('resendLink');

let otpInputs = [];

function moveToNext(current, index) {
    otpInputs = document.querySelectorAll('.otp-box');
    
    if (current.value.length === 1) {
        if (index < 3) {
            otpInputs[index + 1].focus();
        } else {
            // Auto-verify when last digit is entered
            current.blur();
            verifyOTP();
        }
    }
}

function handleBackspace(event, current, index) {
    if (event.key === 'Backspace') {
        if (current.value === '' && index > 0) {
            const prev = document.querySelectorAll('.otp-box')[index - 1];
            prev.focus();
            prev.value = '';
        } else if (current.value) {
            current.value = '';
        }
    }
}

// Enter key support
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        verifyOTP();
    }
});

async function verifyOTP() {
    const inputs = document.querySelectorAll('.otp-box');
    const otp = Array.from(inputs).map(i => i.value).join('');
    const email = localStorage.getItem('resetEmail');
    
    if (otp.length !== 4) {
        showMessage('Please enter complete 4-digit OTP', 'error');
        return;
    }
    
    // Disable verify button
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';
    showMessage('Verifying OTP...', 'info');
    
    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('otpVerified', 'true');
            localStorage.setItem('verifiedEmail', email);
            
            showMessage('✅ OTP verified successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'new-pass.html';
            }, 1500);
        } else {
            showMessage(data.message || 'Invalid OTP. Please try again.', 'error');
            // Clear inputs
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify & Proceed';
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Demo mode - Check against generated OTP
        const generatedOTP = localStorage.getItem('generatedOTP');
        if (otp === generatedOTP) {
            localStorage.setItem('otpVerified', 'true');
            localStorage.setItem('verifiedEmail', email);
            showMessage('✅ OTP verified successfully (Demo Mode)! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'new-pass.html';
            }, 1500);
        } else {
            showMessage(`Invalid OTP. Demo OTP was: ${generatedOTP || 'Not generated'}`, 'error');
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify & Proceed';
        }
    }
}

async function resendOTP() {
    const email = localStorage.getItem('resetEmail');
    
    if (!email) {
        showMessage('Email not found. Please go back and enter your email.', 'error');
        setTimeout(() => {
            window.location.href = 'reset.html';
        }, 1500);
        return;
    }
    
    showMessage('Resending OTP...', 'info');
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    
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
            // Generate new demo OTP
            const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
            localStorage.setItem('generatedOTP', newOTP);
            
            showMessage(`✅ New OTP sent! Demo OTP: ${newOTP}`, 'success');
            
            // Clear OTP inputs
            document.querySelectorAll('.otp-box').forEach(input => input.value = '');
            document.querySelectorAll('.otp-box')[0].focus();
        } else {
            showMessage(data.message || 'Failed to resend OTP', 'error');
        }
    } catch (error) {
        // Demo mode
        const newOTP = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('generatedOTP', newOTP);
        showMessage(`⚠️ Demo Mode: New OTP is ${newOTP}`, 'warning');
        
        document.querySelectorAll('.otp-box').forEach(input => input.value = '');
        document.querySelectorAll('.otp-box')[0].focus();
    }
    
    setTimeout(() => {
        resendLink.style.pointerEvents = 'auto';
        resendLink.style.opacity = '1';
    }, 3000);
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    
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
    
    setTimeout(() => {
        if (messageDiv.textContent === message) {
            // Don't clear success messages automatically
            if (type !== 'success') {
                messageDiv.textContent = '';
            }
        }
    }, 5000);
}

// Add resend event listener
resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    resendOTP();
});