import { JwtPayload } from './../strategy/jwt.strategy';
import { CreateUserDto } from './../dto/CreateUserDto.dto';
import { UsersService } from './../users/users.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Tokens } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(createUserDto: CreateUserDto) {
    const user = await this.usersService.findOneByUsername(
      createUserDto.username,
    );

    if (user) {
      const isPasswordValid = await argon2.verify(
        user.password,
        createUserDto.password,
      );

      if (isPasswordValid) {
        return user;
      }
    }
    return null;
  }

  async signUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.findOneByUsername(
      createUserDto.username,
    );

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const tokens = await this.getTokens(user._id, user.username);
    await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
    return tokens;
  }

  async login(createUserDto: CreateUserDto): Promise<Tokens> {
    const user = await this.validateUser(createUserDto);

    if (user) {
      const tokens = await this.getTokens(user._id, user.username);
      await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
      return tokens;
    }

    throw new BadRequestException('Invalid credentials');
  }

  async logout(username: string) {
    const user = await this.usersService.findOneByUsername(username);
    await this.usersService.updateOne(user._id, { hashedRt: '' });
    return true;
  }

  async refreshTokens(username: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findOneByUsername(username);

    if (user) {
      const isRefreshTokenValid = await argon2.verify(
        user.hashedRt,
        refreshToken,
      );

      if (isRefreshTokenValid) {
        const tokens = await this.getTokens(user._id, user.username);
        await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
        return tokens;
      }
    }

    throw new BadRequestException('Invalid refresh token');
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    return this.usersService.updateOne(userId, { hashedRt: hash });
  }

  async getTokens(userId: string, username: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      username,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '60m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
