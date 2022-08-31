const prisma = require("./prisma");

//isUserDataExist
async function isUserDataExist(discordId) {
  if (getUserData(discordId)) return true;
  else return false;
}

//createUserData
async function createUserData(data) {
  const { discordId, rock, scissors, paper } = data;
  try {
    const newUser = await prisma.user.create({
      data: {
        discordId,
        rock,
        scissors,
        paper,
      },
    });
    return newUser;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//updataUserData
async function updateUserData(data) {
  const { discordId, rock, scissors, paper } = data;
  try {
    const update = await prisma.user.updateMany({
      where: { discordId },
      data: {
        rock,
        scissors,
        paper,
      },
    });
    return update;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//getUserData
async function getUserData(discordId) {
  try {
    const userData = await prisma.user.findFirst({
      where: {
        discordId,
      },
    });
    return userData;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  isUserDataExist,
  createUserData,
  updateUserData,
  getUserData,
};
