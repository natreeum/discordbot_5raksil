const { SlashCommandBuilder } = require("discord.js");
const { Client, GatewayIntentBits } = require("discord.js");
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

let isStarted = false;
let stackedMoney = 0;
const price = 30;
const channelId = "1009103539412414494";

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
  // console.log(num);
  return num;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("슬롯머신")
    .setDescription(`슬롯 머신을 돌립니다. 비용 : ${price}원`),
  async execute(interaction) {
    //channel lock
    const thisChannel = interaction.client.channels.cache.get(channelId);
    if (interaction.channel != thisChannel) {
      await interaction.reply(`${thisChannel}에서 명령어를 이용해줘😉`);
      return;
    }

    //isStarted Check
    if (isStarted == true) {
      await interaction.reply({
        content: `룰렛이 돌아가고 있어 잠시 후에 도전해봐!`,
        ephemeral: true,
      });
      return;
    }

    //gameStart
    else {
      isStarted = true;
      //price만큼 은행으로 입금
      await bankManager.depositBTC(user, String(price));

      const message = await interaction.reply(
        `${interaction.user}형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟!`
      );
      const result = {
        1: 10,
        2: 10,
        3: 10,
        4: 10,
      };

      for (let i = 1; i < 5; i++) {
        const countRand = Math.floor(Math.random() * 5 + 3);
        for (let j = 0; j < countRand; j++) {
          await interaction.editReply(
            `${
              interaction.user
            }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
              characters[result[1]]
            } ${characters[result[2]]} ${characters[result[3]]} ${
              characters[result[4]]
            }`
          );

          await delay(50);
          result[i] = await randNum();
          await interaction.editReply(
            `${
              interaction.user
            }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
              characters[result[1]]
            } ${characters[result[2]]} ${characters[result[3]]} ${
              characters[result[4]]
            }`
          );
        }
        await delay(50);
        result[i] = await randNum();
        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
            characters[result[1]]
          } ${characters[result[2]]} ${characters[result[3]]} ${
            characters[result[4]]
          }`
        );
      }

      if (
        result[1] == result[2] &&
        result[2] == result[3] &&
        result[3] == result[4] &&
        result[4] == 6
      ) {
        stackedMoney = 0;
        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
            characters[result[1]]
          } ${characters[result[2]]} ${characters[result[3]]} ${
            characters[result[4]]
          }\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️ 🎊 🎉`
        );
        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
            characters[result[1]]
          } ${characters[result[2]]} ${characters[result[3]]} ${
            characters[result[4]]
          }\n🎊 🎉 ⭐️ 🌟 ⭐️ 🌟 J A C K P O T ⭐️ 🌟 ⭐️ 🌟 🎊 🎉`
        );
        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
            characters[result[1]]
          } ${characters[result[2]]} ${characters[result[3]]} ${
            characters[result[4]]
          }\n🎊 🎉 🌟 ⭐️ 🌟 ⭐️ J A C K P O T 🌟 ⭐️ 🌟 ⭐️ 🎊 🎉`
        );
        isStarted = false;
      } else {
        stackedMoney += 15;
        await interaction.editReply(
          `${
            interaction.user
          }형이 룰렛을 돌리는 중이야!\n\n🦖 💩 🇰🇷 💰 🍔 🐮 🐞 ⭐️ 🐵 🍌\n\n🐞 🐞 🐞 🐞 나오면 잭팟! \n${
            characters[result[1]]
          } ${characters[result[2]]} ${characters[result[3]]} ${
            characters[result[4]]
          }\n인생 역전의 기회는 쉽게 오지 않는 법이야!\nJACKPOT : ${stackedMoney}`
        );
        isStarted = false;
      }
    }
  },
};
