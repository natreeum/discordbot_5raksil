const { SlashCommandBuilder, formatEmoji } = require("discord.js");
const { holderList } = require(`../data`);
const {
  getPoint,
  addPoint,
  getPointbyId,
  editPoint,
} = require(`../prisma/casinoDAO`);

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
      subcommand.setName(`check`).setDescription(`출석체크`)
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
  },
};
