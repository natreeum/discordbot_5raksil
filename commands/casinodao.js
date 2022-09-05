const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("casinodao")
    .setDescription("CASINO DAO Point")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`add`)
        .setDescription(`add casinoDAO point`)
        .addIntegerOption((option) =>
          option
            .setName(`amount`)
            .setDescription(`add amount`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`show`)
        .setDescription(`show casinoDAO point`)
        .addUserOption((option) =>
          option
            .setName(`user`)
            .setDescription(`show casinoDAO Point`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`reset`)
        .setDescription(`reset casinoDAO point`)
        .addStringOption((option) =>
          option
            .setName(`password`)
            .setDescription(`enter password`)
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === `add`) {
    } else if (interaction.options.getSubcommand() === `show`) {
    } else if (interaction.options.getSubcommand() === `reset`) {
    }
  },
};
