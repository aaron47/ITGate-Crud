import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // get the token from the header if present
    const token = req.headers['authorization'];

    // if no token found, return response (without going to the next middleware)
    if (!token)
      throw new UnauthorizedException('Access denied. No token provided.');

    next();
  }
}
