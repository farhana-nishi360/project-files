document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user info
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('isLoggedIn', 'true');
            
            alert(`Welcome back, ${data.user.name}!`);
            window.location.href = "home.html";
        } else {
            alert(data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Cannot connect to server. Make sure the backend server is running on port 3000');
    }
});

// Enter key support
document.getElementById('password').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});