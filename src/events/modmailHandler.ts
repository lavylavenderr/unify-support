import {
  ImportantIds,
  ticketDepartments,
  ticketEmbedColor,
  type ticketDepartmentType,
} from "@constants";
import {
  ActionRowBuilder,
  ChannelType,
  Colors,
  ComponentType,
  EmbedBuilder,
  Events,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { client, db } from "index";
import { ticketMessages, tickets } from "schema/tickets";
import { onEvent } from "structs/Event";
import { fetchSetting } from "util/settings";
import {
  closeCachedTicket,
  createNewCachedTicket,
  fetchTicketByAuthor,
} from "util/ticketUtils";

// TODO: ADD SNIPPET FUNCTIONALITY
export default onEvent(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.channel.type === ChannelType.DM) {
    const currentTicket = await fetchTicketByAuthor(message.author.id);
    const ticketChannel = (await client.channels.fetch(
      currentTicket?.channelId || "1"
    )) as TextChannel;

    if (currentTicket) {
      if (!ticketChannel) {
        await db
          .update(tickets)
          .set({ closed: true })
          .where(eq(tickets.id, currentTicket.id));

        await closeCachedTicket(
          currentTicket.channelId,
          currentTicket.authorId
        );

        return message.reply({
          allowedMentions: { repliedUser: false },
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Red)
              .setDescription(
                "It would appear that a staff member has deleted your corresponding modmail channel, as a result, your ticket has been automatically closed."
              ),
          ],
        });
      } else {
        if (currentTicket.scheduledCloseTime)
          await db
            .update(tickets)
            .set({ scheduledCloseTime: null })
            .where(eq(tickets.id, currentTicket.id));

        try {
          const reply = await ticketChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(ticketEmbedColor)
                .setDescription(
                  message.content ? message.content : "No content provided."
                )
                .setAuthor({
                  name: message.author.globalName
                    ? `${message.author.globalName} (@${message.author.username})`
                    : message.author.username,
                  iconURL: message.author.avatarURL()!,
                })
                .setFooter({ text: "Message ID: " + message.author.id })
                .setTimestamp(),
            ],
            files: Array.from(message.attachments.values()),
            ...(currentTicket!.subscribed.length > 0 && {
              content: currentTicket!.subscribed
                .map((value) => `<@${value}>`)
                .join(" "),
            }),
          });

          await message.react("✅");
          await db.insert(ticketMessages).values({
            ticketId: currentTicket.id,
            supportMsgId: reply.id,
            clientMsgId: message.id,
          });
        } catch (err) {}
      }
    } else {
      try {
        const deptPicker = new StringSelectMenuBuilder()
          .setCustomId("deptpicker")
          .setPlaceholder("Select a Department");
        const guild = await client.guilds.fetch(ImportantIds.MAIN_GUILD)!;
        const guildMember = await guild.members.fetch(message.author.id)!;
        const collectorFilter = (i: any) => i.user.id === message.author.id;

        for (const dept of ticketDepartments) {
          deptPicker.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(dept.name)
              .setDescription(dept.description)
              .setValue(dept.name)
          );
        }

        const response = await message.reply({
          allowedMentions: { repliedUser: false },
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              deptPicker
            ),
          ],
          embeds: [
            new EmbedBuilder()
              .setColor(ticketEmbedColor)
              .setDescription(
                "Please only use my DMs to open a ticket. If you wish to do so, please select the appropiate department below. Do note that the first message sent will not be transmitted, so please wait to state your inquiry."
              ),
          ],
        });

        response
          .awaitMessageComponent({
            filter: collectorFilter,
            componentType: ComponentType.StringSelect,
            time: 20_000,
          })
          .then(async (collected) => {
            const usrName = message.author.globalName
              ? message.author.globalName
              : message.author.username;
            const selectedCat = collected.values[0] as ticketDepartmentType;
            const categoryInfo = ticketDepartments.find(
              (x) => x.name === selectedCat
            )!;
            const categoryStatus =
              (await fetchSetting("ticketCategory-" + selectedCat)) || true;

            if (!categoryStatus) {
              return response.edit({
                embeds: [
                  new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(
                      "This category is currently not accepting any new tickets at this time, please try again later."
                    ),
                ],
              });
            }

            const pastTickets = await db
              .select()
              .from(tickets)
              .where(
                and(
                  eq(tickets.closed, true),
                  eq(tickets.authorId, message.author.id)
                )
              );

            guild.channels
              .create({
                name: categoryInfo.name + "-" + usrName,
                type: ChannelType.GuildText,
                parent: ImportantIds.TICKET_CATEGORY,
              })
              .then(async (c) => {
                await Promise.all([
                  db.insert(tickets).values({
                    channelId: c.id,
                    authorId: message.author.id,
                    category: categoryInfo.shortCode,
                    dmId: message.channelId,
                  }),
                  createNewCachedTicket(message.author.id, c.id),
                ]);

                for (const allowedRole of categoryInfo.allowedRoles) {
                  await c.permissionOverwrites.create(allowedRole, {
                    ViewChannel: true,
                    SendMessages: true,
                  });
                }

                await c
                  .send({
                    content: categoryInfo.allowedRoles
                      .map((role) => `<@&${role}>`)
                      .join(" "),
                    embeds: [
                      new EmbedBuilder()
                        .setColor(ticketEmbedColor)
                        .setDescription(
                          `Their account was created <t:${Math.floor(
                            message.author.createdTimestamp / 1000
                          )}:R>, they joined the server ${
                            guildMember.joinedTimestamp
                              ? `<t:${Math.floor(
                                  guildMember.joinedTimestamp / 1000
                                )}:R>`
                              : "at an unknown date"
                          } and they have ${
                            pastTickets.length === 0
                              ? "not opened any past tickets."
                              : `opened **${pastTickets.length}** ticket(s) prior to this one.`
                          }`
                        )
                        .addFields({
                          name: "Roles",
                          value:
                            guildMember.roles.cache
                              .filter((role) => role.name !== "@everyone")
                              .map((role) => role.name)
                              .join(", ") || "User has no roles.",
                        })
                        .setAuthor({
                          name: message.author.globalName
                            ? `${message.author.globalName} (@${message.author.username})`
                            : message.author.username,
                          iconURL: message.author.avatarURL()!,
                        })
                        .setFooter({
                          text: `User ID: ${message.author.id} • DM ID: ${message.channelId}`,
                        }),
                      new EmbedBuilder()
                        .setColor(ticketEmbedColor)
                        .setDescription(
                          pastTickets.length > 0
                            ? `This user has contacted us before, you can see all their tickets below.\n\n${pastTickets
                                .map(
                                  (ticket) =>
                                    `- Ticket **#${ticket.id}** - [Transcript](https://unifytix.lavylavender.com/${ticket.channelId}.html)`
                                )
                                .join("\n")}`
                            : "This user has not opened any previous modmail tickets."
                        ),
                    ],
                  })
                  .then(async (msg) => {
                    await msg.pin();
                  });

                return response.edit({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(ticketEmbedColor)
                      .setDescription(
                        "Your ticket has been created. Please make sure to describe your inquiry in full detail in order to provide the responding member with as much info as possible."
                      ),
                  ],
                  components: [],
                });
              });
          })
          .catch(() => {
            response.edit({
              embeds: [
                new EmbedBuilder()
                  .setColor(Colors.Red)
                  .setDescription(
                    "Interaction has timed out, please send another message to toggle this again."
                  ),
              ],
              components: [],
            });
          });
      } catch {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                "An unknown error has occured, please inform an exeuctive."
              ),
          ],
        });
      }
    }
  }
});
