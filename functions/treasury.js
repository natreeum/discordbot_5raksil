const {
  getTreasuryData,
  updateTreasury,
} = require(`../prisma/casinoDao/treasury`);

const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();

async function getTreasury(interaction) {
  let message = "";
  let i = 1;
  while (true) {
    const treasury = await getTreasuryData(i);
    if (!treasury) break;
    message += `id : ${treasury.id} | name : ${treasury.name} | amount : ${treasury.amount}\n`;
  }
  await interaction.reply({ content: `${message}` });
}

async function setTreasury(interaction, id, amount) {
  const treasury = await getTreasuryData(id);
  if (!treasury) {
    await interaction.reply(`존재하지 않는 트레져리입니다.`);
  }
  const update = await updateTreasury({
    name: treasury.name,
    amount: treasury.amount + amount,
  });
  await bankManager.depositBTC(interaction.user, amount);
  await interaction.reply(
    `[${update.id}] ${update.name}의 수량이 ${update.amount} BTC 로 변경되었습니다.`
  );
}

module.exports = { getTreasury, setTreasury };
