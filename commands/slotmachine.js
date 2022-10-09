const { SlashCommandBuilder } = require("discord.js");
const { loadGame, createGame, updateGame } = require(`../prisma/slotmachine`);
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

let isStarted = false;
let stackedMoney = 0;
const price = 10;
// const channelId = ["1009103539412414494"];
const channelId = ["962244779171799060"];
const basicPrize = 1000;
const secondPrize = (basicPrize / 10) * 3;
const thirdPrize = (basicPrize / 10) * 1.5;
const fourthPrize = (basicPrize / 10) * 1;
const gameDataMap = new Map();

const defaultMessage = [
  `형이 룰렛을 돌리는 중이야\n잭팟 터지면**`, //0
  `BTC** 는 형이 다 갖는거야..!\n\n\`[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\`\n\`\`\`⭐️ JACKPOT ⭐️ : `, //1
  ` BTC\n\n🇰🇷x3 or ⭐️x3: `, //2
  ` BTC\n💰x3 or 🍔x3 or 🍌x3 : `, //3
  ` BTC\n🦖x3 or 🐮x3 or 🐵x3  : `, //4
  // ` BTC\n⭐️ ⭐️ ⭐️ : `, //5
  ` BTC\n\n🐞 🐞 🐞 : ⭐️ JACKPOT ⭐️\`\`\`\n`, //6
  `\n\``, //7
  ` `, //8
  ` `, //9
  `\` `, //10
];

function defMessage(
  user,
  stackedMoneyBefore,
  stackedMoney,
  secondPrize,
  char,
  res,
  check
) {
  let message =
    "<@" +
    user +
    ">" +
    defaultMessage[0] +
    stackedMoneyBefore +
    defaultMessage[1] +
    stackedMoneyBefore +
    defaultMessage[2] +
    secondPrize +
    defaultMessage[3] +
    thirdPrize +
    defaultMessage[4] +
    fourthPrize +
    defaultMessage[5] +
    // secondPrize +
    // defaultMessage[6] +
    "`" +
    check[0] +
    " " +
    check[1] +
    " " +
    check[2] +
    "`" +
    defaultMessage[6] +
    char[res[1]] +
    defaultMessage[7] +
    char[res[2]] +
    defaultMessage[8] +
    char[res[3]] +
    defaultMessage[9];
  return message;
}

