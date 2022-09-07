const { SlashCommandBuilder, formatEmoji } = require("discord.js");
const { holderList } = require(`../data`);
const {
  getPoint,
  addPoint,
  getPointbyId,
  editPoint,
  getCheckDate,
  updateCheckDate,
  getTreasuryData,
  updateTreasury,
} = require(`../prisma/casinoDAO`);
const {
  setTreasury,
  getTreasury,
  newTreasury,
} = require(`../functions/treasury`);
const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();
const checkAmount = 10;

const casinoDAOChannel = "1016001586880839731";
const casinoDAOStaff = [
  "891720202583166976",
  "251349298300715008",
  "496619115382046731",
  "247333169370628096",
  "337163981338968065",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("casinodao")
    .setDescription("CASINO DAO Point")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`add`)
        .setDescription(`add casinoDAO point`)
        .addUserOption((option) =>
          option.setName(`user`).setDescription(`choose user`).setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName(`amount`)
            .setDescription(`add amount`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`show`)
        .setDescription(`show casinoDAO point`)
        .addUserOption((option) =>
          option
            .setName(`user`)
            .setDescription(`show casinoDAO Point`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`reset`)
        .setDescription(`reset casinoDAO point`)
        .addStringOption((option) =>
          option
            .setName(`password`)
            .setDescription(`enter password`)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(`holders`).setDescription(`show holders`)
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(`hi`).setDescription(`출석체크`)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`treasury`)
        .setDescription(`config treasury`)
        .addStringOption((option) =>
          option
            .setName("menu")
            .setDescription("choose menu")
            .addChoices(
              { name: "add", value: "add" },
              { name: "get", value: "get" },
              { name: "new", value: "new" }
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("id").setDescription("enter id")
        )
        .addIntegerOption((option) =>
          option.setName("amount").setDescription("enter amount")
        )
        .addStringOption((option) =>
          option.setName("name").setDescription("enter treasury name")
        )
    ),
  async execute(interaction) {
    //add
    if (interaction.options.getSubcommand() === `add`) {
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.reply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      if (!casinoDAOStaff.includes(interaction.user.id)) {
        await interaction.reply({
          content: `casinoDAO 운영진만 사용 가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      const amount = interaction.options.getInteger(`amount`);
      const addUser = interaction.options.getUser(`user`);
      await addPoint({
        discordId: addUser.id,
        addingpoint: amount,
      });
      const userPoint = await getPoint(addUser.id);
      await interaction.reply(
        `${addUser}에게 ${amount}CDP 적립되었습니다. | CDP : ${userPoint.point}`
      );
    }
    //show
    else if (interaction.options.getSubcommand() === `show`) {
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.reply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      let flag = false;
      for (let i of Object.keys(holderList)) {
        if (holderList[i] === interaction.user.id) {
          flag = true;
        }
      }
      if (flag == false) {
        await interaction.reply({
          content: `CASINO DAO 홀더만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      const getPointResult = await getPoint(interaction.user.id);
      if (getPointResult) {
        await interaction.reply(
          `${interaction.user}의 CDP : ${getPointResult.point}`
        );
      } else {
        await interaction.reply(
          `${interaction.user}의 포인트 기록이 없습니다.`
        );
      }
    }
    //reset
    else if (interaction.options.getSubcommand() === `reset`) {
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.reply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      if (!casinoDAOStaff.includes(interaction.user.id)) {
        await interaction.reply({
          content: `casinoDAO 운영진만 사용 가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      let i = 1;
      while (true) {
        const data = await getPointbyId(i);
        if (!data) {
          break;
        }
        await editPoint({ discordId: data.discordId, point: 0 });
        i++;
      }
      await interaction.reply(`CDP가 초기화 되었습니다.`);
    }
    //holders
    else if (interaction.options.getSubcommand() === `holders`) {
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.reply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      let message = `CASINO DAO Holders\n\n`;
      for (let i of Object.keys(holderList)) {
        message += `#${i} : <@${holderList[i]}>\n`;
      }
      await interaction.reply(message);
    }
    //출석체크
    else if (interaction.options.getSubcommand() === `hi`) {
      await interaction.deferReply();
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.editReply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      let flag = false;
      for (let i of Object.keys(holderList)) {
        if (holderList[i] === interaction.user.id) {
          flag = true;
        }
      }
      if (flag == false) {
        await interaction.editReply({
          content: `CASINO DAO 홀더만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      const today = new Date();
      const date =
        "" + today.getFullYear() + today.getMonth() + today.getDate();
      const userCheckData = await getCheckDate(interaction.user.id);
      const treasuryBalanc = await getTreasuryData(1);
      const treasuryBalance = treasuryBalanc.amount;

      if (userCheckData) {
        if (userCheckData.checkDate == date) {
          await interaction.editReply(`출석체크는 하루에 한번만 가능해~`);
          return;
        } else {
          if (treasuryBalance >= checkAmount) {
            await updateCheckDate({
              discordId: interaction.user.id,
              checkDate: date,
            });
            await bankManager.withdrawBTC(
              interaction.user,
              String(checkAmount)
            );
            await updateTreasury({
              name: treasuryBalanc.name,
              amount: treasuryBalanc.amount - checkAmount,
            });
            await interaction.editReply(
              `${interaction.user}형 하이~ 오늘도 CASINO DAO 찾아와 줘서 고마워😉 10 BTC 낭낭하게 입금 완료!`
            );
          } else {
            await interaction.editReply(
              `🫢 출석체크 트레져리 잔고가 부족한거같아.. 잠시만 기다려줘..`
            );
          }
        }
      } else {
        if (treasuryBalance >= checkAmount) {
          await updateCheckDate({
            discordId: interaction.user.id,
            checkDate: date,
          });
          await bankManager.withdrawBTC(interaction.user, String(checkAmount));
          await updateTreasury({
            name: treasuryBalanc.name,
            amount: treasuryBalanc.amount - checkAmount,
          });
          await interaction.editReply(
            `${interaction.user}형 하이~ 오늘도 CASINO DAO 찾아와 줘서 고마워😉 10 BTC 낭낭하게 입금 완료!`
          );
        } else {
          await interaction.editReply(
            `🫢 출석체크 트레져리 잔고가 부족한거같아.. 잠시만 기다려줘..`
          );
        }
      }
    }
    //트레져리
    else if (interaction.options.getSubcommand() === `treasury`) {
      if (interaction.channel.id != casinoDAOChannel) {
        await interaction.reply({
          content: `<#${casinoDAOChannel}>에서만 사용가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      if (!casinoDAOStaff.includes(interaction.user.id)) {
        await interaction.reply({
          content: `casinoDAO 운영진만 사용 가능한 명령어입니다.`,
          ephemeral: true,
        });
        return;
      }
      const menu = interaction.options.getString(`menu`);
      if (menu === "add") {
        const id = interaction.options.getInteger(`id`);
        const amount = interaction.options.getInteger(`amount`);
        await setTreasury(interaction, id, amount);
      } else if (menu === "get") {
        await getTreasury(interaction);
      } else if (menu === "new") {
        const name = interaction.options.getString(`name`);

        await newTreasury(interaction, name);
      }
    }
  },
};
