import { Module, Get, Post, routeSettings } from '../index';
import { Request, ResponseToolkit } from 'hapi';
@Module('/api/user')
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

@Module('/api/vote')
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

console.log(routeSettings());
