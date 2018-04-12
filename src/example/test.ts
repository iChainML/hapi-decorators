import { Module, Get, Post, routeSettings } from '../index';

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

const user = new UserApi();

console.log(routeSettings());
