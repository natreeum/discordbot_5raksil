const prisma = require("../prisma");

//create userCheckDate
async function createUserCheckDate(discordId) {
  try {
    const userData = await prisma.checkData.create({
      data: {
        discordId,
      },
    });
    return userData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//getCheckDate
async function getCheckDate(discordId) {
  try {
    const userCheckDate = await prisma.checkData.findFirst({
      where: {
        discordId,
      },
    });
    return userCheckDate;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//update checkDate
async function updateCheckDate(data) {
  try {
    const { discordId, checkDate } = data;
    const userCheckDate = await getCheckDate(discordId);

    if (!userCheckDate) {
      await createUserCheckDate(discordId);
    }
    const dateUpdateRes = await prisma.checkData.updateMany({
      where: {
        discordId,
      },
      data: {
        checkDate,
      },
    });
    return dateUpdateRes;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  createUserCheckDate,
  getCheckDate,
  updateCheckDate,
};
