const { SlashCommandBuilder } = require("discord.js");
const { rawListeners } = require("node:process");
const util = require(`util`);
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();
const wait = require("node:timers/promises").setTimeout;

const channelId = "1009096382432411819";
const gamedata = new Map();

let code = 0;
let interactions = [];

//fee is percentage point
const fee = 1;
const FEE_TO_CALCULATABLE = 1 - fee / 100;
const winRate = 2.5;
const drawRate = 0.2;

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
    const user = interactions[gameCode].user;
    console.log(`gamecode : ${gameCode}`);
    //calc bet amount without fee
    const betAmountBeforeFee = interactions[gameCode].options.getInteger("bet");
    const RAW_betAmount = betAmountBeforeFee * FEE_TO_CALCULATABLE;
    const betAmount = Math.round(RAW_betAmount * 100) / 100;

    // channel Lock
    if (interactions[gameCode].channel.id != channelId) {
      const thisChannel =
        interactions[gameCode].client.channels.cache.get(channelId);
      await interactions[gameCode].reply(
        `${thisChannel}에서 명령어를 이용해줘😉`
      );
      return;
    }

    //minimum betAmount
    const MINIMUM_BETAMOUNT = 5;
    if (betAmountBeforeFee < MINIMUM_BETAMOUNT) {
      await interactions[gameCode].reply({
        content: `최소 베팅 금액은 5 BTC야!`,
        ephemeral: true,
      });
      return;
    }
    //BTC Balance Check
    // const userBalance = await bankManager.getBalance(user);
    // console.log(`userBalance : ${util.inspect(userBalance)}`);

    //BTC Balance Check꼼수
    const getUserBalance = await bankManager.getBalance(user);
    const userBalance = getUserBalance.data.citizen;
    const bankBalance = getUserBalance.data.storage;
    if (userBalance < betAmountBeforeFee) {
      await interactions[gameCode].reply({
        content: `형.. 잔액이 부족해.. \`/show\` 명령어로 잔액확인 한번 해봐!`,
        ephemeral: true,
      });
      return;
    }
    if (bankBalance < betAmountBeforeFee * 2) {
      await interactions[gameCode].reply({
        content: `벅크셔해서웨이 금고에 형이 이겼을 때 형한테 줄 돈이 충분하지 않아... 조금만 더 적은 금액으로 베팅해줄 수 있어..?😭`,
        ephemeral: true,
      });
      return;
    }

    //Deposit BTC
    await bankManager.depositBTC(user, String(betAmountBeforeFee));

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

    // await interaction.reply(`🤖 : 삐빕 삐빕.. 가위바위보 진행중..`);
    // await wait(500);
    // for (let i = 0; i < 2; i++) {
    //   await interactions[gameCode].editReply({
    //     content: `${chat[1]}────────${chat[2]}`,
    //     components: [],
    //   });
    //   await delay(100);
    //   await interactions[gameCode].editReply({
    //     content: `${chat[2]}────────${chat[3]}`,
    //     components: [],
    //   });
    //   await delay(100);
    //   await interactions[gameCode].editReply({
    //     content: `${chat[3]}────────${chat[1]}`,
    //     components: [],
    //   });
    // }
    // await delay(200);

    await interactions[gameCode].reply(`🤖 : 삐빕 삐빕.. 가위바위보 진행중..`);

    await delay(200);
    await interactions[gameCode].editReply({
      content: `.\n**안**`,
      components: [],
    });
    await delay(300);
    await interactions[gameCode].editReply({
      content: `.\n**안 내**`,
      components: [],
    });
    await delay(100);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면**`,
      components: [],
    });
    await delay(200);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면 진**`,
      components: [],
    });
    await delay(200);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면 진다!**`,
      components: [],
    });

    await delay(500);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면 진다!** 가위!`,
      components: [],
    });
    await delay(200);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면 진다!** 가위! 바위!`,
      components: [],
    });
    await delay(200);
    await interactions[gameCode].editReply({
      content: `.\n**안 내면 진다!** 가위! 바위! 보!`,
      components: [],
    });

    await delay(200);

    let sendMessage = `수수료 차감된 베팅 금액 : ${betAmount}\n${
      chat[gamedata.get(firstuser)]
    } : ${firstuser}\n🆚\n${chat[gamedata.get(seconduser)]} : ${seconduser}`;

    if (weapons[gamedata.get(firstuser)].weakTo === gamedata.get(seconduser)) {
      winner = seconduser;
    } else if (
      weapons[gamedata.get(firstuser)].strongTo === gamedata.get(seconduser)
    ) {
      winner = firstuser;
    } else winner = "DRAW";

    //비겼을 때
    if (winner === "DRAW") {
      //drawRate(0.5)배 지급
      const returnBTC = Math.round(betAmount * drawRate * 100) / 100;
      await bankManager.withdrawBTC(user, String(returnBTC));
      const resultBalance = await bankManager.getBalance(user);

      sendMessage += `\n\n**[DRAW]**\n\n🤖 : 비겼으니 베팅금액의 ${drawRate}배인 ${returnBTC} BTC🐞는 돌려줍니땅 삐빕 | 잔고 : [${resultBalance.data.citizen} BTC]`;

      await interactions[gameCode].editReply(`${sendMessage}`);
    }
    //누군가 이겼을 때
    else {
      sendMessage += `\n\n**[WINNER]** : ${winner}`;
      if (winner === firstuser) {
        //winRate(2.5)배 지급
        const winBTC = Math.round(betAmount * winRate * 100) / 100;
        await bankManager.withdrawBTC(user, String(winBTC));
        const resultBalance = await bankManager.getBalance(user);
        sendMessage += `\n\n🤖 : 나를 이겼으니 베팅금액의 ${winRate}배인 ${winBTC} BTC🐞를 드립니땅 삐빕 | 잔고 : [${resultBalance.data.citizen} BTC]`;
      } else {
        const resultBalance = await bankManager.getBalance(user);
        sendMessage += `\n\n🤖 : 내가 이겼으니 ${betAmountBeforeFee} BTC🐞는 **벅크셔해서웨이**에서 좋은 곳에 쓰겠습니땅! 감사합니땅! 삐빕 | 잔고 : [${resultBalance.data.citizen} BTC]`;
      }
      await interactions[gameCode].editReply(`${sendMessage}`);
    }
  },
};
