import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRt } from 'src/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) return request.user;

    return request.user[data];
  },
);
