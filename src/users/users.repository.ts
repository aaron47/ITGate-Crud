import { UserDocument } from './../entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserDocument.name) private readonly user: Model<UserDocument>,
  ) {}

  async create(data: Partial<UserDocument>): Promise<UserDocument> {
    const newUser = new this.user(data);
    return newUser.save();
  }

  async updateOne(
    userId: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument> {
    return this.user.findByIdAndUpdate(userId, data);
  }

  async findOneByUserName(username: string): Promise<UserDocument> {
    return this.user.findOne({ username });
  }

  async findOneById(userId: string): Promise<UserDocument> {
    return this.user.findById(userId);
  }

  async deleteOneById(userId: string): Promise<UserDocument> {
    return this.user.findByIdAndDelete(userId);
  }
}
