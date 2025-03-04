import { Events } from "discord.js";
import { baseLogger } from "index";
import { onEvent } from "structs/Event";
import commands from "commands/text";
import type { CommandMessageType } from "structs/TextCommand";

export default onEvent(Events.MessageCreate, async (message) => {
  // Stuff
  const logger = baseLogger.child({ module: "Message Command Handler" });
  const prefix = Bun.env.PREFIX || "!";

  if (
    !message.guild ||
    message.author.bot ||
    !message.content.startsWith(prefix)
  )
    return;

  // Parse Command Name and Prefix
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  // Lookup Command
  const command = commands.find(
    (cmd) =>
      cmd.schema.command.name === commandName ||
      cmd.aliases.includes(commandName)
  );

  if (!command) {
    logger.error(`Cannot find command: ${commandName}`);
    return message.reply("Unknown command.");
  }

  try {
    await command.execute(message as CommandMessageType);
  } catch (e) {
    logger.error(e);
  }
});
