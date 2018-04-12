# hapi-decorators

## usage

```ts
import { Module, Get, Post } from 'hapi-decorators';
import { Request, ResponseToolkit, routeSettings } from 'hapi';

@Module('/api/vote')
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

@Module('/api/user')
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

server.route(routeSetting());
```
