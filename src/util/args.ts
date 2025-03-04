import { Message } from "discord.js";

export type ArgType = "string" | "integer" | "boolean" | "user" | "member";
export class Args {
  private rawArgs: string[];
  private index = 0;
  private message: Message;

  constructor(message: Message, content: string) {
    this.message = message;
    this.rawArgs = Args.tokenize(content);
  }

  static tokenize(content: string): string[] {
    const regex = /[^\s"]+|"([^"]*)"/g;
    const matches = [...content.matchAll(regex)];
    return matches.map((m) => (m[1] !== undefined ? m[1] : m[0]));
  }

  next(): string | null {
    return this.rawArgs[this.index++] ?? null;
  }

  peek(): string | null {
    return this.rawArgs[this.index] ?? null;
  }

  finished(): boolean {
    return this.index >= this.rawArgs.length;
  }

  rest(): string {
    return this.rawArgs.slice(this.index).join(" ");
  }

  async get<T = string>(type: ArgType): Promise<T | null> {
    const value = this.next();
    if (!value) return null;

    switch (type) {
      case "string":
        return value as T;
      case "integer":
        return !isNaN(Number(value)) ? (parseInt(value, 10) as T) : null;
      case "boolean":
        return (value.toLowerCase() === "true") as T;
      case "user": {
        const userId = value.replace(/\D/g, "");
        const user =
          (await this.message.client.users.cache.get(userId)) || undefined;

        return user as T;
      }
      case "member": {
        if (!this.message.guild) return null;

        const memberId = value.replace(/\D/g, "");
        const guildMember = await this.message.guild.members
          .fetch(memberId)
          .catch(() => undefined);

        return guildMember as T;
      }
      default:
        return null;
    }
  }
}
