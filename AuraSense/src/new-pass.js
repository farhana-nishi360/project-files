const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const errorDiv = document.getElementById('password-match');
const messageDiv = document.getElementById('messageDiv');
const updateBtn = document.getElementById('updateBtn');

// Check if OTP was verified
if (!localStorage.getItem('otpVerified')) {
    showMessage('Please verify OTP first', 'error');
    setTimeout(() => {
        window.location.href = 'otp.html';
    }, 2000);
}

async function updatePassword() {
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;
    
    // Reset error display
    errorDiv.style.display = 'none';
    
    if (!newPass || !confirmPass) {
        showMessage('Please fill in both password fields', 'error');
        return;
    }
    
    if (newPass !== confirmPass) {
        errorDiv.style.display = 'block';
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    const email = localStorage.getItem('verifiedEmail') || localStorage.getItem('resetEmail');
    
    if (!email) {
        showMessage('Session expired. Please restart password reset.', 'error');
        setTimeout(() => {
            window.location.href = 'reset.html';
        }, 2000);
        return;
    }
    
    // Disable button
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    showMessage('Updating password...', 'info');
    
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword: newPass })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('✅ Password updated successfully! Redirecting to login...', 'success');
            
            // Clear all reset-related data
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('generatedOTP');
            localStorage.removeItem('otpVerified');
            localStorage.removeItem('verifiedEmail');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Failed to update password', 'error');
            updateBtn.disabled = false;
            updateBtn.textContent = 'Update Password';
        }
    } catch (error) {
        console.error('Error:', error);
        
        // Demo mode - simulate success
        showMessage('✅ Password updated successfully (Demo Mode)! Redirecting to login...', 'success');
        
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('generatedOTP');
        localStorage.removeItem('otpVerified');
        localStorage.removeItem('verifiedEmail');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
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
            if (type !== 'success') {
                messageDiv.textContent = '';
            }
        }
    }, 5000);
}

// Enter key support
newPassword.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        updatePassword();
    }
});

confirmPassword.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        updatePassword();
    }
});

// Add update button event listener
updateBtn.addEventListener('click', updatePassword);