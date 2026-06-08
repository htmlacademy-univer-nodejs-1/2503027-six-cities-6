import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { CityName, OfferType, ConvenienceType } from '../../types/index.js';
import { UserEntity } from '../user/user.entity.js';
import { UserEntityConfig } from '../user/user.constant.js';
import { LocationsSchema } from './locations.schema.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ trim: true, required: true, minlength: 10, maxlength: 100 })
  public title!: string;

  @prop({ trim: true, required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public postDate!: Date;

  @prop({
    type: () => String,
    enum: CityName,
    required: true
  })
  public city!: CityName;

  @prop({ required: true })
  public previewPath!: string;

  @prop({
    type: () => [String],
    required: true,
    validate: [(val: string[]) => val.length === 6, 'Photos list must contain exactly 6 images']
  })
  public images!: string[];

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true })
  public isFavorite!: boolean;

  @prop({ required: true, min: 0, max: 5 })
  public rating!: number;

  @prop({
    type: () => String,
    enum: OfferType,
    required: true
  })
  public type!: OfferType;

  @prop({ required: true, min: 1, max: 8 })
  public roomsCount!: number;

  @prop({ required: true, min: 1, max: 10 })
  public guestsCount!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({
    type: () => [String],
    enum: ConvenienceType,
    required: true
  })
  public conveniences!: ConvenienceType[];

  @prop({
    type: () => String,
    required: true,
    ref: UserEntityConfig.REF
  })
  public userId!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;

  @prop({
    required: true,
    _id: false,
    type: () => LocationsSchema
  })
  public location!: LocationsSchema;

  @prop({
    ref: 'UserEntity',
    default: [],
  })
  public favoriteByUsers!: Ref<UserEntity>[];
}

export const OfferModel = getModelForClass(OfferEntity);
