const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();
const { loadGame } = require(`../prisma/slotmachine`);
const { holderList, debt, dividendPercentage } = require(`../data`);

async function distribute(client) {
  const casinoCEO = client.users.cache.find(
    (user) => user.id === "251349298300715008"
  );
  const balances = await bankManager.getBalances(casinoCEO);
  const storageBalance = balances.data.storage;
  const stackedMoney = loadGame().prize;
  const profit = storageBalance - debt - stackedMoney;
  const dividend = (profit * dividendPercentage) / 100;
  const personalDividend = dividend / 20;
  const channel = client.channels.cache.get("1016001586880839731");

  let message = `벅크셔해서웨이 잔액 : ${storageBalance}, 정부 대출 : ${debt}, 슬롯머신 잭팟 : ${stackedMoney}, 배당금 비율 : 수익의 ${dividendPercentage}%`;
  if (profit > 40) {
    await bankManager.withdrawBTC(casinoCEO, String(Math.round(profit / 2)));
    message += `\n카지노 수익금 : ${profit}, 총 배당금 : ${
      (profit * dividendPercentage) / 100
    }, 배당금 : ${personalDividend}\n`;
    for (let i in holderList) {
      const holder = client.users.cache.find(
        (user) => user.id === holderList.i
      );
      await bankManager.withdrawBTC(holder, String(personalDividend));
      message += `#${i} 홀더 : <@${holderList.i}>\n`;
    }
    message += `배당금 ${personalDividend} BTC 가 지급되었습니다.`;
  } else {
    message +=
      "수익이 40BTC미만이므로 오늘은 배당금 지급을 하지 않습니다. 죄송합니다. -CASINO DAO-";
  }
  channel.send(message);
}

module.exports = {
  distribute,
};
