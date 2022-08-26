const { SlashCommandBuilder } = require("discord.js");
const { rawListeners } = require("node:process");
// const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
// const { channel } = require("node:diagnostics_channel");
// const { send } = require("node:process");
const wait = require("node:timers/promises").setTimeout;

const channelId = "1009096382432411819";
const gamedata = new Map();

let code = 0;
let interactions = [];

const fee = 3;
const FEE_TO_CALCULATABLE = 1 - fee / 100;
const winRate = 2.5;
const drawRate = 0.5;

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
    .setDescription(
      "🤖 : 나와 가위바위보를 해서 이기면 베팅금액의 2.5배를 줍니땅 삐빕"
    )
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
    )
    .addIntegerOption((option) =>
      option
        .setName("bet")
        .setDescription(`베팅 금액을 입력합니다.(수수료 : ${fee}%)`)
        .setRequired(true)
    ),
  async execute(interaction) {
    const gameCode = code;
    code++;
    interactions[gameCode] = interaction;

    //calc bet amount without fee
    const betAmountBeforeFee = interactions[gameCode].options.getInteger("bet");
    const RAW_betAmount = betAmountBeforeFee * FEE_TO_CALCULATABLE;
    const betAmount = Math.round(RAW_betAmount * 100) / 100;
    console.log(betAmount);

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

    let sendMessage = `${firstuser} : ${
      chat[gamedata.get(firstuser)]
    } −−−−−− 🆚 −−−−−− ${chat[gamedata.get(seconduser)]} : ${seconduser}`;

    if (weapons[gamedata.get(firstuser)].weakTo === gamedata.get(seconduser)) {
      winner = seconduser;
    } else if (
      weapons[gamedata.get(firstuser)].strongTo === gamedata.get(seconduser)
    ) {
      winner = firstuser;
    } else winner = "DRAW";

    //비겼을 때
    if (winner === "DRAW") {
      sendMessage += `\n**[DRAW]**\n\n🤖 : 비겼으니 베팅금액의 ${drawRate}배인 ${
        betAmount * drawRate
      } BTC🐞는 돌려줍니땅 삐빕`;
      //0.5배 지급
      await interactions[gameCode].editReply(`${sendMessage}`);
    }
    //누군가 이겼을 때
    else {
      sendMessage += `\n🎉**WINNER**🎉 : ${winner}`;
      if (winner === firstuser) {
        //2.5배 지급
        sendMessage += `\n\n🤖 : 나를 이겼으니 베팅금액의 ${winRate}배인 ${
          betAmount * winRate
        } BTC🐞를 드립니땅 삐빕🤖`;
      } else {
        //2.5배 지급
        sendMessage += `\n\n🤖 : 내가 이겼으니 베팅금액은 **벅크셔해서웨이**에서 좋은 곳에 쓰겠습니땅! 삐빕`;
      }
      await interactions[gameCode].editReply(`${sendMessage}`);
    }
  },
};
