const {
  createtreasury,
  getTreasuryData,
  updateTreasury,
} = require(`../prisma/casinoDao/treasury`);

const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

async function getTreasury(interaction) {
  await interaction.deferReply();
  let message = "";
  let i = 1;
  while (true) {
    const treasury = await getTreasuryData(i);
    if (!treasury) break;
    message += `id : ${treasury.id} | name : ${treasury.name} | amount : ${treasury.amount}\n`;
    i++;
  }
  if (i === 1) {
    message = `등록된 트레져리가 없습니다.`;
  }
  await interaction.editReply({ content: `${message}` });
}

async function setTreasury(interaction, id, amount) {
  await interaction.deferReply();
  let treasury = await getTreasuryData(id);
  if (!treasury) {
    await interaction.reply(`존재하지 않는 트레져리입니다.`);
  }
  const update = await updateTreasury({
    name: treasury.name,
    amount: treasury.amount + amount,
  });
  await bankManager.depositBTC(interaction.user, amount);
  treasury = await getTreasuryData(id);
  await interaction.editReply(
    `[${treasury.id}] ${treasury.name}의 수량이 ${treasury.amount} BTC 로 변경되었습니다.`
  );
}

async function newTreasury(interaction, name) {
  await interaction.deferReply();
  const treasury = await createtreasury(name);
  await interaction.editReply(
    `[${treasury.id}] ${treasury.name} : 트레져리 생성 완료`
  );
}

module.exports = { getTreasury, setTreasury, newTreasury };
