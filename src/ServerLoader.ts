import { Server } from 'hapi';

export class ServerLoader {
  public server: Server;
  public initPlugins(server?: Server) {
    return Promise.resolve();
  }
  public start() {
    return Promise.reject('server is not initialized');
  }
  public onServerStarted() {}
  public onServerFailed(err: any) {}
}
