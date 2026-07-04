document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Grabbing the values
    const email = document.getElementById('email').value; 
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) 
        });

        const result = await response.json();

        if (result.success) {
            alert(`Welcome back, ${result.name}!`);
            window.location.href = "dashboard.html"; // Change to your actual success page
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Cannot connect to server. Is the terminal running?");
    }
});