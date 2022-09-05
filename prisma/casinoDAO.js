const prisma = require("./prisma");

//getPoint
async function getPoint(discordId) {
  try {
    const userPoint = await prisma.casinodaopoint.findFirst({
      where: {
        discordId,
      },
    });
    return userPoint;
  } catch (e) {
    console.log(e);
    return null;
  }
}

//addPoint
async function addPoint(data) {
  try {
    const { discordId, point } = data;
    const addPoint = await prisma.casinodaopoint.updateMany({
      where: {
        discordId,
      },
      data: {
        point,
      },
    });
    return addPoint;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  loadPoint,
};
