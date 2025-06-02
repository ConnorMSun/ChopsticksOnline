function gameRoutes(app, io) {
  function parseMove(move) {
    // Expected format: [Player][Action][MainHand][MainVal][TargetHand][TargetVal]
    if (!move || move.length !== 6) return null;

    const player = move[0];
    const action = move[1];
    const mainHand = move[2];
    const mainVal = parseInt(move[3]);
    const targetHand = move[4];
    const targetVal = parseInt(move[5]);

    if (!["1", "2"].includes(player)) return null;
    if (!["A", "B"].includes(action)) return null;
    if (!["L", "R"].includes(mainHand)) return null;
    if (!["L", "R"].includes(targetHand)) return null;
    if (isNaN(mainVal) || mainVal < 0 || mainVal > 5) return null;
    if (isNaN(targetVal) || targetVal < 0 || targetVal > 5) return null;

    return { player, action, mainHand, mainVal, targetHand, targetVal };
  }

  function validateMove(gameState, moveObj) {
    const { player, action, mainHand, mainVal, targetHand, targetVal } = moveObj;
    const { p1, p2 } = gameState;

    const mainPlayer = player === "1" ? p1 : p2;
    const opponentPlayer = player === "1" ? p2 : p1;
    firstHand = mainHand === "L" ? "left" : "right";
    secondHand = targetHand === "L" ? "left" : "right";

    if (action === "A") {
        if (targetVal <= 0 || opponentPlayer[secondHand] <= 0) return "Cannot attack opponent's empty hand.";
        if (mainVal <= 0 || mainPlayer.firstHand <= 0) return "Cannot attack with an empty hand";
    } else if (action === "B") {
        if (targetHand === mainHand || firstHand === secondHand) return "Target hand for bump must be different from main hand.";
        if( mainVal <= 0 || mainPlayer[firstHand] <= 0) return "Cannot bump with an empty hand.";
        if (targetVal <= 0 || mainPlayer[firstHand] < targetVal) return "Invalid bump amount.";
        if(Math.abs(mainPlayer[firstHand] - mainPlayer[secondHand]) === targetVal) return "Cannot swap hand values";
    } else return "Unknown action.";
    return null;
  }

  function applyMove(gameState, moveObj) {
    const { player, action, mainHand, mainVal, targetHand, targetVal } = moveObj;
    const { p1, p2 } = gameState;
    const newState = { p1: { ...p1 }, p2: { ...p2 } };
    
    const current = `p${player}`;
    const opponent = player === "1" ? "p2" : "p1";
    firstHand = mainHand === "L" ? "left" : "right";
    secondHand = targetHand === "L" ? "left" : "right";

    if (action === "A") {
        let sum = newState[current][firstHand] + newState[opponent][secondHand];
        if (sum > 4) sum -= 5;
        newState[opponent][secondHand] = sum;
    } else if (action === "B") {
        newState[current][firstHand] -= targetVal;
        let bumped = targetVal + newState[current][secondHand];
        if (bumped > 4) bumped -= 5;
        newState[current][secondHand] = bumped;
    }
    return newState;
  }

  app.post('/move', (req, res) => {
    const { gameState, move, sessionId } = req.body;

    if (!gameState || !move) return res.status(400).json({ error: "Missing gameState or move." });

    const moveObj = parseMove(move);
    if (!moveObj) return res.status(400).json({ error: "Invalid move format." });

    const error = validateMove(gameState, moveObj);
    if (error !== null) return res.status(400).json({ error });

    const newState = applyMove(gameState, moveObj);

    console.log("Emitting game update for session:", sessionId);
    io.to(sessionId).emit('game-update', newState);

    res.json({ success: true, newState });
  });
}

module.exports = { gameRoutes };
