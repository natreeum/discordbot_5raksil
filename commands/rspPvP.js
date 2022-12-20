const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CALCULATABLE_WINNERRATE, MINIMUM_BETAMOUNT } = require(`../rspConfig`);
const {
  isUserDataExist,
  createUserData,
  updateUserData,
  getUserData,
} = require(`../prisma/rspPvP`);
const wait = require('node:timers/promises').setTimeout;

const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

// testserver channel
// const channelId = ["1009096382432411819"];
// bugcity channel
const channelId = ['962244779171799060', '939866440968863805'];
const gamedata = new Map();

const weapons = {
  1: { weakTo: 3, strongTo: 2 },
  2: { weakTo: 1, strongTo: 3 },
  3: { weakTo: 2, strongTo: 1 },
};

const chat = {
  1: ':fist:',
  2: ':v:',
  3: ':hand_splayed:',
  4: '기권:flag_white:',
};

const fee = 1;
const FEE_TO_CALCULATABLE = 1 - fee / 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('가위바위보')
    .setDescription('가위바위보 게임을 합니다.')
    .addUserOption((option) =>
      option
        .setName('selectuser')
        .setDescription('겨루고 싶은 상대를 고릅니다.')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('bet')
        .setDescription(`베팅 금액을 입력합니다.(수수료 : ${fee} BTC)`)
        .setRequired(true)
    ),
  async execute(interaction) {
    const firstuser = interaction.user;
    const seconduser = interaction.options.getUser('selectuser');
    //multiple game check
    if (gamedata.has(firstuser)) {
      await interaction.reply({
        content: `형은 이미 누군가와 겨루고 있는거 같은데? 그거 끝나고 다시해봐~`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();
    // channel Lock
    const commandChannelId = interaction.channel.id;
    if (!channelId.includes(commandChannelId)) {
      let message = '가위바위보를 할 수 있는 채널을 알려줄게! : ';
      for (let i of channelId) {
        message += `<#${i}> `;
      }
      await interaction.editReply({
        content: `${message}`,
        ephemeral: true,
      });
      return;
    }

    if (firstuser === seconduser) {
      await interaction.editReply(
        `5252~ 차라리 화장실 가서 거울이랑 가위바위보를 하지 그래??`
      );
      return;
    } else if (seconduser.bot === true) {
      await interaction.editReply(
        `🤖 삐빕 - 로봇은 가위바위보를 할 수 없습니다. 삐빕- 🤖`
      );
      return;
    }

    // 유저 전적 얻기
    let firstuserdata = await getUserData(firstuser.id);
    let seconduserdata = await getUserData(seconduser.id);

    if (!firstuserdata) {
      firstuserdata = await createUserData({ discordId: firstuser.id });
    }
    if (!seconduserdata) {
      seconduserdata = await createUserData({ discordId: seconduser.id });
    }

    let firstuserSum =
      firstuserdata.rock + firstuserdata.scissors + firstuserdata.paper;
    let seconduserSum =
      seconduserdata.rock + seconduserdata.scissors + seconduserdata.paper;
    if (firstuserSum == 0) {
      firstuserSum = 1;
    }
    if (seconduserSum == 0) {
      seconduserSum = 1;
    }
    const betAmountBeforeFee = interaction.options.getInteger('bet');
    const RAW_betAmount = betAmountBeforeFee * FEE_TO_CALCULATABLE;
    // const betAmount = Math.round(RAW_betAmount * 100) / 100;
    const betAmount = betAmountBeforeFee - fee;
    const winnerPrize = Math.round(
      betAmountBeforeFee * 2 * CALCULATABLE_WINNERRATE
    );

    // BTC Balance Check
    const player1Balance = await bankManager.getBalance(firstuser);
    const player2Balance = await bankManager.getBalance(seconduser);

    //minimum betAmount

    if (betAmountBeforeFee < MINIMUM_BETAMOUNT) {
      await interaction.editReply({
        content: `최소 베팅 금액은 ${MINIMUM_BETAMOUNT} BTC야!`,
        ephemeral: true,
      });
      return;
    }

    // balanceCheckFlag
    // 0 : 둘다 잔고 충분
    // 1 : player1 이 잔고 부족
    // 2 : player2 이 잔고 부족
    // 3 : 둘다 잔고 부족
    let balanceCheckFlag = 0;

    if (
      player1Balance.point.current < betAmountBeforeFee &&
      player2Balance.point.current > betAmountBeforeFee
    ) {
      balanceCheckFlag = 1;
    } else if (
      player2Balance.point.current < betAmountBeforeFee &&
      player1Balance.point.current > betAmountBeforeFee
    ) {
      balanceCheckFlag = 2;
    } else if (
      player1Balance.point.current < betAmountBeforeFee &&
      player2Balance.point.current < betAmountBeforeFee
    ) {
      balanceCheckFlag = 3;
    }

    if (balanceCheckFlag == 1) {
      await interaction.editReply(`${firstuser}의 잔고가 부족해..`);
      return;
    } else if (balanceCheckFlag == 2) {
      await interaction.editReply(`${seconduser}의 잔고가 부족해..`);
      return;
    } else if (balanceCheckFlag == 3) {
      await interaction.editReply(`둘 다 잔고가 부족해!!`);
      return;
    }

    let winner = null;

    //firstuser : who entered command
    //seconuser : vs

    // gamedata initialize
    gamedata.set(firstuser, {
      choice: 0,
      seconduser: { user: seconduser, choice: 0 },
    });

    //button builder
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('scissors')
          .setLabel('✌')
          .setStyle(ButtonStyle.Primary)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rock')
          .setLabel('✊')
          .setStyle(ButtonStyle.Success)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('paper')
          .setLabel('✋')
          .setStyle(ButtonStyle.Danger)
      );

    //deposit
    await bankManager.depositBTC(firstuser, String(betAmountBeforeFee));
    await bankManager.depositBTC(seconduser, String(betAmountBeforeFee));

    //reply to message with buttons
    const firstuserScore = {
      rock: Math.round((firstuserdata.rock / firstuserSum) * 100),
      scissors: Math.round((firstuserdata.scissors / firstuserSum) * 100),
      paper: Math.round((firstuserdata.paper / firstuserSum) * 100),
    };
    const seconduserScore = {
      rock: Math.round((seconduserdata.rock / seconduserSum) * 100),
      scissors: Math.round((seconduserdata.scissors / seconduserSum) * 100),
      paper: Math.round((seconduserdata.paper / seconduserSum) * 100),
    };
    const firstuserScoreMessage = `${chat[2]} : ${firstuserScore.scissors}% ${chat[1]} : ${firstuserScore.rock}% ${chat[3]} : ${firstuserScore.paper}% : <@${firstuser.id}>의 전적 \n`;
    const seconduserScoreMessage = `${chat[2]} : ${seconduserScore.scissors}% ${chat[1]} : ${seconduserScore.rock}% ${chat[3]} : ${seconduserScore.paper}% : <@${seconduser.id}>의 전적  \n\n`;
    const basicmessage = `[✌  ✊  ✋]\n**__${betAmountBeforeFee} BTC__** 걸고하는 가위바위보\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!\n`;
    const message =
      firstuserScoreMessage + seconduserScoreMessage + basicmessage;
    await interaction.editReply({
      content: `${message}`,
      components: [row],
    });

    //button logic
    const filter = (i) =>
      ['scissors', 'rock', 'paper'].includes(i.customId) &&
      [firstuser, seconduser].includes(i.user);

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 6000,
    });
    const replied = new Map();
    let firstuserMessage = '';
    let seconduserMessage = '';
    collector.on('collect', async (i) => {
      // await i.update({
      //   content: `[✌  ✊  ✋]\n**__${
      //     betAmountBeforeFee
      //   } BTC__** 걸고하는 가위바위보\n${firstuser}vs${seconduser}\n가위바위보를 시작하지... 아래 버튼을 5초 안에 눌러!!!\n`,
      //   components: [row],
      // });

      if (i.user == firstuser) {
        if (!replied.has(firstuser)) {
          firstuserMessage = `\n${i.user}형은 냈다!`;
          await i.update({
            content: message + firstuserMessage + seconduserMessage,
            components: [row],
          });
          replied.set(firstuser, true);
        } else {
          firstuserMessage = `\n${i.user}형은 냈다가 바꿨다!`;
          await i.update({
            content: message + firstuserMessage + seconduserMessage,
            components: [row],
          });
        }
      }
      if (i.user == seconduser) {
        if (!replied.has(seconduser)) {
          seconduserMessage = `\n${i.user}형은 냈다!`;
          await i.update({
            content: message + firstuserMessage + seconduserMessage,
            components: [row],
          });
          replied.set(seconduser, true);
        } else {
          seconduserMessage = `\n${i.user}형은 냈다가 바꿨다!`;
          await i.update({
            content: message + firstuserMessage + seconduserMessage,
            components: [row],
          });
        }
      }

      if (i.customId === 'scissors') {
        if (i.user == firstuser) {
          gamedata.get(firstuser).choice = 2;
        } else if (i.user == seconduser) {
          gamedata.get(firstuser).seconduser.choice = 2;
        }
        // gamedata.set(i.user, 2);
      } else if (i.customId === 'rock') {
        if (i.user == firstuser) {
          gamedata.get(firstuser).choice = 1;
        } else if (i.user == seconduser) {
          gamedata.get(firstuser).seconduser.choice = 1;
        }
      } else if (i.customId === 'paper') {
        if (i.user == firstuser) {
          gamedata.get(firstuser).choice = 3;
        } else if (i.user == seconduser) {
          gamedata.get(firstuser).seconduser.choice = 3;
        }
      }
    });

    collector.on('end', async (collected) => {
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await delay(500);
      let message = '처리중';
      await interaction.editReply({
        content: message,
        components: [],
      });
      for (let i = 0; i < 3; i++) {
        message += '.';
        await interaction.editReply({
          content: message,
          components: [],
        });
      }
      await delay(200);
      if (replied.has(firstuser) && replied.has(seconduser)) {
        //안내면진다 가위바위보
        await delay(200);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안**`,
          components: [],
        });
        await delay(300);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내**`,
        });
        await delay(100);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면**`,
        });
        await delay(200);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진**`,
        });
        await delay(200);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!**`,
        });

        await delay(500);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위!`,
        });
        await delay(200);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위! 바위!`,
        });
        await delay(200);
        await interaction.editReply({
          content: `베팅 금액 : ${betAmountBeforeFee} BTC\n**안 내면 진다!** 가위! 바위! 보!`,
        });
      }
      await delay(200);

      let sendMessage = '';
      //무효핸들링
      //1유저가 안눌렀을 때
      if (
        gamedata.get(firstuser).choice === 0 &&
        gamedata.get(firstuser).seconduser.choice != 0
      ) {
        winner = 'invalid';
        gamedata.get(firstuser).choice = 4;
        sendMessage += `${firstuser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!\n`;
        // player1 betAmount 지급
        await bankManager.withdrawBTC(firstuser, betAmount);
        await bankManager.withdrawBTC(seconduser, betAmountBeforeFee);
        await interaction.editReply(`${sendMessage}`);
      }
      //2유저가 안눌렀을 때
      else if (
        gamedata.get(firstuser).choice !== 0 &&
        gamedata.get(firstuser).seconduser.choice == 0
      ) {
        winner = 'invalid';
        gamedata.get(firstuser).seconduser.choice = 4;
        sendMessage += `${seconduser}는 쫄았나봐 ㅋㅋㅋ\n에이 재미 없다. 무효!!!\n`;
        // player1 betAmount 지급
        await bankManager.withdrawBTC(firstuser, betAmount);
        await bankManager.withdrawBTC(seconduser, betAmountBeforeFee);
        await interaction.editReply(`${sendMessage}`);
      }
      //둘다 버튼을 안눌렀을 때
      else if (
        gamedata.get(firstuser).choice === 0 &&
        gamedata.get(firstuser).seconduser.choice === 0
      ) {
        winner = 'invalid';
        gamedata.get(firstuser).choice = 4;
        gamedata.get(firstuser).seconduser.choice = 4;
        sendMessage += `🤔 뭐야 둘이 게임 안해??? 🤔\n`;
        // player1 betAmount 지급
        await bankManager.withdrawBTC(firstuser, betAmount);
        await bankManager.withdrawBTC(seconduser, betAmountBeforeFee);
        await interaction.editReply(`${sendMessage}`);
      }
      // 둘 다 뭐라도 냈을 때
      else {
        //fuser rock
        if (gamedata.get(firstuser).choice == 1) {
          await updateUserData({
            discordId: firstuser.id,
            rock: firstuserdata.rock + 1,
            scissors: firstuserdata.scissors,
            paper: firstuserdata.paper,
          });
        }
        //fuser scissors
        else if (gamedata.get(firstuser).choice == 2) {
          await updateUserData({
            discordId: firstuser.id,
            rock: firstuserdata.rock,
            scissors: firstuserdata.scissors + 1,
            paper: firstuserdata.paper,
          });
        }
        //fuser paper
        else if (gamedata.get(firstuser).choice == 3) {
          await updateUserData({
            discordId: firstuser.id,
            rock: firstuserdata.rock,
            scissors: firstuserdata.scissors,
            paper: firstuserdata.paper + 1,
          });
        }

        //suser rock
        if (gamedata.get(firstuser).seconduser.choice == 1) {
          await updateUserData({
            discordId: seconduser.id,
            rock: seconduserdata.rock + 1,
            scissors: seconduserdata.scissors,
            paper: seconduserdata.paper,
          });
        }
        //suser scissors
        else if (gamedata.get(firstuser).seconduser.choice == 2) {
          await updateUserData({
            discordId: seconduser.id,
            rock: seconduserdata.rock,
            scissors: seconduserdata.scissors + 1,
            paper: seconduserdata.paper,
          });
        }
        //suser paper
        else if (gamedata.get(firstuser).seconduser.choice == 3) {
          await updateUserData({
            discordId: seconduser.id,
            rock: seconduserdata.rock,
            scissors: seconduserdata.scissors,
            paper: seconduserdata.paper + 1,
          });
        }

        if (
          weapons[gamedata.get(firstuser).choice].weakTo ===
          gamedata.get(firstuser).seconduser.choice
        )
          winner = seconduser;
        else if (
          weapons[gamedata.get(firstuser).choice].strongTo ===
          gamedata.get(firstuser).seconduser.choice
        )
          winner = firstuser;
        else winner = 'DRAW';
      }

      if (winner === 'DRAW') {
        sendMessage += `${
          chat[gamedata.get(firstuser).choice]
        } : ${firstuser}\n🆚\n${
          chat[gamedata.get(firstuser).seconduser.choice]
        } : ${seconduser}\n\n**[DRAW]** 오~ 둘이 통했나본데~ 비겼어!!`;
        // ToDo : Bank
        // player1 betAmount 지급
        await bankManager.withdrawBTC(firstuser, betAmount);
        // player2 betAmount 지급
        await bankManager.withdrawBTC(seconduser, betAmount);
        await interaction.editReply(`${sendMessage}`);
      } else if (winner === 'invalid') {
        sendMessage += `${
          chat[gamedata.get(firstuser).choice]
        } : ${firstuser}\n🆚\n${
          chat[gamedata.get(firstuser).seconduser.choice]
        } : ${seconduser}\n\n이번 게임은 무효야!!`;
        await interaction.editReply(`${sendMessage}`);
      } else {
        sendMessage += `${
          chat[gamedata.get(firstuser).choice]
        } : ${firstuser}\n🆚\n${
          chat[gamedata.get(firstuser).seconduser.choice]
        } : ${seconduser}\n\n**[WINNER]** : ${winner} \n\n승자에게는 ${winnerPrize} BTC🐞 가 지급됐어!`;
        // winner betAmount * 2 지급
        await bankManager.withdrawBTC(winner, winnerPrize);
        await interaction.editReply(`${sendMessage}`);
      }
      gamedata.delete(firstuser);
    });
  },
};
