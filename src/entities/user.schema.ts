import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class UserDocument extends Document {
  @Prop({ unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ required: false })
  hashedRt: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
