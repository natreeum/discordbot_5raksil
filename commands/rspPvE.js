const { SlashCommandBuilder } = require("discord.js");
// const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
// const { channel } = require("node:diagnostics_channel");
// const { send } = require("node:process");
const wait = require("node:timers/promises").setTimeout;

const channelId = "1009096382432411819";
const gamedata = new Map();

let code = 0;
let interactions = [];

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
    .setName("혼자가위바위보")
    .setDescription("컴퓨터와 가위바위보 게임을 합니다.")
    .addIntegerOption((option) =>
      option
        .setName("choice")
        .setDescription(`가위 바위 보 중 하나를 선택합니다.`)
        .addChoices(
          { name: "가위", value: 2 },
          { name: "바위", value: 1 },
          { name: "보", value: 3 }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const gameCode = code;
    code++;
    interactions[gameCode] = interaction;

    // channel Lock
    if (interactions[gameCode].channel.id != channelId) {
      const thisChannel =
        interactions[gameCode].client.channels.cache.get(channelId);
      await interactions[gameCode].reply(
        `${thisChannel}에서 명령어를 이용해줘😉`
      );
      return;
    }

    //BTC Balance Check
    //

    let winner = null;

    //firstuser : who entered command
    const firstuser = interactions[gameCode].user;
    const seconduser = "🤖";

    // [(firstuser => null)
    gamedata.set(firstuser, null);

    const computerChoice = Math.floor(Math.random() * 3 + 1);
    gamedata.set(seconduser, computerChoice);

    //logic
    const userChoice = await interaction.options.getInteger("choice");
    gamedata.set(interaction.user, userChoice);

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await interaction.reply(`🤖 : 삐빕 삐빕.. 가위바위보 진행중..`);
    await wait(500);
    for (let i = 0; i < 2; i++) {
      await interactions[gameCode].editReply({
        content: `${chat[1]}────────${chat[2]}`,
        components: [],
      });
      await delay(100);
      await interactions[gameCode].editReply({
        content: `${chat[2]}────────${chat[3]}`,
        components: [],
      });
      await delay(100);
      await interactions[gameCode].editReply({
        content: `${chat[3]}────────${chat[1]}`,
        components: [],
      });
    }
    await delay(200);

    let sendMessage = "";

    if (weapons[gamedata.get(firstuser)].weakTo === gamedata.get(seconduser)) {
      winner = seconduser;
    } else if (
      weapons[gamedata.get(firstuser)].strongTo === gamedata.get(seconduser)
    ) {
      winner = firstuser;
    } else winner = "DRAW";

    //비겼을 때
    if (winner === "DRAW") {
      sendMessage += `${firstuser} : ${
        chat[gamedata.get(firstuser)]
      } - ${seconduser} : ${
        chat[gamedata.get(seconduser)]
      }\n**[DRAW]**  컴퓨터랑 통하다니.. 당신..혹시...🤖?`;
      await interactions[gameCode].editReply(`${sendMessage}`);
    }
    //누군가 이겼을 때
    else {
      sendMessage += `${firstuser} : ${
        chat[gamedata.get(firstuser)]
      } - ${seconduser} : ${
        chat[gamedata.get(seconduser)]
      }\n🎉**WINNER**🎉 : ${winner}`;
      if (winner === firstuser) {
        //2.5배 지급
      }
      await interactions[gameCode].editReply(`${sendMessage}`);
    }
  },
};
