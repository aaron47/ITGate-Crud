import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super({});
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(ctx);
  }
}
