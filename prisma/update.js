const { updateGame, loadGame } = require("./slotmachine");

async function a() {
  const loadedGame = await loadGame();
  console.log(loadedGame);

  // const data = {
  //   id: loadedGame.id,
  //   prize: loadedGame.prize,
  //   hasWinner: loadedGame.hasWinner,
  //   winner: loadedGame.winner,
  // };
  const data = {
    id: loadedGame.id,
    prize: 1000,
    hasWinner: loadedGame.hasWinner,
    winner: loadedGame.winner,
  };
  await updateGame(data);
}
a();
