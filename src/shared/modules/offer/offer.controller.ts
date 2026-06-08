import {
  BaseController,
  DocumentExistsMiddleware,
  HttpError,
  HttpMethod, PrivateRouteMiddleware,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { inject, injectable } from 'inversify';
import { CityName, Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Request, Response } from 'express';
import { OfferService } from './offer-service.interface.js';
import { ParamOfferId } from './type/param-offerid.type.js';
import { fillDTO, getUserId, mapOffer } from '../../helpers/index.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { CreateOfferRequest } from './type/create-offer-request.type.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CommentRdo, CommentService } from '../comment/index.js';
import { DEFAULT_FAVORITE_OFFER_COUNT } from './offer.constant.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { UploadImageRdo } from './rdo/upload-image.rdo.js';
import { OfferCityParam } from './type/params-OfferCity.type.js';
import { StatusCodes } from 'http-status-codes';
import { OfferPreviewRdo } from './rdo/offer-preview.rdo.js';

function getOptionalUserId(req: Request): string | undefined {
  return req.headers.authorization ? (req as { tokenPayload?: { id?: string } }).tokenPayload?.id : undefined;
}

@injectable()
export default class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
  ) {
    super(logger);

    this.logger.info('Register routes for OfferController');
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.getFavoriteOffers,
      middlewares: [
        new PrivateRouteMiddleware(),
      ]
    });
    this.addRoute({path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium});
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({ path: '/bundles/favorites', method: HttpMethod.Get, handler: this.getFavoriteOffers });
    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
    this.addRoute({
      path: '/:offerId/previewPath',
      method: HttpMethod.Post,
      handler: this.uploadImage,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'previewPath'),
      ]
    });
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.deleteFromFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]});
  }

  public async show({ params }: Request<ParamOfferId>, res: Response): Promise<void> {
    const { offerId } = params;
    const offer = await this.offerService.findById(offerId);

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async index(_req: Request, res: Response) {
    const offers = await this.offerService.find();
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async create({ body, tokenPayload }: CreateOfferRequest, res: Response): Promise<void> {
    const result = await this.offerService.create({ ...body, userId: tokenPayload.id });
    const offer = await this.offerService.findById(result.id);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async delete({ params }: Request<ParamOfferId>, res: Response): Promise<void> {
    const { offerId } = params;
    const offer = await this.offerService.deleteById(offerId);

    await this.commentService.deleteByOfferId(offerId);
    this.noContent(res, offer);
  }

  public async update({ body, params }: Request<ParamOfferId, unknown, UpdateOfferDto>, res: Response): Promise<void> {
    const updatedOffer = await this.offerService.updateById(params.offerId, body);

    this.ok(res, fillDTO(OfferRdo, updatedOffer));
  }

  public async getFavoriteOffers(_req: Request, res: Response): Promise<void> {
    const favoriteOffers = await this.offerService.findFavorite(DEFAULT_FAVORITE_OFFER_COUNT);
    this.ok(res, fillDTO(OfferRdo, favoriteOffers));
  }

  public async addToFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.offerService.addToFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} not found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }

  public async deleteFromFavorite(req: Request, res: Response): Promise<void> {
    const params = req.params as ParamOfferId;
    const offerId = this.extractParam(params.offerId, 'offerId');
    const userId = getUserId(req, 'OfferController');

    await this.offerService.deleteFromFavorite(offerId, userId);
    const result = await this.offerService.findById(offerId);

    if (!result) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id: ${offerId} mot found`,
        'OfferController'
      );
    }

    this.ok(res, fillDTO(OfferRdo, mapOffer(result, userId)));
  }

  public async getComments({ params }: Request<ParamOfferId>, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(params.offerId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async uploadImage({ params, file } : Request<ParamOfferId>, res: Response) {
    const { offerId } = params;
    const updateDto = { previewPath: file?.filename };
    await this.offerService.updateById(offerId, updateDto);
    this.created(res, fillDTO(UploadImageRdo, updateDto));
  }

  private extractParam(param: unknown, name: string): string {
    const value = Array.isArray(param) ? param[0] : param;

    if (typeof value !== 'string'){
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${name} is invalid`,
        'OfferController'
      );
    }

    return value.trim();
  }


  public async getPremium(req: Request, res: Response): Promise<void> {
    const params = req.params as OfferCityParam;
    const city = this.extractParam(params.city, 'city');
    const userId = getOptionalUserId(req);

    if (!Object.values(CityName).includes(city as CityName)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `${city} is invalid city`,
        'OfferController',
      );
    }

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers.map((offer) => mapOffer(offer, userId))));
  }
}
