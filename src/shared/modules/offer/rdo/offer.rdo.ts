import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class LocationRdo {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

export class CityRdo {
  @Expose()
  public name!: string;

  @Expose()
  @Type(() => LocationRdo)
  public location!: LocationRdo;
}

export class OfferRdo {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  @Type(() => CityRdo)
  public city!: CityRdo;

  @Expose()
  public previewPath!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public roomsCount!: number;

  @Expose()
  public guestsCount!: number;

  @Expose()
  public price!: number;

  @Expose()
  public conveniences!: string[];

  @Expose({ name: 'userId'})
  @Type(() => UserRdo)
  public user: UserRdo;

  @Expose()
  public commentsCount!: number;

  @Expose({ name: 'coordinates' })
  public location!: {
    latitude: number;
    longitude: number;
  };
}
