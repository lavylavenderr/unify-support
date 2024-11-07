import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const mainGuild = '802869758503813131';
export const loggingChannel = '802894778109919292';
export const ticketTranscripts = '902863701953101854';
export const ticketCategory = '802894623705137182';
export const ticketEmbedColor = '#2b2d31';

export const ticketDepartments = [
	{
		name: 'Liveries',
		description: 'If you wish to place a livery order.',
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
]