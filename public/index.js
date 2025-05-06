document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("create-game").addEventListener("click", () => {
        const playerId = generatePlayerId();
        document.cookie = `playerId=${playerId}; path=/`;

        fetch('/create-session', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            const sessionId = data.sessionId;
            console.log('Session created with ID:', sessionId);
            window.location.href = `lobby.html?id=${sessionId}`;
        })
        .catch(error => {
            console.error('Error creating session:', error);
        });
    });
    const joinButton = document.getElementById("join-game");
    const modal = document.getElementById("join-modal");
    const cancelBtn = document.getElementById("join-cancel");
    const submitBtn = document.getElementById("join-submit");
    const lobbyInput = document.getElementById("lobby-id-input");

    joinButton.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        lobbyInput.value = "";
    });

    submitBtn.addEventListener("click", () => {
        const lobbyId = lobbyInput.value.trim();
        joinLobby(lobbyId);
    });

    fetch('/open-lobbies')
    .then(res => res.json())
    .then(lobbies => {
        const section = document.querySelector(".open-lobbies");
        lobbies.forEach(lobby => {
            const div = document.createElement("div");
            div.className = "lobby-banner";
            div.innerHTML = `
                <div class="lobby-info">
                <h3 class="lobby-name">Open Lobby</h3>
                <p class="lobby-id">ID: ${lobby.sessionId}</p>
                </div>
                <button class="join-lobby-btn" data-id="${lobby.sessionId}">Join</button>
            `;
            div.querySelector("button").addEventListener("click", (e) => {
                const lobbyId = e.target.getAttribute("data-id");
                joinLobby(lobbyId);
            });
            section.appendChild(div);
        });
    })
    .catch(err => {
        console.error("Failed to load open lobbies:", err);
    });


});

function generatePlayerId() {
    return Math.floor(Math.random() * 999 + 1).toString();
}

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

function joinLobby(lobbyId) {
    if (lobbyId) {
        let playerId = getPlayerIdFromCookie();
        if (!playerId) {
            playerId = generatePlayerId();
            document.cookie = `playerId=${playerId}; path=/`;
        }

        fetch('/join-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: lobbyId, playerId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === `Joined session ${lobbyId}`) {
                window.location.href = `lobby.html?id=${lobbyId}`;
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error joining session:', error);
        });
    }
}