const { SlashCommandBuilder } = require("discord.js");
const {
  staticFee,
  fee,
  FEE_TO_CALCULATABLE,
  winRate,
  drawRate,
  betLimit,
  MINIMUM_BETAMOUNT,
  CALCULATABLE_WINNERRATE,
  winnerRate,
} = require("../rspConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("가위바위보정보")
    .setDescription("가위바위보 정보를 봅니다.")
    .addIntegerOption((option) =>
      option
        .setName("choice")
        .setDescription("PvE, PvP에 대한 설명을 봅니다.")
        .addChoices(
          { name: "PvE(vsMr.robugt 🤖 )", value: 1 },
          { name: "PvP(vs시민)", value: 2 }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const choice = interaction.options.getInteger("choice");
    let message =
      "**Mr.robugt** 🤖 : 안녕 나는 로벅트야. 가위바위보에 대해 설명해줄게.\n\n";

    if (choice == 2) {
      message += `PvP는 다른 시민과 BTC를 걸고 가위바위보를 할 수 있어\n사용법 : \`/가위바위보 [유저] [금액]\`\n\n시민A가 시민B에게 10BTC씩 걸고 가위바위보 대결을 신청하면 총 베팅금액은 20BTC겠지?\`\`\`\n[무효일 때] 시민A 가 신청했기 때문에 수수료 1BTC를 내\n[비겼을 때] 시민A 와 시민B가 비기면 둘 다 수수료 1BTC씩 내\n[이겼을 때] 시민B가 이겼다고 치면 시민B는 20BTC의 ${
        100 - winnerRate * 2
      }%인 ${
        10 * 2 * CALCULATABLE_WINNERRATE
      }BTC를 받아.\`\`\`최소베팅금액 : ${MINIMUM_BETAMOUNT}BTC`;
    }
    if (choice == 1) {
      message += `PvE는 나 로벅트와 BTC를 걸고 가위바위보를 할 수 있어\n사용법 : \`/혼자가위바위보 [가위 | 바위 | 보] [금액]\`\n\n\`\`\`[졌을 때] 베팅한 모든 BTC는 벅크셔해서웨이에서 좋은데 사용할거야\n[비겼을 때] 이긴 못했지만 비겼으니 ${
        drawRate * 100
      }%는 뽀찌로 돌려줄거야. 왜 30%밖에 안돌려주냐고? 억울하다고? 억울하면 이기면 돼.\n[이겼을 때] 베팅한 금액의 ${winRate}배를 줄거야. 이정도면 많이 주지?\`\`\`최소베팅금액 : ${MINIMUM_BETAMOUNT}BTC\n최대베팅금액 : ${betLimit}BTC`;
    }
    await interaction.reply(`${message}`);
  },
};
