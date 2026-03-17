
        async function sendResetCode() {
            const email = document.getElementById('reset-email').value.trim();
            
            if (!email) {
                alert('Please enter your email');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Generate 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Store email and OTP for later use
            localStorage.setItem('resetEmail', email);
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
                    alert('OTP sent successfully! Check your email.');
                    window.location.href = 'otp.html';
                } else {
                    alert(data.message || 'Failed to send OTP. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to connect to server. Make sure the server is running.');
            }
        }