import { RefreshTokenGuard } from './../guards/RefreshTokenGuard.guard';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/CreateUserDto.dto';
import { Request, Response } from 'express';
import { GetCurrentUserUsername } from 'src/utils/decorators/GetCurrentUser.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      createUserDto,
    );

    res.cookie('jid', access_token, { httpOnly: true });
    res.cookie('lind', refresh_token, { httpOnly: true });

    return {
      message: 'success',
    };
  }

  @Post('logout')
  async logout(@GetCurrentUserUsername() username: string): Promise<boolean> {
    return this.authService.logout(username);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  refreshTokens(
    @Req() req: Request,
    @GetCurrentUserUsername() username: string,
  ) {
    const refreshToken = req.cookies.lind;
    return this.authService.refreshTokens(username, refreshToken);
  }
}
