import { CreateUserDto } from './../dto/CreateUserDto.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersService: UsersService,
  ) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  async findOneById(@Param('id') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Patch(':id/update')
  async updateOne(
    @Param('id') userId: string,
    @Body() data: Partial<CreateUserDto>,
  ) {
    return this.usersService.updateOne(userId, data);
  }

  @Delete(':id/delete')
  async deleteOneById(@Param('id') userId: string) {
    return this.usersService.deleteOneById(userId);
  }
}
