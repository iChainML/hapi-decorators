# hapi-decorators

[![npm version](https://badge.fury.io/js/%40ichainml%2Fhapi-decorators.svg)](https://badge.fury.io/js/%40ichainml%2Fhapi-decorators)

```shell
npm install @ichainml/hapi-decorators
```

## usage

```ts
import {
  Controller,
  Get,
  Post,
  ServerSettings,
  ServerLoader,
  Api
} from '@ichainml/hapi-decorators';
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

/** for each controller, it must extend class ``Api`` */
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

/** all the endpoints must be instantiated before server start. */
const user = new UserApi('test');
const vote = new Vote();
console.log(user, vote);
const server = new Server();
server.start();
```
