import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { User } from './user';

@Module({
  controllers: [UserController],
  providers: [User],
})
export class UserModule {}
