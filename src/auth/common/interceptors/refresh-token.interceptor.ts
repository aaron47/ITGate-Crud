import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { JwtPayloadWithRt } from 'src/types';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { Request } from 'express';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(RefreshTokenInterceptor.name);

  constructor(
    @Inject('USERS_SERVICE') private readonly usersService: UsersService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // get the request
    const req = context.switchToHttp().getRequest<Request>();
    // extract refresh token from user
    const user = req.user as JwtPayloadWithRt;
    const refreshToken = user.refreshToken;

    // find user in db
    const dbUser = await this.usersService.findOneById(user.sub);
    // verify refresh token validity by comparing it to the hash in db
    const isRefreshTokenValid = await argon2.verify(
      dbUser.hashedRt,
      refreshToken,
    );

    if (!dbUser.hashedRt)
      throw new UnauthorizedException(
        'Access denied. No hashed refresh token in db',
      );

    if (!isRefreshTokenValid) {
      this.logger.debug('Invalid token');
      throw new UnauthorizedException('Access denied. Invalid token.');
    }

    return next.handle().pipe(tap(() => this.logger.debug(refreshToken, user)));
  }
}
