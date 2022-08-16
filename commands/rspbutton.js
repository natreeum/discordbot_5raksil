const { SlashCommandBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { channel } = require("node:diagnostics_channel");
const wait = require("node:timers/promises").setTimeout;

const bot = ["1008665066041774130"];
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
    .setName("가위바위보")
    .setDescription("가위바위보 게임을 합니다.")
    .addUserOption((option) =>
      option
        .setName("selectuser")
        .setDescription("겨루고 싶은 상대를 고릅니다.")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.channel.id != channelId) {
      const thisChannel = interaction.client.channels.cache.get(channelId);
      await interaction.reply(`${thisChannel}에서 명령어를 이용해줘😉`);
      return;
    } else {
      if (isStarted == true) {
        await interaction.reply({
          content: `이미 게임이 진행중이야.. 조금만 기다려봐`,
          ephemeral: true,
        });
        return;
      }
      let winner = null;
      isStarted = true;

      //firstuser : who entered command
      //seconuser : vs
      firstuser = interaction.user;
      seconduser = interaction.options.getUser("selectuser");

      if (interaction.user === seconduser) {
        await interaction.reply(
          `5252~ 차라리 화장실 가서 거울이랑 가위바위보를 하지 그래??`
        );
        isStarted = false;
        return;
      } else if (bot.includes(seconduser.id)) {
        await interaction.reply(
          `🤖 삐빕 - 로봇은 가위바위보를 할 수 없습니다. 삐빕- 🤖`
        );
        isStarted = false;
        return;
      }

      // [(firstuser => null),(seconduser => null)]
      gamedata.set(firstuser, null);
      gamedata.set(seconduser, null);

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
        content: `[✌  ✊  ✋]\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!`,
        components: [row],
      });

      //button logic
      const filter = (i) =>
        ["scissors", "rock", "paper"].includes(i.customId) &&
        [firstuser, seconduser].includes(i.user);

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 5000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "scissors") {
          await i.deferUpdate();
          // await interaction.followUp(`${i.user}는 버튼을 눌렀어!`);
          gamedata.set(i.user, 2);
        } else if (i.customId === "rock") {
          await i.deferUpdate();
          // await interaction.followUp(`${i.user}는 버튼을 눌렀어!`);
          gamedata.set(i.user, 1);
        } else if (i.customId === "paper") {
          await i.deferUpdate();
          // await interaction.followUp(`${i.user}는 버튼을 눌렀어!`);
          gamedata.set(i.user, 3);
        }
      });

      collector.on("end", async (collected) => {
        //   console.log(
        //     `${firstuser} : ${gamedata.get(
        //       firstuser
        //     )}\n${seconduser} : ${gamedata.get(seconduser)}`
        //   );
        function delay(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
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

        //1유저가 안눌렀을 때
        if (
          gamedata.get(firstuser) === null &&
          gamedata.get(seconduser) != null
        ) {
          winner = "invalid";
          gamedata.set(firstuser, 4);
          await interaction.channel.send(
            `${firstuser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!`
          );
        }
        //2유저가 안눌렀을 때
        else if (
          gamedata.get(firstuser) !== null &&
          gamedata.get(seconduser) === null
        ) {
          winner = "invalid";
          gamedata.set(seconduser, 4);
          await interaction.channel.send(
            `${seconduser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!`
          );
        }
        //둘다 버튼을 안눌렀을 때
        else if (
          gamedata.get(firstuser) === null &&
          gamedata.get(seconduser) === null
        ) {
          winner = "invalid";
          gamedata.set(firstuser, 4);
          gamedata.set(seconduser, 4);
          await interaction.channel.send(`뭐야 둘이 게임 안해???`);
        }
        //둘 다 뭐라도 냈을 때
        else {
          if (
            weapons[gamedata.get(firstuser)].weakTo === gamedata.get(seconduser)
          )
            winner = seconduser;
          else if (
            weapons[gamedata.get(firstuser)].strongTo ===
            gamedata.get(seconduser)
          )
            winner = firstuser;
          else winner = "DRAW";
        }
        if (winner === "DRAW") {
          await interaction.channel.send(
            `${firstuser} : ${
              chat[gamedata.get(firstuser)]
            } - ${seconduser} : ${
              chat[gamedata.get(seconduser)]
            }\n오~ 둘이 통했나본데~ 비겼어!!`
          );
          isStarted = false;
        } else if (winner === "invalid") {
          await interaction.channel.send(
            `${firstuser} : ${
              chat[gamedata.get(firstuser)]
            } - ${seconduser} : ${
              chat[gamedata.get(seconduser)]
            }\n이번 게임은 무효야!!`
          );
          isStarted = false;
        } else {
          await interaction.channel.send(
            `${firstuser} : ${
              chat[gamedata.get(firstuser)]
            } - ${seconduser} : ${
              chat[gamedata.get(seconduser)]
            }\nWinner : ${winner}`
          );
          isStarted = false;
        }
      });
    }
  },
};
