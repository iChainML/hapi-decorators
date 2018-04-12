# hapi-decorators

## usage

```ts
import {
  Controller,
  Get,
  Post,
  ServerSettings,
  ServerLoader
} from 'hapi-decorators';
import { Request, ResponseToolkit, routeSettings } from 'hapi';
import * as inert from 'inert';

@ServerSettings({
  port: 3000,
  host: '0.0.0.0'
})
class Server implements ServerLoader {
  async initPlugins() {
    await this.server.registry(inert);
  }
  public onServerStarted() {
    console.log(`server started at ${this.server.info.uri}`);
  }
}

@Controller('/api/vote')
class Vote {
  @Get('/all')
  getAllVotes(req: Request, h: ResponseToolkit) {
    // ...
  }
  @Post('')
  addVote() {
    //...
  }
}

@Controller('/api/user')
class User {
  @Get('/{id}')
  getUserById(req: Request, h: ResponseToolkit) {
    // ...
  }
  @Post('/{id}')
  updateUserById() {
    //...
  }
}

const vote = new Vote();
const user = new User();
const server = new Server();
server.start();
```
