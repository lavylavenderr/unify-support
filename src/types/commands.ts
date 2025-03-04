import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  Message,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import type { MiddlewareFn } from "util/middlewareify";

export type InteractionMiddlewareFn<T extends Interaction<"cached">> =
  MiddlewareFn<(interaction: T) => void>;

export type TextMiddlewareFn<T extends Message<true>> = MiddlewareFn<
  (message: T) => void
>;

export type ReplyableTextMiddlewareFn = TextMiddlewareFn<Message<true>>;

export type ReplyableInteractionMiddlewareFn = InteractionMiddlewareFn<
  | ChatInputCommandInteraction<"cached">
  | MessageContextMenuCommandInteraction<"cached">
  | UserContextMenuCommandInteraction<"cached">
  | AnySelectMenuInteraction<"cached">
  | ButtonInteraction<"cached">
  | ModalSubmitInteraction<"cached">
>;
