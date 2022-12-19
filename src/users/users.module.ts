import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserDocument, UserSchema } from 'src/entities/user.schema';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'USERS_SERVICE',
      useClass: UsersService,
    },
    {
      provide: 'USERS_REPOSITORY',
      useClass: UsersRepository,
    },
  ],
  exports: ['USERS_SERVICE'],
})
export class UsersModule {}
