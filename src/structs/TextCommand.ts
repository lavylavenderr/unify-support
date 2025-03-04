import { Message } from "discord.js";
import type { TextMiddlewareFn } from "types/commands";
import { Args } from "util/args";
import middlwareify from "util/middlewareify";

interface TextCommandProps {
  name: string;
  description: string;
  aliases?: string[];
}

interface MainCmdReturnType {
  command: TextCommandSchema;
}

type TextCommandSchema = {
  name: string;
  description: string;
  aliases?: string[];
};

export function defineTextCommand({
  name,
  description,
  aliases = [],
}: TextCommandProps): MainCmdReturnType {
  const command: TextCommandSchema = {
    name,
    description,
    aliases,
  };

  return {
    command,
  };
}

type CommandType = MainCmdReturnType;
export type CommandMessageType = Message<true>;

export class TextCommand<S extends CommandType, M extends CommandMessageType> {
  public baseFn: (message: M, args: Args) => void;
  public aliases: string[];

  constructor(
    public schema: S,
    baseFn: (message: M, args: Args) => void = () => {},
    middleware?: TextMiddlewareFn<M>[]
  ) {
    this.baseFn = middlwareify(baseFn, middleware);
    this.aliases = schema.command.aliases || [];
  }

  async execute(message: M) {
    const content = message.content.trim();
    const commandName = content.split(/\s+/)[0];
    const argsContent = content.slice(commandName.length).trim();
    const args = new Args(message, argsContent);

    await this.baseFn(message, args);
  }
}
