import { AccessTokenInterceptor } from './common/interceptors';
import { AuthService } from './auth.service';
import {
  Body,
  Catch,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/CreateUserDto.dto';
import { Response } from 'express';
import { GetCurrentUser, Public } from 'src/auth/common/decorators';
import { RefreshTokenGuard } from 'src/auth/common/guards';
import { RefreshTokenInterceptor } from './common/interceptors/refresh-token.interceptor';
import { HttpExceptionFilter } from './common/filters';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { newUser, access_token, refresh_token } =
      await this.authService.signUp(createUserDto);

    res.cookie('jid', 'Bearer ' + access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.cookie('lind', 'Bearer ' + refresh_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return {
      newUser,
      access_token,
      refresh_token,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    const { user, access_token, refresh_token } = await this.authService.login(
      createUserDto,
      res,
    );

    return { user, access_token, refresh_token };
  }

  @Post('logout')
  @UseInterceptors(AccessTokenInterceptor)
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetCurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
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
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(RefreshTokenInterceptor)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('sub') userId: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
