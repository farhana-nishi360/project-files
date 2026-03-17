document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        if (response.ok) {
            alert("Account Created! You can now use the Reset Password flow with this email.");
            window.location.href = "login.html";
        } else {
            const err = await response.json();
            alert(err.message);
        }
    } catch (error) {
        alert("Server is offline. Start it with 'node server.js'");
    }
});