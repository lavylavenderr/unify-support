import { ActivityType, Events } from "discord.js";
import { baseLogger } from "index";
import { singleEvent } from "structs/Event";

export default singleEvent(Events.ClientReady, async (client) => {
  baseLogger.info(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(":3", { type: ActivityType.Playing });
});
