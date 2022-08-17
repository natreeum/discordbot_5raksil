const { SlashCommandBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { channel } = require("node:diagnostics_channel");
const { lookupService } = require("node:dns");
const wait = require("node:timers/promises").setTimeout;
const util = require("util");

const channelId = "1009096382432411819";
const gamedata = new Map();
let isStarted = false;

const weapons = {
  1: { weakTo: 3, strongTo: 2 },
  2: { weakTo: 1, strongTo: 3 },
  3: { weakTo: 2, strongTo: 1 },
};

const chat = {
  1: ":fist:",
  2: ":v:",
  3: ":hand_splayed:",
  4: "기권:flag_white:",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("가위바위보다드루와")
    .setDescription("여러명과 가위바위보를 합니다.")
    .addIntegerOption((option) =>
      option
        .setName("choice")
        .setDescription("가위, 바위, 보 중에 하나를 골라!")
        .setRequired(true)
        .addChoices(
          { name: "주먹", value: 1 },
          { name: "가위", value: 2 },
          { name: "보", value: 3 }
        )
    ),
  async execute(interaction) {
    //채널이 아닐 때
    if (interaction.channel.id != channelId) {
      const thisChannel = interaction.client.channels.cache.get(channelId);
      await interaction.reply(`${thisChannel}에서 명령어를 이용해줘😉`);
      return;
    } else {
      //게임진행중이라면 리턴
      if (isStarted == true) {
        await interaction.reply({
          content: `누군가 이미 도전장을 내밀었는데? 한번 도전을 받아봐!`,
          ephemeral: true,
        });
        return;
      }

      let winner = [];
      let loser = [];
      let whoDraw = [];
      isStarted = true;

      //명령어 친 사람이 고른 거 (int)
      const userChoice = interaction.options.getInteger("choice");

      //button builder
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("scissors")
            .setLabel("✌")
            .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("rock")
            .setLabel("✊")
            .setStyle(ButtonStyle.Success)
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId("paper")
            .setLabel("✋")
            .setStyle(ButtonStyle.Danger)
        );

      //reply to message with buttons
      await interaction.reply({
        content: `[✌  ✊  ✋] \n${interaction.user}형이 가위바위보 도전장을 내밀었어. \n도전을 받아들일 형들은 아래 버튼을 5초 안에 눌러!!!`,
        components: [row],
      });

      //button logic
      const filter = (i) =>
        ["scissors", "rock", "paper"].includes(i.customId) &&
        interaction.user.id != i.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 5000,
      });

      let challengerChoice = 0;

      collector.on("collect", async (i) => {
        if (i.customId === "scissors") {
          // await i.deferUpdate();
          gamedata.set(i.user, 2);
        } else if (i.customId === "rock") {
          // await i.deferUpdate();
          gamedata.set(i.user, 1);
        } else if (i.customId === "paper") {
          // await i.deferUpdate();
          gamedata.set(i.user, 3);
        }
      });

      collector.on("end", async (collected) => {
        function delay(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        //승자 패자 나누가
        for (let i of gamedata.keys()) {
          if (gamedata.get(i) == weapons[userChoice]["weakTo"]) {
            winner.push(i);
          } else if (gamedata.get(i) == weapons[userChoice]["strongTo"]) {
            loser.push(i);
          } else if (gamedata.get(i) == userChoice) {
            whoDraw.push(i);
          }
        }

        //묵찌빠 애니메이션
        await interaction.editReply({
          content: `${chat[1]}────────${chat[2]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[2]}────────${chat[3]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[3]}────────${chat[1]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[1]}────────${chat[2]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[2]}────────${chat[3]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[3]}────────${chat[1]}`,
          components: [],
        });
        await delay(100);
        await interaction.editReply({
          content: `${chat[1]}────────${chat[2]}`,
          components: [],
        });

        let winnerCon = [];
        let loserCon = [];
        let drawCon = [];

        if (winner.length == 0) {
          winnerCon = "이긴 사람이 없어!";
        } else {
          winnerCon = winner;
        }

        if (loser.length == 0) {
          loserCon = "진 사람이 없어!";
        } else {
          loserCon = loser;
        }

        if (whoDraw.length == 0) {
          drawCon = "비긴 사람이 없어!";
        } else {
          drawCon = whoDraw;
        }

        // await interaction.editReply({
        //   content: `${interaction.user}형은 ${chat[userChoice]}를 골랐어!\n\n${
        //     chat[weapons[userChoice]["weakTo"]]
        //   }를 골라서 이긴 형 : ${winnerCon}\n${
        //     chat[weapons[userChoice]["strongTo"]]
        //   }를 골라서 진 형 : ${loserCon}\n${
        //     chat[userChoice]
        //   }를 골라서 비긴 형 : ${drawCon}\n`,
        //   components: [],
        // });

        await interaction.editReply({
          content: `${interaction.user}형은 ${chat[userChoice]}를 골랐어!\n\n\n이겼어 축하해!!🎉 : ${winnerCon}\n\n 아쉽지만 졌어..😢 : ${loserCon}\n\n통했나봐. 비겼어!${chat[userChoice]} : ${drawCon}\n`,
          components: [],
        });

        isStarted = false;
      });
    }
  },
};
