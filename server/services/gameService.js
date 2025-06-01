// gameService.js

class GameSession {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.players = {};
        this.turnOrder = [];
        this.currentTurn = 0;
        this.winner = null;
    }

    addPlayer(playerId) {
        if (Object.keys(this.players).length >= 2) return false;
        this.players[playerId] = { left: 1, right: 1 };
        this.turnOrder.push(playerId);
        return true;
    }

    isPlayerTurn(playerId) {
        return this.turnOrder[this.currentTurn % 2] === playerId;
    }

    parseMoveString(moveStr) {
        const regex = /^[12][AB][LR][0-5][LR][0-5]$/;
        if (!regex.test(moveStr)) {
            return { error: "Invalid move format" };
        }

        const player = moveStr[0];
        const action = moveStr[1];
        const mainHand = moveStr[2].toLowerCase();
        const mainVal = parseInt(moveStr[3], 10);
        const targetHand = moveStr[4].toLowerCase();
        const targetVal = parseInt(moveStr[5], 10);

        return { player, action, mainHand, mainVal, targetHand, targetVal };
    }

    makeMove(playerId, moveStr) {
        if (!this.isPlayerTurn(playerId)) {
            return { error: "Not your turn" };
        }

        const parsed = this.parseMoveString(moveStr);
        if (parsed.error) return { error: parsed.error };

        const { action, mainHand, mainVal, targetHand, targetVal } = parsed;
        const fromPlayer = this.players[playerId];
        const opponentId = Object.keys(this.players).find(p => p !== playerId);
        const toPlayer = action === "A" ? this.players[opponentId] : fromPlayer;

        if (fromPlayer[mainHand] !== mainVal) {
            return { error: "Main hand value does not match actual state" };
        }

        if (action === "A") {
            if (toPlayer[targetHand] !== targetVal) {
                return { error: "Target hand value does not match actual state" };
            }
            if (mainVal === 0 || targetVal === 0) {
                return { error: "Cannot attack with or to a dead hand" };
            }
            let sum = mainVal + targetVal;
            toPlayer[targetHand] = sum >= 5 ? sum - 5 : sum;
        } else if (action === "B") {
            if (mainHand === targetHand) {
                return { error: "Cannot bump to the same hand" };
            }

            if (mainVal <= 0) {
                return { error: "Bump amount must be greater than zero" };
            }

            if (fromPlayer[mainHand] < mainVal) {
                return { error: "Not enough value in main hand to bump" };
            }

            // Execute the partial bump
            fromPlayer[mainHand] -= mainVal;
            fromPlayer[targetHand] += mainVal;

            if (fromPlayer[mainHand] >= 5) fromPlayer[mainHand] -= 5;
            if (fromPlayer[targetHand] >= 5) fromPlayer[targetHand] -= 5;
        }


        if (this.players[opponentId].left === 0 && this.players[opponentId].right === 0) {
            this.winner = playerId;
        }

        this.currentTurn++;

        return { success: true, state: this.getState() };
    }

    getState() {
        return {
            sessionId: this.sessionId,
            players: this.players,
            currentTurn: this.turnOrder[this.currentTurn % 2],
            winner: this.winner
        };
    }
}

const gameSessions = {};

module.exports = { GameSession, gameSessions };
