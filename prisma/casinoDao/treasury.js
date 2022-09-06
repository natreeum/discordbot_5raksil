const prisma = require("./prisma");

//create treasury
async function createtreasury(name) {
  try {
    const treasury = await prisma.Casinodaopointtreasury.create({
      data: {
        name,
      },
    });
    return treasury;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//gettreasury
async function getTreasuryData(id) {
  try {
    const treasuryData = await prisma.Casinodaopointtreasury.findUnique({
      where: {
        id,
      },
    });
    return treasuryData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//update checkDate
async function updateTreasury(data) {
  try {
    const { name, amount } = data;
    const treasuryData = await getTreasuryData(id);

    if (!treasuryData) {
      createtreasury(name);
    }
    const dateUpdateRes = await prisma.Casinodaopointtreasury.updateMany({
      where: {
        name,
      },
      data: {
        amount,
      },
    });
    return dateUpdateRes;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  getTreasuryData,
  updateTreasury,
};
