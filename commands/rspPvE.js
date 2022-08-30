const { SlashCommandBuilder } = require("discord.js");
const { rawListeners } = require("node:process");
const util = require(`util`);
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();
const wait = require("node:timers/promises").setTimeout;

const channelId = ["962244779171799060", "939866440968863805"];
// const channelId = "1009096382432411819";
const gamedata = new Map();

//fee is percentage point
const staticFee = 0;
const fee = 0;
const FEE_TO_CALCULATABLE = 1 - fee / 100;
const winRate = 2.5;
const drawRate = 0.3;
const betLimit = 1000;

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
    const user = interaction.user;
    //multiple game check
    if (gamedata.has(user)) {
      await interaction.reply({
        content: `형은 이미 진행중인 게임이 있네.. 잠시 후에 시도해봐!`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    //calc bet amount without fee
    const betAmountBeforeFee = interaction.options.getInteger("bet");
    const RAW_betAmount = betAmountBeforeFee * FEE_TO_CALCULATABLE;
    const betAmount = Math.round(RAW_betAmount * 100) / 100;

    // limit bet amount
    if (betAmountBeforeFee > betLimit) {
      await interaction.editReply({
        content: `형.. 지금 사업 초기라 ${betLimit} BTC 이하로만 베팅 가능해!`,
        ephemeral: true,
      });
      return;
    }

    // channel Lock
    if (!channelId.includes(interaction.channel.id)) {
      let message = "가위바위보를 할 수 있는 채널을 알려줄게! : ";
      for (let i of channelId) {
        message += `<#${i}> `;
      }
      await interaction.editReply({
        content: `${message}`,
        ephemeral: true,
      });
      return;
    }

    //minimum betAmount
    const MINIMUM_BETAMOUNT = 5;
    if (betAmountBeforeFee < MINIMUM_BETAMOUNT) {
      await interaction.editReply({
        content: `최소 베팅 금액은 5 BTC야!`,
        ephemeral: true,
      });
      return;
    }

    //BTC Balance check
    const balances = await bankManager.getBalances(user);
    const storageBalance = balances.data.storage;
    const getUserBalance = await bankManager.getBalance(user);
    const userBalance = getUserBalance.point.current;
    if (userBalance < betAmountBeforeFee + staticFee) {
      await interaction.editReply({
        content: `형.. 잔액이 부족해.. \`/show\` 명령어로 잔액확인 한번 해봐!`,
        ephemeral: true,
      });
      return;
    }
    if (storageBalance < betAmountBeforeFee * winRate) {
      await interaction.editReply({
        content: `벅크셔해서웨이 금고에 형이 이겼을 때 형한테 줄 돈이 충분하지 않아... 조금만 더 적은 금액으로 베팅해줄 수 있어..?😭\n베팅가능금액 : ${
          storageBalance / winRate
        } 이하`,
        ephemeral: true,
      });
      return;
    }

    //Deposit BTC
    // await bankManager.depositBTC(user, String(staticFee));
    await bankManager.depositBTC(user, String(betAmountBeforeFee));

    let winner = null;

    //firstuser : who entered command
    const firstuser = interaction.user;
    const seconduser = "🤖";

    // [(firstuser => null)
    gamedata.set(firstuser, null);

    const computerChoice = Math.floor(Math.random() * 3 + 1);
    gamedata.set(seconduser, computerChoice);

    //logic
    const userChoice = interaction.options.getInteger("choice");
    gamedata.set(interaction.user, { user: userChoice, com: computerChoice });

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    //안내면진다 가위바위보
    await delay(200);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안**`,
      ephemeral: false,
    });
    await delay(300);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내**`,
      ephemeral: false,
    });
    await delay(100);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면**`,
      ephemeral: false,
    });
    await delay(200);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진**`,
      ephemeral: false,
    });
    await delay(200);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!**`,
      ephemeral: false,
    });

    await delay(500);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위!`,
      ephemeral: false,
    });
    await delay(200);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위! 바위!`,
      ephemeral: false,
    });
    await delay(200);
    await interaction.editReply({
      content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위! 바위! 보!`,
      ephemeral: false,
    });

    await delay(200);

    let sendMessage = `${
      chat[gamedata.get(firstuser).user]
    } : ${firstuser}\n🆚\n${chat[gamedata.get(firstuser).com]} : ${seconduser}`;

    if (
      weapons[gamedata.get(firstuser).user].weakTo ===
      gamedata.get(firstuser).com
    ) {
      winner = seconduser;
    } else if (
      weapons[gamedata.get(firstuser).user].strongTo ===
      gamedata.get(firstuser).com
    ) {
      winner = firstuser;
    } else winner = "DRAW";

    //비겼을 때
    if (winner === "DRAW") {
      //drawRate(0.5)배 지급
      const returnBTC = Math.round(betAmount * drawRate * 100) / 100;
      await bankManager.withdrawBTC(user, String(returnBTC));
      const resultBalance = await bankManager.getBalance(user);

      sendMessage += `\n\n**[DRAW]**\n\n🤖 : 삐빕.. 비겼습니땅! \n베팅금액의 ${
        drawRate * 100
      }%인 ${returnBTC} BTC🐞는 집가면서 국밥이라도 챙겨드시라고 돌려줍니땅 | 잔고 : [${
        resultBalance.point.current
      } BTC]`;

      await interaction.editReply(`${sendMessage}`);
    }
    //누군가 이겼을 때
    else {
      sendMessage += `\n\n**[WINNER]** : ${winner}`;
      if (winner === firstuser) {
        //winRate(2.5)배 지급
        const winBTC = Math.round(betAmount * winRate * 100) / 100;
        await bankManager.withdrawBTC(user, String(winBTC));
        const resultBalance = await bankManager.getBalance(user);
        sendMessage += `\n\n🤖 : 나를 이겼으니 베팅금액의 ${winRate}배인 ${winBTC} BTC🐞를 드립니땅 삐빕 | 잔고 : [${resultBalance.point.current} BTC]`;
      } else {
        const resultBalance = await bankManager.getBalance(user);
        sendMessage += `\n\n🤖 : 내가 이겼으니 ${betAmountBeforeFee} BTC🐞는 **벅크셔해서웨이**에서 좋은 곳에 쓰겠습니땅! 감사합니땅! 삐빕 | 잔고 : [${resultBalance.point.current} BTC]`;
      }
      await interaction.editReply(`${sendMessage}`);
    }
    gamedata.delete(user);
  },
};
