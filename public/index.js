document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById('info-toggle');
    const info = document.getElementById('info-modal');

    toggleBtn.addEventListener('click', () => {
        info.classList.toggle('hidden');
    });

    document.getElementById("create-game").addEventListener("click", () => {
        fetch('http://localhost:3001/create-session', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            const sessionId = data.sessionId;
            console.log('Session created with ID:', sessionId);
            joinLobby(sessionId);
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

    fetch('http://localhost:3001/open-lobbies')
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

    const toggleButton = document.getElementById('toggle-lobbies');
    const lobbiesDiv = document.getElementById('open-lobbies');

    // Function to apply visibility and update button text + localStorage
    function setLobbiesVisibility(isHidden) {
        if (isHidden) {
            lobbiesDiv.classList.add('hidden');
            toggleButton.textContent = 'Show';
        } else {
            lobbiesDiv.classList.remove('hidden');
            toggleButton.textContent = 'Hide';
        }
        localStorage.setItem('lobbiesHidden', isHidden);
    }

    // On page load, read saved preference and apply it
    const savedHidden = localStorage.getItem('lobbiesHidden');
    const isHidden = savedHidden === 'true';  // localStorage stores strings
    setLobbiesVisibility(isHidden);

    // Toggle button click handler
    toggleButton.addEventListener('click', () => {
        const currentlyHidden = lobbiesDiv.classList.contains('hidden');
        setLobbiesVisibility(!currentlyHidden);
    });

});

function generatePlayerId() {
    return `playerId=${crypto.randomUUID()}`;
}

function getPlayerIdFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('playerId=')) {
            console.log("Player ID found in cookie:", cookie);
            return cookie.substring('playerId='.length);
        }
        console.log("No Player ID found in cookie");
    }
    return null;
}

function joinLobby(lobbyId) {
    if (lobbyId) {
        let playerId = getPlayerIdFromCookie();
        console.log("Joining lobby with pid:", playerId);
        if (playerId === null) {
            playerId = generatePlayerId();
            document.cookie = `playerId=${playerId}; path=/`;
        }

        fetch('http://localhost:3001/join-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId: lobbyId, playerId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === `Joined session ${lobbyId}`) {
                fetch('http://localhost:3003/vanguard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: playerId })
                });
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