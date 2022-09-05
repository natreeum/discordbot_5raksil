const prisma = require("./prisma");

//create user
async function createUser(discordId) {
  try {
    const userData = await prisma.casinodaopoint.create({
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

async function getPointbyId(id) {
  try {
    const userPoint = await prisma.casinodaopoint.findFirst({
      where: {
        id,
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
    const { discordId, addingpoint } = data;
    const userPoint = await getPoint(discordId);
    const point = Number(userPoint.point) + Number(addingpoint);

    if (!userPoint) {
      createUser(discordId);
    }
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

//editPoint
async function editPoint(data) {
  const { discordId, point } = data;
  try {
    const editPoint = await prisma.casinodaopoint.updateMany({
      where: {
        discordId,
      },
      data: {
        point,
      },
    });
    return editPoint;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  getPoint,
  addPoint,
  getPointbyId,
  editPoint,
};
