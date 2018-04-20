import { Server } from 'hapi';

export class ServerLoader {
  server: Server;
  initPlugins(server?: Server) {
    return Promise.resolve();
  }
  start() {
    return Promise.reject('server is not initialized');
  }
  onServerStarted() {}
  onServerFailed(err: any) {}
}
