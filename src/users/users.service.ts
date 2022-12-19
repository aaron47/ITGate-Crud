import { UserDocument } from 'src/entities/user.schema';
import { CreateUserDto } from './../dto/CreateUserDto.dto';
import { UsersRepository } from './users.repository';
import { Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);
    return this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findOneByUsername(username: string) {
    return this.usersRepository.findOneByUserName(username);
  }

  async updateOne(userId: string, data: Partial<UserDocument>) {
    return this.usersRepository.updateOne(userId, data);
  }

  async findOneById(userId: string) {
    return this.usersRepository.findOneById(userId);
  }

  async deleteOneById(userId: string) {
    return this.usersRepository.deleteOneById(userId);
  }
}
