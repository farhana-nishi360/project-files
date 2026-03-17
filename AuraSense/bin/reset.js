// Make sure this matches the ID in your HTML!
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    console.log("Button was pressed!"); // Check if this shows in Browser Console (F12)

    const email = document.getElementById('email').value;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
        const response = await fetch('http://localhost:3000/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const result = await response.json();
        if (result.success) {
            alert("OTP Sent!");
            localStorage.setItem('validOtp', otp);
            window.location.href = "otp.html";
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
});