import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: '/'
})
export class IndexRoute extends Route {
	public async [methods.GET](_req: ApiRequest, res: ApiResponse) {
		return res.json({
			message: 'Welcome to the Austrian API Backend.',
			success: true
		});
	}
}
