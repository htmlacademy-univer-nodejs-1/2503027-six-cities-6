import { Expose, Type } from 'class-transformer';
import { CityRdo } from './offer.rdo.js';

export class OfferPreviewRdo {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  @Type(() => CityRdo)
  public city!: CityRdo;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavourites!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public price!: number;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public previewPath!: string;
}
