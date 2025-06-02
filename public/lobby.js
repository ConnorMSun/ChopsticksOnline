
let _player1 = [1,1];
let _player2 = [1,1];
let position = null;
const socket = io();

function updateTurnIndicator() {
  const turnIndicator = document.getElementById('turn-indicator');
  turnIndicator.textContent = (turnIndicator.textContent === "Your Turn") ? "Opponent's Turn" : "Your Turn";
}

document.addEventListener("DOMContentLoaded", () => {
  let p1Hands = document.getElementById('p1-hands');
  let p2Hands = document.getElementById('p2-hands');
  p1Hands.textContent = `Left: ${_player1[0]}, Right: ${_player1[1]}`;
  p2Hands.textContent = `Left: ${_player2[0]}, Right: ${_player2[1]}`;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('id');
  const playerId = getPlayerIdFromCookie();
  
  const turnIndicator = document.getElementById('turn-indicator');

  socket.on('connect', () => {
    socket.emit('join-session', sessionId);

    socket.on('joined-session', ({ sid, pnum }) => {
      console.log(`Socket Agrees: ${sid}`);
      console.log(`${playerId} joined session ${sid} as Player ${pnum}`);
      position = pnum;
      updateTurnIndicator();
      if (pnum === 2) {
        [p1Hands, p2Hands] = [p2Hands, p1Hands];
        turnIndicator.textContent = "Opponent's Turn";
      }
    });

    socket.on('game-update', (newState) => {
      console.log('Received updated game state:', newState);
      _player1 = [newState.p1.left, newState.p1.right];
      _player2 = [newState.p2.left, newState.p2.right];
      console.log("Updated player states:", _player1, _player2);
      p1Hands.textContent = `Left: ${_player1[0]}, Right: ${_player1[1]}`;
      p2Hands.textContent = `Left: ${_player2[0]}, Right: ${_player2[1]}`;
      updateTurnIndicator();
      findWinner();
    });

    socket.on('error', (msg) => {
      console.error('Socket error:', msg);
    });
  });

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
      window.location.href = "index.html";
  });

  const actionSelect = document.getElementById('move-action');
  const bumpSection = document.getElementById('bump-section');
  const submitButton = document.getElementById('submit-move');
  const responseDiv = document.getElementById('move-response');

  actionSelect.addEventListener('change', () => {
    bumpSection.style.display = actionSelect.value === 'B' ? 'block' : 'none';
  });

  submitButton.addEventListener('click', async () => {
    const action = actionSelect.value;
    let mainHand = document.getElementById('main-hand').value;
    let targetHand = document.getElementById('target-hand').value;
    const bumpAmount = document.getElementById('bump-amount').value;

    const player = position === 1 ? _player1 : _player2;
    const opponent = position === 1 ? _player2 : _player1;

    const mainVal = mainHand === 'L' ? player[0] : player[1];

    if (!sessionId || !playerId) return;
    let move = `${position}${action}${mainHand}${mainVal}${targetHand}`;
    if (action === 'A') {
      let targetVal = targetHand === 'L' ? opponent[0] : opponent[1];
      move += targetVal.toString();
      console.log(move);
    }
    else if (action === 'B') {
      move += bumpAmount;
      console.log(move);
    }

    console.log(`Submitting move: ${move}`);

    

    const gameState = {
      p1: { left: _player1[0], right: _player1[1] },
      p2: { left: _player2[0], right: _player2[1] },
    };

    tosend = JSON.stringify({ gameState, move, sessionId })
    console.log("Sending data:", tosend);
    try {
      const res = await fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: tosend
      });
      

      const data = await res.json();
      responseDiv.textContent = res.ok ? "Move submitted!" : `Response Error: ${data.message}`;

      if (res.ok) {
        console.log("move processed successfully");
      } else {
        responseDiv.textContent = `Data Error: ${data.error || 'Unknown error'}`;
      }
    } catch (err) {
      responseDiv.textContent = `Request failed: ${err.message}`;
    }
  });

  document.getElementById('reset-button').addEventListener('click', () => {
    _player1 = [1, 1];
    _player2 = [1, 1];
    console.log("Game reset to initial state:", _player1, _player2);
    p1Hands.textContent = `Left: ${_player1[0]}, Right: ${_player1[1]}`;
    p2Hands.textContent = `Left: ${_player2[0]}, Right: ${_player2[1]}`;

    const moveControls = document.getElementById('move-controls');
    moveControls.querySelectorAll('select, input, button').forEach(el => el.disabled = false);

    document.getElementById('reset-button').style.display = 'none';
    document.getElementById('move-response').textContent = '';
  });

});

function findWinner() {
  if (_player1[0] === 0 && _player1[1] === 0) {
    alert("Player 2 wins!");
    disableMoveControls();
  } else if (_player2[0] === 0 && _player2[1] === 0) {
    alert("Player 1 wins!");
    disableMoveControls();
  }
}

function disableMoveControls() {
  const moveControls = document.getElementById('move-controls');
  moveControls.querySelectorAll('select, input, button').forEach(el => el.disabled = true);
  document.getElementById('reset-button').style.display = 'block';
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