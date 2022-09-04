const BankManager = require(`../bank/BankManager`);
const bankManager = new BankManager();
const { loadGame } = require(`../prisma/slotmachine`);
const { holderList, debt, dividendPercentage } = require(`../data`);

async function log(
  text = "hello",
  wh = "https://discord.com/api/webhooks/1016036994926784512/XQP4G3n1_kYtbSvBvPMYWauWl9ANYBhl44l81bT5eSAegE7qZwjp2aOVvkdByUsKjCUw"
) {
  try {
    const message = await wh.send({
      content: text,
    });
    return message;
  } catch (e) {
    console.error(e);
  }
}

async function distribute(client) {
  const casinoCEO = "251349298300715008";
  const balances = await bankManager.getBalancesById(casinoCEO);
  const storageBalance = Math.floor(balances.data.storage);
  const slotmachine = await loadGame();
  const stackedMoney = slotmachine.prize;
  const profit = storageBalance - debt - stackedMoney;
  const dividend = Math.floor((profit * dividendPercentage) / 100);
  const personalDividend = Math.floor(dividend / 20);
  //   let channel = client.channels.cache.get("1016001586880839731");

  let message = `벅크셔해서웨이 잔액 : ${storageBalance}, 정부 대출 : ${debt}, 슬롯머신 잭팟 : ${stackedMoney}, 배당금 비율 : 수익의 ${dividendPercentage}%`;
  if (profit > 40) {
    await bankManager.withdrawBTCbyId(
      casinoCEO,
      String(Math.round(profit / 2))
    );
    message += `\n카지노 수익금 : ${profit}, 총 배당금 : ${
      (profit * dividendPercentage) / 100
    }, 배당금 : ${personalDividend}\n`;
    for (let i in holderList) {
      await bankManager.withdrawBTCbyId(
        holderList[i],
        String(personalDividend)
      );
      message += `#${i} 홀더 : <@${holderList[i]}>\n`;
    }
    message += `배당금 ${personalDividend} BTC 가 지급되었습니다.`;
  } else {
    message +=
      "수익이 40BTC미만이므로 오늘은 배당금 지급을 하지 않습니다. -CASINO DAO-";
  }
  log(message);
}

module.exports = {
  distribute,
};
