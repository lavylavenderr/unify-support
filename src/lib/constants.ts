import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const mainGuild = '802869758503813131';
export const loggingChannel = '802894778109919292';
export const ticketTranscripts = '902863701953101854';
export const ticketCategory = '802894623705137182';
export const ticketEmbedColor = '#2b2d31';

export const customerServiceRoleId = '878175903895679027';
export const serviceProviderRoleId = '802909560393695232';
export const departmentHeadRoleId = '1289956449040076852';
export const publicRelationsRoleId = '1303815721003913277';

export const ticketTopicMsg = 'In order to reply to the user, please do .reply <message> in order to do so.'
export const ticketDepartments = [
	{
		name: 'Liveries',
		description: 'If you wish to place a livery order.'
	},
	{
		name: '3D Logos',
		description: 'If you wish to place a 3D Logo order.'
	},
	{
		name: 'Uniform',
		description: 'If you wish to place a uniform order.'
	},
	{
		name: 'Public Relations',
		description: 'Please use this if you wish to partner or have a PR inquiry.'
	},
	{
		name: 'Other',
		description: 'Select this if your ticket does not fall into the listed categories.'
	}
];

export const commandList = [
	{
		name: 'add',
		description: 'Add a user/role to a ticket',
		args: [
			{
				name: 'user/role',
				description: 'The ID of the user or role'
			}
		],
		detailedDescription:
			'This command will allow a user or role to view and reply to this modmail thread. Please be cautious so that sensitive information is not leaked as a result.'
	},
	{
		name: 'anonreply',
		description: 'Anonyomously reply to a modmail thread',
		args: [
			{
				name: 'message',
				description: 'The message you wish to send'
			}
		],
		detailedDescription:
			'This command will allow you to send anonyoumous messages to the user, this way your identity is protected. Do note that you **are not** able to edit anonyoumous messages because Lavender got lazy and decided to not do that, so too bad too sad.'
	},
	{
		name: 'anythingelse',
		description: 'Prompt the customer to see if they require anything else from us.',
		detailedDescription:
			'Please only run this if the order/question has been answered/fufilled and we have not heard anything back from the customer. If you run this, the ticket will be automatically scheduled to close in 6 hours, if they reply, the 6 hour countdown will be removed.\n\n**Please, please, please, only run this when needed, it may result in a ticket being closed unintentionally.**'
	},
	{
		name: 'close',
		description: 'Close a modmail thread',
		detailedDescription:
			'Please only use this once everything has been wrapped up, this command will close the ticket permanently and save the transcript. Again, **DO NOT** run this until everything has been resolved. I will know if you do.'
	},
	{
		name: 'delete',
		description: 'Delete a message sent by support',
		detailedDescription:
			'In order to delete a message sent by support, please make sure to **reply to the message** whilst running the command, so in that case, the bot is able to find the desired message. It will throw an error if you do not reply to a message.'
	},
	{
		name: 'edit',
		description: 'Edit a message sent by support',
		args: [
			{
				name: 'message',
				description: 'The message you wish to send'
			}
		],
		detailedDescription:
			'This command would allow you to edit a message sent by support. Please make sure to **reply to the message** so that the bot can find the desired message, and do note that if you edit a anonymous message, it will update to reflect your username, so the mystery element will be gone.'
	},
	{
		name: 'remove',
		description: 'Remove a role/user from a thread',
		args: [
			{
				name: 'user/role',
				description: 'The ID of the user or role'
			}
		]
	},
	{
		name: 'rename',
		description: 'Rename a channel',
		args: [
			{
				name: 'name',
				description: 'What the channel will be named'
			}
		]
	},
	{
		name: 'reply',
		description: 'Reply a modmail thread',
		args: [
			{
				name: 'message',
				description: 'The message you wish to send'
			}
		],
		detailedDescription:
			"This command is used to reply to modmail threads and cannot be used outside of a modmail thread. Do note that you are able to edit messages sent by support, but please be cautious. You are also able to send attachments.\n\n**Do note that if you do not provide a message, it will send saying 'No Content' which may confuse the customer, so please be cautious.**"
	},
	{
		name: 'snippet',
		description: 'Manage snippets (restricted to Executives)',
		detailedDescription:
			"**This command is only allowed to be used by executives, except for viewing snippets.**\n\nWith that out of the way, if you wish to view a snippet, you would run '.snippet <snippetname> and it will reply with the desired snippet if it exists. As for the action part of the argument, you have three options. You may **edit, add, or delete** a snippet. Each of these are self explaintory, however for the **edit** and **add** commands, you must provide a **name** AND **content** to update/add to the database. If you are using the **delete** method, you only need to provide the name.",
		args: [
			{
				name: 'action/snippetname',
				description: 'What would you like to do?'
			},
			{
				name: 'name',
				description: 'Name of Snippet'
			},
			{
				name: 'content',
				description: 'What will be in the snippet?'
			}
		]
	},
	{
		name: 'subscribe',
		description: 'Be pinged for all replies sent by a client'
	},
	{
		name: 'unsubscribe',
		description: 'The opposite of subscribe, what did you expect'
	}
];
