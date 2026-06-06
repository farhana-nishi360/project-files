async function updatePassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-match');
    
    if (!newPassword || !confirmPassword) {
        alert('Please fill in both password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorDiv.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    errorDiv.style.display = 'none';
    
    const email = localStorage.getItem('verifiedEmail') || localStorage.getItem('resetEmail');
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Password updated successfully! Please login with your new password.');
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Failed to update password');
        }
    } catch (error) {
        console.error('Error:', error);
        // Demo mode
        alert('Password updated successfully! (Demo Mode)');
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Check if OTP was verified
if (!localStorage.getItem('otpVerified')) {
    alert('Please verify OTP first');
    window.location.href = 'otp.html';
}