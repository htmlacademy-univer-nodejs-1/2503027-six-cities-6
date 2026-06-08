import { CreateOfferDto } from './dto/create-offer.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DocumentExists } from '../../types/index.js';

export interface OfferService extends DocumentExists {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  find(): Promise<DocumentType<OfferEntity>[]>;
  deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null>;
  findPremiumByCity(city: string, limit?: number): Promise<DocumentType<OfferEntity>[]>;
  findFavorite(count: number): Promise<DocumentType<OfferEntity>[]>;
  addToFavorite(offerId: string, userId: string): Promise<void>;
  deleteFromFavorite(offerId: string, userId: string): Promise<void>;
  updateRatingAndCommentCount(offerId: string): Promise<void>;
  exists(documentId: string): Promise<boolean>;
}
