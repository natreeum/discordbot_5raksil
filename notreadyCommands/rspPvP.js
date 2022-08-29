const { SlashCommandBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { channel } = require("node:diagnostics_channel");
const { send } = require("node:process");
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

const fee = 3;
const FEE_TO_CALCULATABLE = 1 - fee / 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("가위바위보")
    .setDescription("가위바위보 게임을 합니다.")
    .addUserOption((option) =>
      option
        .setName("selectuser")
        .setDescription("겨루고 싶은 상대를 고릅니다.")
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
    const betAmountBeforeFee = interactions[gameCode].options.getInteger("bet");

    // channel Lock
    if (interactions[gameCode].channel.id != channelId) {
      const thisChannel =
        interactions[gameCode].client.channels.cache.get(channelId);
      await interactions[gameCode].reply(
        `${thisChannel}에서 명령어를 이용해줘😉`
      );
      return;
    }

    // ToDo : BTC Balance Check
    // if(getBalance(player 1) > betAmountBeforeFee
    // if(getBalance(player 2) > betAmountBeforeFee

    const RAW_betAmount = betAmountBeforeFee * FEE_TO_CALCULATABLE;
    const betAmount = Math.round(RAW_betAmount * 100) / 100;

    let winner = null;

    //firstuser : who entered command
    //seconuser : vs
    firstuser = interactions[gameCode].user;
    seconduser = interactions[gameCode].options.getUser("selectuser");
    if (firstuser === seconduser) {
      await interactions[gameCode].reply(
        `5252~ 차라리 화장실 가서 거울이랑 가위바위보를 하지 그래??`
      );
      // ToDo : Bank
      // player1 betAmountBeforeFee만큼 뺏기
      // player1 betAmount 지급
      return;
    } else if (seconduser.bot === true) {
      await interactions[gameCode].reply(
        `🤖 삐빕 - 로봇은 가위바위보를 할 수 없습니다. 삐빕- 🤖`
      );
      // ToDo : Bank
      // player1 betAmountBeforeFee만큼 뺏기
      // player1 betAmount 지급
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
    await interactions[gameCode].reply({
      content: `[✌  ✊  ✋]\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!`,
      components: [row],
    });

    //button logic
    const filter = (i) =>
      ["scissors", "rock", "paper"].includes(i.customId) &&
      [firstuser, seconduser].includes(i.user);

    const collector = interactions[
      gameCode
    ].channel.createMessageComponentCollector({
      filter,
      time: 5000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "scissors") {
        await i.update({
          content: `[✌  ✊  ✋]\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!`,
          components: [row],
        });
        gamedata.set(i.user, 2);
      } else if (i.customId === "rock") {
        await i.update({
          content: `[✌  ✊  ✋]\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!`,
          components: [row],
        });
        gamedata.set(i.user, 1);
      } else if (i.customId === "paper") {
        await i.update({
          content: `[✌  ✊  ✋]\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!`,
          components: [row],
        });
        gamedata.set(i.user, 3);
      }
    });

    collector.on("end", async (collected) => {
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      await interaction.editReply({
        content: `🤖 : 삐빕 삐빕.. 가위바위보 진행중..`,
        components: [],
      });
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

      let sendMessage = "";
      //무효핸들링
      //1유저가 안눌렀을 때
      if (
        gamedata.get(firstuser) === null &&
        gamedata.get(seconduser) != null
      ) {
        winner = "invalid";
        gamedata.set(firstuser, 4);
        sendMessage += `${firstuser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!\n`;
        // ToDo : Bank
        // player1 betAmountBeforeFee만큼 뺏기
        // player1 betAmount 지급
        await interactions[gameCode].editReply(`${sendMessage}`);
      }
      //2유저가 안눌렀을 때
      else if (
        gamedata.get(firstuser) !== null &&
        gamedata.get(seconduser) === null
      ) {
        winner = "invalid";
        gamedata.set(seconduser, 4);
        sendMessage += `${seconduser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!\n`;
        // ToDo : Bank
        // player1 betAmountBeforeFee만큼 뺏기
        // player1 betAmount 지급
        await interactions[gameCode].editReply(`${sendMessage}`);
      }
      //둘다 버튼을 안눌렀을 때
      else if (
        gamedata.get(firstuser) === null &&
        gamedata.get(seconduser) === null
      ) {
        winner = "invalid";
        gamedata.set(firstuser, 4);
        gamedata.set(seconduser, 4);
        sendMessage += `🤔 뭐야 둘이 게임 안해??? 🤔\n`;
        // ToDo : Bank
        // player1 betAmountBeforeFee만큼 뺏기
        // player1 betAmount 지급
        await interactions[gameCode].editReply(`${sendMessage}`);
      }
      //둘 다 뭐라도 냈을 때
      else {
        if (
          weapons[gamedata.get(firstuser)].weakTo === gamedata.get(seconduser)
        )
          winner = seconduser;
        else if (
          weapons[gamedata.get(firstuser)].strongTo === gamedata.get(seconduser)
        )
          winner = firstuser;
        else winner = "DRAW";
      }
      if (winner === "DRAW") {
        sendMessage += `${chat[gamedata.get(firstuser)]} : ${firstuser}\n🆚\n${
          chat[gamedata.get(seconduser)]
        } : ${seconduser}\n\n**[DRAW]** 오~ 둘이 통했나본데~ 비겼어!!`;
        // ToDo : Bank
        // player1 betAmountBeforeFee만큼 뺏기
        // player1 betAmount 지급
        // player2 betAmountBeforeFee만큼 뺏기
        // player2 betAmount 지급
        await interactions[gameCode].editReply(`${sendMessage}`);
      } else if (winner === "invalid") {
        sendMessage += `${chat[gamedata.get(firstuser)]} : ${firstuser}\n🆚\n${
          chat[gamedata.get(seconduser)]
        } : ${seconduser}\n\n이번 게임은 무효야!!`;
        await interactions[gameCode].editReply(`${sendMessage}`);
      } else {
        sendMessage += `${chat[gamedata.get(firstuser)]} : ${firstuser}\n🆚\n${
          chat[gamedata.get(seconduser)]
        } : ${seconduser}\n\n**[WINNER]** : ${winner} \n\n승자에게는 ${
          betAmount * 2
        } BTC🐞 가 지급됐어!`;
        // ToDo : Bank
        // player1 betAmountBeforeFee만큼 뺏기
        // player2 betAmountBeforeFee만큼 뺏기
        // winner betAmount * 2 지급
        await interactions[gameCode].editReply(`${sendMessage}`);
      }
    });
  },
};
