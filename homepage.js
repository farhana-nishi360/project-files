document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('getStartedBtn');

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // 1. Play the 'press' animation
            getStartedBtn.style.transform = "scale(0.95)";
            
            // 2. Wait a split second for the animation to finish
            setTimeout(() => {
                // 3. Navigate to the signup page
                window.location.href = 'createAcc.html';
            }, 150);
        });
    }
});