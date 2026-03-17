// Add to the very top of your files
if (!localStorage.getItem('userEmail')) {
    window.location.href = "reset.html"; // Send them back if they didn't enter an email
}document.addEventListener('DOMContentLoaded', () => {
    // Show which email the code was sent to
    document.getElementById('displayEmail').innerText = localStorage.getItem('userEmail');

    document.getElementById('otpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const enteredOtp = document.getElementById('otp').value; // Get what user typed
    const actualOtp = localStorage.getItem('validOtp'); // Get what we stored in Reset step

    if (enteredOtp === actualOtp) {
        alert("Verification Successful!");
        window.location.href = "new-password.html";
    } else {
        alert("Invalid Code. Please check your email and try again.");
    }
});
});