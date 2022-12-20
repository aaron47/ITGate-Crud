import { CreateUserDto } from './../dto/CreateUserDto.dto';
import { UsersService } from './../users/users.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtPayload } from 'src/types';
import { Tokens } from 'src/types/Tokens.type';

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

    const newUser = await this.usersService.create(createUserDto);

    const tokens = await this.getTokens(newUser._id, newUser.username);
    await this.updateRefreshTokenHash(newUser._id, tokens.refresh_token);

    return { newUser, ...tokens };
  }

  async login(createUserDto: CreateUserDto, res: Response) {
    const user = await this.validateUser(createUserDto);

    if (!user) {
      res.clearCookie('jid', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.clearCookie('lind', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.getTokens(user._id, user.username);
    await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
    res.cookie('jid', tokens.access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.cookie('lind', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return {
      user,
      ...tokens,
    };
  }

  async logout(userId: string) {
    const user = await this.usersService.findOneById(userId);
    await this.usersService.updateOne(user._id, { hashedRt: '' });
    return true;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findOneById(userId);

    if (user) {
      // const isRefreshTokenValid = await argon2.verify(
      //   user.hashedRt,
      //   refreshToken,
      // );

      // if (isRefreshTokenValid) {
      const tokens = await this.getTokens(user._id, user.username);
      await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
      return tokens;
      // }
    }

    throw new BadRequestException('Invalid refresh token');
  }

  private async hashData(data: string) {
    return argon2.hash(data);
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    return this.usersService.updateOne(userId, { hashedRt: hash });
  }

  private async getTokens(userId: string, username: string): Promise<Tokens> {
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
