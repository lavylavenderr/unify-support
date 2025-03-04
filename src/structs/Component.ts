import {
  StringSelectMenuBuilder,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
  ButtonBuilder,
  type ModalBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import type { InteractionMiddlewareFn } from "types/commands";
import middlwareify from "util/middlewareify";

export type ComponentInteractionType =
  | ButtonInteraction<"cached">
  | StringSelectMenuInteraction<"cached">
  | ModalSubmitInteraction<"cached">;

export type ComponentBuilderType =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | ModalBuilder;

export class Component<I extends ComponentInteractionType> {
  public handler: (interaction: I) => void;

  constructor(
    public id: string,
    handler: (interaction: I) => void,
    middleware?: InteractionMiddlewareFn<I>[]
  ) {
    this.handler = middlwareify(handler, middleware);
  }
}

export class ButtonComponent extends Component<ButtonInteraction<"cached">> {}
export class StringSelectMenuComponent extends Component<
  StringSelectMenuInteraction<"cached">
> {}
export class ModalComponent extends Component<
  ModalSubmitInteraction<"cached">
> {}
