# hapi-decorators

## usage

```ts
import { Module, Get, Post } from 'hapi-decorators';
import { Request, ResponseToolkit } from 'hapi';

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

const vote = new Vote();

server.route(vote.routeSetting());
```
