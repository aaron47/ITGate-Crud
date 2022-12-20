import { RefreshTokenStrategy } from './common/strategy/refreshToken.strategy';
import { JwtStrategy } from './common/strategy/jwt.strategy';
import { UsersModule } from './../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthMiddleware } from './common/middleware/auth.middleware';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'auth/logout',
        method: RequestMethod.POST,
      },
      {
        path: 'auth/refresh',
        method: RequestMethod.POST,
      },
    );
  }
}
