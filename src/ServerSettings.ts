import { Server, ServerOptions } from 'hapi';
import { routeSettings } from './Controller';

export function ServerSettings(options: ServerOptions) {
  return function Setting(constructor: any) {
    constructor.prototype.start = async function() {
      try {
        this.server = new Server(options);
        if (this.initPlugins) {
          await this.initPlugins(this.server);
        }
        this.server.route(routeSettings());
        if (this.initRoutes) {
          await this.initRoutes(this.server);
        }
        await this.server.start();
        this.onServerStarted(this.server);
      } catch (err) {
        this.onServerFailed(err);
      }
    };
  };
}
