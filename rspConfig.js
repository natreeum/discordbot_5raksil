// 고정 수수료
const staticFee = 0;

// 퍼센트 수수료
const fee = 0;
const FEE_TO_CALCULATABLE = 1 - fee / 100;

// return Rate
const winRate = 2.5;
const drawRate = 0.3;

// bet limit
const betLimit = 5000;

// MinimumBetaAmount
const MINIMUM_BETAMOUNT = 5;

module.exports = {
  staticFee,
  fee,
  FEE_TO_CALCULATABLE,
  winRate,
  drawRate,
  betLimit,
  MINIMUM_BETAMOUNT,
};
