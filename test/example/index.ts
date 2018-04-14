import {
  Controller,
  Get,
  Post,
  ServerSettings,
  ServerLoader
} from '../../src/index';
import { Request, ResponseToolkit } from 'hapi';

@ServerSettings({
  port: 3000,
  host: '0.0.0.0'
})
class Server extends ServerLoader {
  // public async initPlugins() {
  //   // await this.server.register(inert);
  // }
  public onServerStarted() {
    console.log(`server started at ${this.server.info.uri}`);
  }
}

@Controller('/api/user')
class UserApi {
  @Get('/{id}')
  public getUserById() {
    return 1;
  }

  @Post('/{id}')
  public updateUserId() {
    // todo
  }
}

@Controller('/api/vote')
class Vote {
  @Get('/all')
  public getAllVotes(req: Request, h: ResponseToolkit) {
    // ...
  }
  @Post('')
  public addVote() {
    // ...
  }
}

const user = new UserApi();
const vote = new Vote();
const server = new Server();
server.start();
