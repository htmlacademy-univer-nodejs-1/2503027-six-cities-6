import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
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
import { UpdateOfferValidationMessage } from './update-offer.messages.js';

export class UpdateOfferDto {
  @IsOptional()
  @MinLength(10, { message: UpdateOfferValidationMessage.title.minLength })
  @MaxLength(100, { message: UpdateOfferValidationMessage.title.maxLength })
  public title?: string;

  @IsOptional()
  @MinLength(20, { message: UpdateOfferValidationMessage.description.minLength })
  @MaxLength(1024, { message: UpdateOfferValidationMessage.description.maxLength })
  public description?: string;

  @IsOptional()
  @IsDateString({}, { message: UpdateOfferValidationMessage.postDate.invalidFormat })
  public postDate?: Date;

  @IsOptional()
  @IsEnum(CityName, { message: UpdateOfferValidationMessage.city.invalid })
  public city?: CityName;

  @IsOptional()
  @MaxLength(256, { message: UpdateOfferValidationMessage.previewPath.maxLength })
  public previewPath?: string;

  @IsOptional()
  @IsArray({ message: UpdateOfferValidationMessage.images.invalidFormat })
  @ArrayMinSize(6, { message: UpdateOfferValidationMessage.images.invalidSize })
  @ArrayMaxSize(6, { message: UpdateOfferValidationMessage.images.invalidSize })
  public images?: string[];

  @IsOptional()
  @IsBoolean({ message: UpdateOfferValidationMessage.isPremium.invalidFormat })
  public isPremium?: boolean;

  @IsOptional()
  @IsBoolean({ message: UpdateOfferValidationMessage.isFavorite.invalidFormat })
  public isFavorite?: boolean;

  @IsOptional()
  @IsNumber({}, { message: UpdateOfferValidationMessage.rating.invalidFormat })
  @Min(1, { message: UpdateOfferValidationMessage.rating.minValue })
  @Max(5, { message: UpdateOfferValidationMessage.rating.maxValue })
  public rating?: number;

  @IsOptional()
  @IsEnum(OfferType, { message: UpdateOfferValidationMessage.type.invalid })
  public type?: OfferType;

  @IsOptional()
  @IsInt({ message: UpdateOfferValidationMessage.roomsCount.invalidFormat })
  @Min(1, { message: UpdateOfferValidationMessage.roomsCount.minValue })
  @Max(8, { message: UpdateOfferValidationMessage.roomsCount.maxValue })
  public roomsCount?: number;

  @IsOptional()
  @IsInt({ message: UpdateOfferValidationMessage.guestsCount.invalidFormat })
  @Min(1, { message: UpdateOfferValidationMessage.guestsCount.minValue })
  @Max(10, { message: UpdateOfferValidationMessage.guestsCount.maxValue })
  public guestsCount?: number;

  @IsOptional()
  @IsInt({ message: UpdateOfferValidationMessage.price.invalidFormat })
  @Min(100, { message: UpdateOfferValidationMessage.price.minValue })
  @Max(100000, { message: UpdateOfferValidationMessage.price.maxValue })
  public price?: number;

  @IsOptional()
  @IsArray({ message: UpdateOfferValidationMessage.conveniences.invalidFormat })
  @IsEnum(ConvenienceType, { each: true, message: UpdateOfferValidationMessage.conveniences.invalid })
  public conveniences?: ConvenienceType[];

  @IsOptional()
  @IsNumber({}, { message: UpdateOfferValidationMessage.latitude.invalidFormat })
  public latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: UpdateOfferValidationMessage.longitude.invalidFormat })
  public longitude?: number;
}
