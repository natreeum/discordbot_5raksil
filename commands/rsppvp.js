const { SlashCommandBuilder } = require("discord.js");
let isStarted = false;
const gamedata = {
  firstChoice: { user: null, choice: null },
  secondChoice: { user: null, choice: null },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rsppvp")
    .setDescription("Rock Scissors Paper Game start")
    .addIntegerOption((option) =>
      option
        .setName("choice")
        .setDescription("Rock? Scissors? Paper?")
        .setRequired(true)
        .addChoices(
          { name: "Rock", value: 1 },
          { name: "Scissors", value: 2 },
          { name: "Paper", value: 3 }
        )
    ),
  async execute(interaction) {
    const chat = {
      1: ":fist:",
      2: ":v:",
      3: ":hand_splayed:",
    };
    const weapons = {
      1: { weakTo: 3, strongTo: 2 },
      2: { weakTo: 1, strongTo: 3 },
      3: { weakTo: 2, strongTo: 1 },
    };
    const user = interaction.user;
    const myChoice = interaction.options.getInteger("choice");

    if (isStarted == false) {
      gamedata.firstChoice.user = user;
      gamedata.firstChoice.choice = myChoice;
      isStarted = true;

      await interaction.reply(
        `${gamedata.firstChoice.user}형이 한 팔을 앞으로 내민채 기다리고 있어!!`
      );
    } else if (isStarted == true) {
      gamedata.secondChoice.user = user;
      gamedata.secondChoice.choice = myChoice;
      let winner = "";

      if (
        weapons[gamedata.firstChoice.choice].weakTo ==
        gamedata.secondChoice.choice
      ) {
        winner = `${gamedata.secondChoice.user}형이 이겼어!`;
      } else if (
        weapons[gamedata.firstChoice.choice].strongTo ==
        gamedata.secondChoice.choice
      ) {
        winner = `${gamedata.firstChoice.user}형이 이겼어!`;
      } else winner = "둘이 마음이 통했나본데? 비겼어!!";

      await interaction.reply(
        `${gamedata.firstChoice.user} chose ${
          chat[gamedata.firstChoice.choice]
        } \n${gamedata.secondChoice.user} chose ${
          chat[gamedata.secondChoice.choice]
        }\n${winner}`
      );
      isStarted = false;
    }
  },
};
