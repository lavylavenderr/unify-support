import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const mainGuild = '802869758503813131';
export const loggingChannel = '802894778109919292';
export const ticketTranscripts = '902863701953101854';
export const ticketCategory = '802894623705137182';

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

export const staffGuild = '1235301717390921920';
export const developmentGuild = '1234270524482256937';
export const ticketCategoryId = '1303458206965563492';
export const airlineColorScheme = '#d81e05';
export const ticketEmbedColor = '#2b2d31';

export const roleTitles: { [key: number]: string } = {
	1: 'Employee',
	2: 'Senior Employee',
	3: 'Flight Coordinator',
	4: 'Departmental Board',
	5: 'Managerial Board',
	6: 'Supervisory Board',
	7: 'Executive Board',
	8: 'Jayden'
};

export const logChannel = '1279186648898338997';
export const allocationNotifChannel = '1297112937433010178';
export const flightFormChannel = '1252852749540790316';
export const validRoutes = ['Long Beach to Las Vegas', 'Boston to Orlando', 'Minneapolis to Baltimore'];
export const aircraftList = ['ZEROtech 737 MAX 8 - Imua One', 'ZEROtech 737 MAX 8 - Canyon Blue'];
