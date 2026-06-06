async function sendResetCode() {
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    // Store email for OTP verification
    localStorage.setItem('resetEmail', email);
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('OTP sent to your email!');
            window.location.href = 'otp.html';
        } else {
            alert(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        // For demo without backend
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('generatedOTP', otp);
        alert(`Demo Mode: Your OTP is ${otp}`);
        window.location.href = 'otp.html';
    }
}