document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Grabbing the values - FIXED: using 'name' not 'email'
    const name = document.getElementById('name').value; 
    const password = document.getElementById('password').value;

    // Basic validation
    if (!name || !password) {
        alert('Please enter both name and password');
        return;
    }

    try {
        // Since you're using name instead of email, we'll simulate a successful login
        // or you can modify your backend to accept 'name'
        
        // FOR TESTING WITHOUT BACKEND - Comment this section once your backend is ready
        // Simulate successful login
        if (name && password.length >= 6) {
            // Clear any old data first
            localStorage.clear();
            
            // Store user info for homepage
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', name + '@example.com'); // Simulated email
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('Login successful for:', name);
            
            alert(`Welcome back, ${name}!`);
            
            // Redirect to home.html
            window.location.href = "home.html";
            return;
        } else {
            alert('Password must be at least 6 characters');
            return;
        }
        
        /* UNCOMMENT THIS WHEN YOUR BACKEND IS READY
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password }) // Changed from email to name
        });

        const result = await response.json();

        if (result.success) {
            // Clear any old data first
            localStorage.clear();
            
            // Store user info for homepage
            localStorage.setItem('userName', result.name);
            localStorage.setItem('userEmail', result.email);
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('Login successful for:', result.name);
            
            alert(`Welcome back, ${result.name}!`);
            
            // Redirect to home.html
            window.location.href = "home.html";
        } else {
            alert("Error: " + result.message);
        }
        */
    } catch (err) {
        console.error('Login error:', err);
        alert("Cannot connect to server. Using test mode. Please try again.");
    }
});

// Enter key support
const passwordField = document.getElementById('password');
if (passwordField) {
    passwordField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
}

// Check if already logged in
window.addEventListener('load', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        console.log('User already logged in');
        // Uncomment to auto-redirect
        // window.location.href = "home.html";
    }
});