const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName("rspgame")
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
		const myChoice = interaction.options.getInteger("choice");
    const enemyChoice = Math.floor(Math.random() * 3 + 1);
    let winner = "";
    let areYouWin = "";
    const chat = {
      1: ":fist:",
      2: ":v:",
      3: ":hand_splayed:",
    };
    //1 : rock, 2: scissors, 3: paper
    const weapons = {
      1: { weakTo: "3", strongTo: "2" },
      2: { weakTo: "1", strongTo: "3" },
      3: { weakTo: "2", strongTo: "1" },
    };

    if (weapons[myChoice].weakTo == enemyChoice) winner = "bot";
    else if (weapons[myChoice].strongTo == enemyChoice) winner = "you";
    else winner = "draw";

    if (winner == "you") {
      areYouWin = "Win :o:";
    } else if (winner == "bot") {
      areYouWin = "Lose :x:";
    } else if (winner == "draw") {
      areYouWin = "Draw :grey_question:";
    }

    await interaction.reply(
      `:robot: : [${chat[enemyChoice]}], You : [${chat[myChoice]}] \nYou ${areYouWin}`
    );
	},
};