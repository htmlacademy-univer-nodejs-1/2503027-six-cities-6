import { IsEmail, IsString, Length, IsEnum } from 'class-validator';
import { CreateUserMessages } from './create-user.messages.js';
import { UserType } from '../../../types/user.type.js';

export class CreateUserDto {
  @IsEmail({}, { message: CreateUserMessages.email.invalidFormat })
  public email: string;

  @IsString({ message: CreateUserMessages.name.invalidFormat })
  @Length(1, 15, { message: CreateUserMessages.name.lengthField })
  public name: string;

  @IsString({ message: CreateUserMessages.password.invalidFormat })
  @Length(6, 12, { message: CreateUserMessages.password.lengthField })
  public password: string;

  @IsEnum(UserType, { message: CreateUserMessages.userType.invalidFormat })
  public type: UserType;
}
