import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CommentEntity } from '../comment/comment.entity.js';
import { DEFAULT_OFFER_COUNT } from './offer.constant.js';
import { UserEntity } from '../user/index.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);
    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate(['userId'])
      .exec();
  }

  public async find(limit = DEFAULT_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ postDate: -1 })
      .limit(limit)
      .populate(['userId'])
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate(['userId'])
      .exec();
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndDelete(offerId)
      .exec();
  }

  public async getPremiumByCity(city: string, limit = DEFAULT_PREMIUM_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate(['userId'])
      .exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }

  public async addToFavorite(offerId: string, userId: string): Promise<void> {
    const session = await this.offerModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        await this.offerModel
          .updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }, { session })
          .exec();
        await this.userModel
          .updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }, { session })
          .exec();
      });
    } catch {
      await this.offerModel.updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }).exec();

      try {
        await this.userModel.updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }).exec();
      } catch (error) {
        await this.offerModel.updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }).exec();
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  public async deleteFromFavorite(offerId: string, userId: string): Promise<void> {
    const session = await this.offerModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        await this.offerModel
          .updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }, { session })
          .exec();
        await this.userModel
          .updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }, { session })
          .exec();
      });
    } catch {
      await this.offerModel.updateOne({ _id: offerId }, { $pull: { favoriteByUsers: userId } }).exec();

      try {
        await this.userModel.updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }).exec();
      } catch (error) {
        await this.offerModel.updateOne({ _id: offerId }, { $addToSet: { favoriteByUsers: userId } }).exec();
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  public async findFavorite(limit = DEFAULT_OFFER_COUNT): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isFavorite: true })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate(['userId'])
      .exec();
  }

  public async updateRatingAndCommentCount(offerId: string): Promise<void> {
    const [aggregation] = await this.commentModel.aggregate<{ count: number; avgRating: number }>([
      { $match: { offerId: new this.commentModel.base.Types.ObjectId(offerId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const commentCount = aggregation?.count ?? 0;
    const rating = aggregation
      ? Math.round(aggregation.avgRating * 10) / 10
      : 0;

    await this.offerModel
      .findByIdAndUpdate(offerId, { commentCount, rating })
      .exec();

    this.logger.info(`Offer rating and comment count updated. OfferId: ${offerId}`, {
      commentCount,
      rating,
    });
  }
}
