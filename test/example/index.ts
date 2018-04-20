import {
  Controller,
  Get,
  Post,
  ServerSettings,
  ServerLoader,
  Api
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
  onServerStarted() {
    console.log(`server started at ${this.server.info.uri}`);
  }
}

@Controller('/api/user')
class UserApi extends Api {
  constructor(private id: string) {
    super();
  }
  @Get('')
  getUserById() {
    return this.id;
  }

  @Post('/{id}')
  updateUserId() {
    // todo
  }
}

@Controller('/api/vote')
class Vote extends Api {
  @Get('/all')
  getAllVotes(req: Request, h: ResponseToolkit) {
    // ...
  }
  @Post('')
  addVote() {
    // ...
  }
}

const user = new UserApi('test');
const vote = new Vote();
console.log(user, vote);
const server = new Server();
server.start();
