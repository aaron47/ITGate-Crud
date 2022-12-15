import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserUsername = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const username = request.body.username as string;
    return username;
  },
);
