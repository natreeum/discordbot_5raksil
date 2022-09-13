const { SlashCommandBuilder } = require("discord.js");
const { loadGame } = require(`../prisma/slotmachine`);

const channelId = ["962244779171799060"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("잭팟")
    .setDescription(`슬롯머신 잭팟을 확인합니다.`),
  async execute(interaction) {
    // channel Lock
    if (!channelId.includes(interaction.channel.id)) {
      let message = "가위바위보를 할 수 있는 채널을 알려줄게! : ";
      for (let i of channelId) {
        message += `<#${i}> `;
      }
      await interaction.reply({
        content: `${message}`,
        ephemeral: true,
      });
      return;
    }

    const gameData = await loadGame();
    const prize = gameData.prize;
    await interaction.reply(`JACKPOT : ${prize} BTC`);
  },
};
