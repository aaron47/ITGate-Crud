import { JwtPayload } from 'src/types';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AccessTokenInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(AccessTokenInterceptor.name);

  constructor(
    @Inject('USERS_SERVICE') private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req: Request = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as JwtPayload;
    const dbUser = await this.usersService.findOneById(user.sub);
    const accessToken = req.headers['authorization']?.split(' ')[1];
    const isAccesstokenValid = this.jwtService.verify(accessToken, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    if (!dbUser.hashedRt) throw new BadRequestException('No user to logout');

    if (!isAccesstokenValid)
      throw new UnauthorizedException('Bad access token');

    return next.handle().pipe(
      tap(() => {
        this.logger.debug(accessToken);
      }),
    );
  }
}
