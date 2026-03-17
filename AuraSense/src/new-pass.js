
        // Check if user came through proper flow
        function checkAccess() {
            const isVerified = localStorage.getItem('otpVerified');
            const email = localStorage.getItem('verifiedEmail');
            
            if (!isVerified || !email) {
                alert('Please verify OTP first');
                window.location.href = 'reset.html';
                return false;
            }
            return true;
        }

        // Run check when page loads
        document.addEventListener('DOMContentLoaded', checkAccess);

        // Real-time password match checking
        document.getElementById('confirm-password').addEventListener('keyup', checkPasswordMatch);
        document.getElementById('new-password').addEventListener('keyup', checkPasswordMatch);

        function checkPasswordMatch() {
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            const matchDiv = document.getElementById('password-match');
            
            if (confirmPass.length > 0) {
                if (newPass === confirmPass) {
                    matchDiv.style.display = 'none';
                } else {
                    matchDiv.style.display = 'block';
                }
            } else {
                matchDiv.style.display = 'none';
            }
        }

        async function updatePassword() {
            // Check verification again
            if (!checkAccess()) return;
            
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            const email = localStorage.getItem('verifiedEmail');

            // Validation
            if (!newPass || !confirmPass) {
                alert('Please fill in all fields');
                return;
            }

            if (newPass.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            if (newPass !== confirmPass) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/update-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, newPassword: newPass })
                });

                const data = await response.json();

                if (data.success) {
                    alert('✅ Password updated successfully! Please login with your new password.');
                    
                    // Clear all reset-related data
                    localStorage.removeItem('otpVerified');
                    localStorage.removeItem('verifiedEmail');
                    localStorage.removeItem('resetEmail');
                    localStorage.removeItem('generatedOTP');
                    
                    // Redirect to login
                    window.location.href = 'Login.html';
                } else {
                    alert(data.message || 'Failed to update password');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to update password. Make sure the server is running.');
            }
        }