
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    const playerId = getPlayerIdFromCookie();

    if (sessionId) {
        document.getElementById('session-id').textContent = `Session ID: ${sessionId}`;
        console.log('Session ID:', sessionId);
    }

    document.getElementById("leave-button").addEventListener("click", async () => {
        const confirmLeave = confirm("Are you sure you want to leave the lobby? Doing so will also forfeit the match and reset the gamestate!");
        if (!confirmLeave) return;

        if (sessionId && playerId) {
            try {
                const res = await fetch('/leave-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, playerId }),
                });

                if (!res.ok) {
                    console.error("Failed to notify server of leaving session.");
                }
            } catch (err) {
                console.error("Error notifying server:", err);
            }
        }
        document.cookie = "playerId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "index.html";
    });
});

function getPlayerIdFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('playerId=')) {
            return cookie.substring('playerId='.length);
        }
    }
    return null;
}
