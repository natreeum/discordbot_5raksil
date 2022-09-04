const { distribute } = require(`../cronjob/distribute`);
const cron = require("node-cron");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    new BidManager(client);

    console.log("Setting up distribution cron job at 7AM every day.");
    cron.schedule(
      "0 7 * * *",
      async () => {
        console.log("distributing at 7 am every day");
        distribute();
      },
      {
        timezone: "Asia/Seoul",
      }
    );
  },
};
