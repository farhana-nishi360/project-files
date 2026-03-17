// success.js
document.addEventListener('DOMContentLoaded', () => {
    // The password change is done, so we clean up the local storage
    // This prevents the user from going "Back" and seeing the OTP again
    localStorage.removeItem('userEmail');
    localStorage.setItem('validOtp', null);
    
    console.log("Session data cleared for security.");
});