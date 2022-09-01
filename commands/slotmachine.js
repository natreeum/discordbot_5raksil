const { SlashCommandBuilder } = require("discord.js");
const { loadGame, createGame, updateGame } = require(`../prisma/slotmachine`);
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

let isStarted = false;
let stackedMoney = 0;
const price = 10;
const channelId = ["962244779171799060"];

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

    //isStarted Check
    if (isStarted == true) {
      await interaction.reply({
        content: `누군가 룰렛을 돌리고 있어. 잠시 후에 도전해봐!`,
        ephemeral: true,
      });
      return;
    }

    //gameStart
    else {
      isStarted = true;
      await interaction.deferReply();
      let gameData = await loadGame();
      if (!gameData) {
        gameData = await createGame();
      }
      stackedMoney = gameData.prize;

      //price만큼 은행으로 입금
      await bankManager.depositBTC(interaction.user, String(price));

      await interaction.editReply(
        `⭐️ JACKPOT ⭐️ : ${stackedMoney} BTC\n\n${interaction.user}형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟!`
      );
      const result = {
        1: 10,
        2: 10,
        3: 10,
      };

      const message = `⭐️ JACKPOT ⭐️ : ${stackedMoney} BTC\n\n${
        interaction.user
      }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
        characters[result[1]]
      } ${characters[result[2]]} ${characters[result[3]]} `;
      await interaction.editReply(`${message}`);
      for (let i = 1; i < 4; i++) {
        //3~7
        const countRand = Math.floor(Math.random() * 3 + 5);
        for (let j = 0; j < countRand; j++) {
          await delay(500);
          result[i] = await randNum();
          await interaction.editReply(
            `⭐️ JACKPOT ⭐️ : ${stackedMoney} BTC\n\n${
              interaction.user
            }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
              characters[result[1]]
            } ${characters[result[2]]} ${characters[result[3]]} `
          );
        }
      }

      //jackpot
      if (result[1] == result[2] && result[2] == result[3] && result[3] == 6) {
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
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
            characters[result[1]]
          } ${characters[result[2]]} ${
            characters[result[3]]
          }\n\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️🎊 🎉`,
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
            characters[result[1]]
          } ${characters[result[2]]} ${
            characters[result[3]]
          }\n\n 🎊 🎉⭐️ 🌟 ⭐️ 🌟 J A C K P O T ⭐️ 🌟 ⭐️ 🌟 🎊 🎉`,
        ];
        for (let i = 0; i < 10; i++) {
          await interaction.editReply(`${message[i % 2]}`);
        }

        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
            characters[result[1]]
          } ${characters[result[2]]} ${
            characters[result[3]]
          } \n\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️ 🎊 🎉\n\n**[축하하는]**로벅트🤖 : 잭팟을 축하합니땅! 형 주머니에 상금 ${prize} BTC 넣어놨어! | ${
            interaction.user
          }💰 : ${userBalance.point.current} BTC🐞`
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
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n[ 🦖 | 💩 | 🇰🇷 | 💰 | 🍔 | 🐮 | 🐞 | ⭐️ | 🐵 | 🍌 ]\n\n🐞 🐞 🐞 나오면 잭팟! \n\n${
            characters[result[1]]
          } ${characters[result[2]]} ${
            characters[result[3]]
          }\n\n**[${price} BTC 를 주머니에 넣는]** 로벅트 🤖 : 이제 상금은 ⭐️ **${stackedMoney} BTC** ⭐️ 가 됐습니땅!\n 어차피 10BTC 얼마 안하는데 한번 더 하는건 어떻습니깡?😁`
        );
        isStarted = false;
      }
    }
  },
};
