document.getElementById('newPasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const pass = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (pass.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (pass !== confirmPass) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    // In a real app, you would send a 'PATCH' request to your server here
    console.log("Password updated for:", localStorage.getItem('userEmail'));
    
    // Redirect to the success page we created earlier
    window.location.href = "success.html";
});