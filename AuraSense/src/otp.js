// Display the email from localStorage
const resetEmail = localStorage.getItem('resetEmail');
if (resetEmail) {
    document.getElementById('user-email').textContent = resetEmail;
}

function moveToNext(current, index) {
    if (current.value.length === 1) {
        // CHANGE THIS: from '.otp-input' to '.otp-box'
        const next = document.querySelectorAll('.otp-box')[index + 1];
        if (next) next.focus();
    }
}

function handleBackspace(event, current, index) {
    if (event.key === 'Backspace' && !current.value) {
        // CHANGE THIS: from '.otp-input' to '.otp-box'
        const prev = document.querySelectorAll('.otp-box')[index - 1];
        if (prev) {
            prev.focus();
            prev.value = '';
        }
    }
}

async function verifyOTP() {
    // CHANGE THIS: from '.otp-input' to '.otp-box'
    const inputs = document.querySelectorAll('.otp-box');
    const otp = Array.from(inputs).map(i => i.value).join('');
    const email = localStorage.getItem('resetEmail');
    
    if (otp.length !== 4) {
        alert('Please enter complete 4-digit OTP');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/verify-otp', {
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
            
            alert('OTP verified successfully!');
            window.location.href = 'new-pass.html';
        } else {
            alert(data.message || 'Invalid OTP. Please try again.');
            // Clear inputs
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to verify OTP. Make sure the server is running.');
    }
}

async function resendOTP() {
    const email = localStorage.getItem('resetEmail');
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    localStorage.setItem('generatedOTP', otp);

    try {
        const response = await fetch('http://localhost:3000/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (data.success) {
            alert('New OTP sent successfully!');
            // CHANGE THIS: from '.otp-input' to '.otp-box'
            document.querySelectorAll('.otp-box').forEach(input => input.value = '');
            document.querySelectorAll('.otp-box')[0].focus();
        } else {
            alert(data.message || 'Failed to resend OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to server.');
    }
}