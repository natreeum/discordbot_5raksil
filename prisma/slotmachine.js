const prisma = require("./prisma");

//loadGame
async function loadGame() {
  try {
    const gameData = await prisma.slotmachine.findFirst({
      where: {
        hasWinner: false,
      },
    });
    return gameData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//create game
async function createGame() {
  try {
    const slotData = await prisma.slotmachine.create({
      data: {
        prize: 1000,
      },
    });
    return slotData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//update game
async function updateGame(data) {
  try {
    const { id, prize, hasWinner, winner } = data;
    const gameData = await prisma.slotmachine.update({
      where: {
        id,
      },
      data: {
        prize,
        hasWinner,
        winner,
      },
    });
    return gameData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  loadGame,
  createGame,
  updateGame,
};
