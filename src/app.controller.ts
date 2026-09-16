import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './common/decorators/roles.decorator';
import { UserRole } from './users/enums/user-role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin-ping')
  adminPing() {
    return {ok: true};
  }
}