const characters = {
  0: "🦖",
  1: "💩",
  2: "🇰🇷",
  3: "💰",
  4: "🍔",
  5: "🐮",
  6: "🐞",
  7: "⭐️",
  8: "🐵",
  9: "🍌",
  10: "⬜️",
};
async function randNum() {
  const num = Math.floor(Math.random() * 10);
  return num;
}
function message() {
  let message = "";
  return message;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("슬롯머신")
    .setDescription(
      `슬롯 머신을 돌립니다. 당첨 확률은 "1/1000" 비용 : ${price} BTC`
    ),
  async execute(interaction) {
    // channel Lock
    if (!channelId.includes(interaction.channel.id)) {
      let message = "슬롯머신은 다음 채널에서만 사용 가능해! : ";
      for (let i of channelId) {
        message += `<#${i}> `;
      }
      await interaction.reply({
        content: `${message}`,
        ephemeral: true,
      });
      return;
    }

    // isStarted Check
    if (isStarted == true) {
      await interaction.reply({
        content: `누군가 룰렛을 돌리고 있어. 잠시 후에 도전해봐!`,
        ephemeral: true,
      });
      return;
    }

    const user = interaction.user;
    //userStarted
    if (gameDataMap.has(user)) {
      await interaction.reply({
        content: `형은 이미 슬롯머신을 돌리고 있어!`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    //checkbalance
    const getUserBalance = await bankManager.getBalance(interaction.user);
    const userBalance = getUserBalance.point.current;
    if (userBalance < 10) {
      await interaction.editReply({
        content: `형.. 잔액이 부족해.. \`/show\` 명령어로 잔액확인 한번 해봐!`,
        ephemeral: true,
      });
      return;
    }

    //gameStart
    gameDataMap.set(user, { 1: 10, 2: 10, 3: 10 });
    let check = ["❓", "❓", "❓"];

    isStarted = true;
    let gameData = await loadGame();
    if (!gameData) {
      gameData = await createGame(basicPrize);
    }
    let stackedMoneyBefore = gameData.prize;

    //price만큼 은행으로 입금
    await bankManager.depositBTC(interaction.user, String(price));

    await interaction.editReply(
      defMessage(
        user,
        stackedMoneyBefore,
        stackedMoney,
        secondPrize,
        characters,
        gameDataMap.get(user),
        check
      )
    );

    await interaction.editReply(
      defMessage(
        user,
        stackedMoneyBefore,
        stackedMoney,
        secondPrize,
        characters,
        gameDataMap.get(user),
        check
      )
    );
    for (let i = 1; i < 4; i++) {
      let num = 0;
      //3~7
      const countRand = Math.floor(Math.random() * 3 + 5);
      for (let j = 0; j < countRand; j++) {
        // await delay(50);
        num = await randNum();
        gameDataMap.get(user)[i] = num;

        await interaction.editReply(
          defMessage(
            user,
            stackedMoneyBefore,
            stackedMoney,
            secondPrize,
            characters,
            gameDataMap.get(user),
            check
          )
        );
        if (j == countRand - 1) {
          check[i - 1] = "✅";
        }
      }
      await delay(300);
    }

    //secondPrize
    if (
      gameDataMap.get(user)[1] == gameDataMap.get(user)[2] &&
      gameDataMap.get(user)[2] == gameDataMap.get(user)[3] &&
      (gameDataMap.get(user)[3] == 2 || gameDataMap.get(user)[3] == 7)
    ) {
      await bankManager.withdrawBTC(interaction.user, secondPrize);
      const loseGame = await updateGame({
        id: gameData.id,
        prize: gameData.prize,
        hasWinner: gameData.hasWinner,
        winner: gameData.winner,
      });
      stackedMoney = loseGame.prize;

      await interaction.editReply(
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          secondPrize,
          characters,
          gameDataMap.get(user),
          check
        ) +
          `\n\n**[그윽하게 쳐다보는]** 로벅트 🤖 : 잭팟은 아니지만 ${
            characters[gameDataMap.get(user)[3]]
          } 3개가 나왔습니땅. 이것도 흔치 않으니 ${secondPrize} BTC 를 드리겠습니땅. 🎉축하드립니땅!🎉\n JACKPOT은 ⭐️ **${stackedMoney} BTC** ⭐️ 가 됐습니땅!`
      );
      isStarted = false;
    }
    //thirdPrize
    else if (
      gameDataMap.get(user)[1] == gameDataMap.get(user)[2] &&
      gameDataMap.get(user)[2] == gameDataMap.get(user)[3] &&
      (gameDataMap.get(user)[3] == 3 ||
        gameDataMap.get(user)[3] == 4 ||
        gameDataMap.get(user)[3] == 9)
    ) {
      await bankManager.withdrawBTC(interaction.user, thirdPrize);
      const loseGame = await updateGame({
        id: gameData.id,
        prize: gameData.prize,
        hasWinner: gameData.hasWinner,
        winner: gameData.winner,
      });
      stackedMoney = loseGame.prize;

      await interaction.editReply(
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          thirdPrize,
          characters,
          gameDataMap.get(user),
          check
        ) +
          `\n\n**[그윽하게 쳐다보는]** 로벅트 🤖 : 잭팟은 아니지만 ${
            characters[gameDataMap.get(user)[3]]
          } 3개가 나왔습니땅. 이것도 흔치 않으니 ${thirdPrize} BTC 를 드리겠습니땅. 🎉축하드립니땅!🎉\n JACKPOT은 ⭐️ **${stackedMoney} BTC** ⭐️ 가 됐습니땅!`
      );
      isStarted = false;
    }
    //fourthPrize
    else if (
      gameDataMap.get(user)[1] == gameDataMap.get(user)[2] &&
      gameDataMap.get(user)[2] == gameDataMap.get(user)[3] &&
      (gameDataMap.get(user)[3] == 0 ||
        gameDataMap.get(user)[3] == 5 ||
        gameDataMap.get(user)[3] == 8)
    ) {
      await bankManager.withdrawBTC(interaction.user, fourthPrize);
      const loseGame = await updateGame({
        id: gameData.id,
        prize: gameData.prize,
        hasWinner: gameData.hasWinner,
        winner: gameData.winner,
      });
      stackedMoney = loseGame.prize;

      await interaction.editReply(
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          fourthPrize,
          characters,
          gameDataMap.get(user),
          check
        ) +
          `\n\n**[그윽하게 쳐다보는]** 로벅트 🤖 : 잭팟은 아니지만 ${
            characters[gameDataMap.get(user)[3]]
          } 3개가 나왔습니땅. 이것도 흔치 않으니 ${fourthPrize} BTC 를 드리겠습니땅. 🎉축하드립니땅!🎉\n JACKPOT은 ⭐️ **${stackedMoney} BTC** ⭐️ 가 됐습니땅!`
      );
      isStarted = false;
    }

    //jackPot
    else if (
      gameDataMap.get(user)[1] == gameDataMap.get(user)[2] &&
      gameDataMap.get(user)[2] == gameDataMap.get(user)[3] &&
      gameDataMap.get(user)[3] == 6
    ) {
      const jackpot = await updateGame({
        id: gameData.id,
        prize: gameData.prize,
        hasWinner: true,
        winner: interaction.user.id,
      });
      const prize = jackpot.prize;
      await bankManager.withdrawBTC(interaction.user, String(prize));
      const userBalance = await bankManager.getBalance(interaction.user);
      const message = [
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          secondPrize,
          characters,
          gameDataMap.get(user),
          check
        ) + `\n\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️🎊 🎉`,
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          secondPrize,
          characters,
          gameDataMap.get(user),
          check
        ) + `\n\n 🎊 🎉⭐️ 🌟 ⭐️ 🌟 J A C K P O T ⭐️ 🌟 ⭐️ 🌟 🎊 🎉`,
      ];
      for (let i = 0; i < 10; i++) {
        await interaction.editReply(`${message[i % 2]}`);
      }
      await interaction.editReply(
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          secondPrize,
          characters,
          gameDataMap.get(user),
          check
        ) +
          ` \n\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️ 🎊 🎉\n\n**[축하하는]**로벅트🤖 : 잭팟을 축하합니땅! 형 주머니에 상금 ${prize} BTC 넣어놨어! | ${interaction.user}💰 : ${userBalance.point.current} BTC🐞`
      );
      isStarted = false;
    } else {
      const loseGame = await updateGame({
        id: gameData.id,
        prize: gameData.prize + price / 2,
        hasWinner: gameData.hasWinner,
        winner: gameData.winner,
      });
      stackedMoney = loseGame.prize;
      await interaction.editReply(
        defMessage(
          user,
          stackedMoneyBefore,
          stackedMoney,
          secondPrize,
          characters,
          gameDataMap.get(user),
          check
        ) +
          `\n\n**[${price} BTC 를 주머니에 넣는]** 로벅트 🤖 : 이제 상금은 ⭐️ **${stackedMoney} BTC** ⭐️ 가 됐습니땅!\n 어차피 10BTC 얼마 안하는데 한번 더 하는건 어떻습니깡?😁`
      );
      isStarted = false;
    }
    gameDataMap.delete(user);
  },
};
