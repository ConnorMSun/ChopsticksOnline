document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    if (sessionId) {
        document.getElementById('session-id').textContent = `Session ID: ${sessionId}`;
    }

    document.getElementById("leave-button").addEventListener("click", () => {
        const confirmLeave = confirm("Are you sure you want to leave the lobby? Doing so will also forfeit the match and reset the gamestate!");
        if (confirmLeave) {
            window.location.href = "index.html";
        }
    });
});
