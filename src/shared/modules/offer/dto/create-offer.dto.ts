import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsBoolean,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';
import { CityName, ConvenienceType, OfferType } from '../../../types/index.js';
import { CreateOfferValidationMessage } from './create-offer.message.js';

export class CreateOfferDto {
  @MinLength(10, { message: CreateOfferValidationMessage.title.minLength })
  @MaxLength(100, { message: CreateOfferValidationMessage.title.maxLength })
  public title: string;

  @MinLength(20, { message: CreateOfferValidationMessage.description.minLength })
  @MaxLength(1024, { message: CreateOfferValidationMessage.description.maxLength })
  public description: string;

  @IsDateString({}, { message: CreateOfferValidationMessage.postDate.invalidFormat })
  public postDate: Date;

  @IsEnum(CityName, { message: CreateOfferValidationMessage.city.invalid })
  public city: CityName;

  @IsArray({ message: CreateOfferValidationMessage.images.invalidFormat })
  @ArrayMinSize(6, { message: CreateOfferValidationMessage.images.invalidSize })
  @ArrayMaxSize(6, { message: CreateOfferValidationMessage.images.invalidSize })
  public images: string[];

  @IsBoolean({ message: CreateOfferValidationMessage.isPremium.invalidFormat })
  public isPremium: boolean;

  @IsEnum(OfferType, { message: CreateOfferValidationMessage.type.invalid })
  public type: OfferType;

  @IsInt({ message: CreateOfferValidationMessage.roomsCount.invalidFormat })
  @Min(1, { message: CreateOfferValidationMessage.roomsCount.minValue })
  @Max(8, { message: CreateOfferValidationMessage.roomsCount.maxValue })
  public roomsCount: number;

  @IsInt({ message: CreateOfferValidationMessage.guestsCount.invalidFormat })
  @Min(1, { message: CreateOfferValidationMessage.guestsCount.minValue })
  @Max(10, { message: CreateOfferValidationMessage.guestsCount.maxValue })
  public guestsCount: number;

  @IsInt({ message: CreateOfferValidationMessage.price.invalidFormat })
  @Min(100, { message: CreateOfferValidationMessage.price.minValue })
  @Max(100000, { message: CreateOfferValidationMessage.price.maxValue })
  public price: number;

  @IsArray({ message: CreateOfferValidationMessage.conveniences.invalidFormat })
  @IsEnum(ConvenienceType, { each: true, message: CreateOfferValidationMessage.conveniences.invalid })
  public conveniences: ConvenienceType[];

  public userId: string;

  @IsNumber({}, { message: CreateOfferValidationMessage.latitude.invalidFormat })
  public latitude: number;

  @IsNumber({}, { message: CreateOfferValidationMessage.longitude.invalidFormat })
  public longitude: number;
}
