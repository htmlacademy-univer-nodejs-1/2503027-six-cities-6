import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type { UserAuth, User, Offer, Comment, CommentAuth, FavoriteAuth, UserRegister, NewOffer } from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';

type Extra = {
  api: AxiosInstance;
  history: History;
}

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatarPath: string;
  type: 'обычный' | 'pro';
};

type ApiCity = {
  name: Offer['city']['name'];
  latitude: number;
  longitude: number;
};

type ApiOfferPreview = {
  id: string;
  title: string;
  price: number;
  type: Offer['type'];
  publishedDate: string;
  city: ApiCity;
  previewImage: string;
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  commentsCount: number;
};

type ApiOffer = ApiOfferPreview & {
  description: string;
  photos: string[];
  rooms: number;
  guests: number;
  amenities: string[];
  author: ApiUser;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

type ApiComment = {
  text: string;
  publishDate: string;
  rating: number;
  author: ApiUser;
};

const adaptUser = (user: ApiUser): User => ({
  name: user.name,
  avatarUrl: user.avatarPath,
  isPro: user.type === 'pro',
  email: user.email,
});

const buildFallbackUser = (): User => ({
  name: 'Unknown',
  avatarUrl: '',
  isPro: false,
  email: '',
});

const adaptOfferPreview = (offer: ApiOfferPreview): Offer => ({
  id: offer.id,
  price: offer.price,
  rating: offer.rating,
  title: offer.title,
  isPremium: offer.isPremium,
  isFavorite: offer.isFavorite,
  city: {
    name: offer.city.name,
    location: {
      latitude: offer.city.latitude,
      longitude: offer.city.longitude,
    },
  },
  location: {
    latitude: offer.city.latitude,
    longitude: offer.city.longitude,
  },
  previewImage: offer.previewImage,
  type: offer.type,
  bedrooms: 0,
  description: '',
  goods: [],
  host: buildFallbackUser(),
  images: [offer.previewImage],
  maxAdults: 0,
});

const adaptOffer = (offer: ApiOffer): Offer => ({
  ...adaptOfferPreview(offer),
  description: offer.description,
  bedrooms: offer.rooms,
  goods: offer.amenities,
  host: adaptUser(offer.author),
  images: offer.photos,
  maxAdults: offer.guests,
  location: {
    latitude: offer.coordinates.latitude,
    longitude: offer.coordinates.longitude,
  },
});

const adaptComment = (comment: ApiComment, index: number): Comment => ({
  id: `${comment.publishDate}-${index}`,
  comment: comment.text,
  date: comment.publishDate,
  rating: comment.rating,
  user: adaptUser(comment.author),
});

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOfferPreview[]>(ApiRoute.Offers);

    return data.map(adaptOfferPreview);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOfferPreview[]>(ApiRoute.Favorite);

    return data.map(adaptOfferPreview);
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<ApiOffer>(`${ApiRoute.Offers}/${id}`);

      return adaptOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const payload = {
      title: newOffer.title,
      description: newOffer.description,
      publishedDate: new Date().toISOString(),
      city: newOffer.city.name,
      previewImage: newOffer.previewImage,
      photos: Array.from({ length: 6 }, () => newOffer.previewImage),
      isPremium: newOffer.isPremium,
      rating: 1,
      type: newOffer.type,
      rooms: newOffer.bedrooms,
      guests: newOffer.maxAdults,
      price: newOffer.price,
      amenities: newOffer.goods,
      coordinates: newOffer.location,
    };
    const { data } = await api.post<ApiOffer>(ApiRoute.Offers, payload);
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const payload = {
      title: offer.title,
      description: offer.description,
      city: offer.city.name,
      previewImage: offer.previewImage,
      photos: offer.images,
      isPremium: offer.isPremium,
      rating: offer.rating,
      type: offer.type,
      rooms: offer.bedrooms,
      guests: offer.maxAdults,
      price: offer.price,
      amenities: offer.goods,
      coordinates: offer.location,
    };
    const { data } = await api.patch<ApiOffer>(`${ApiRoute.Offers}/${offer.id}`, payload);
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiOfferPreview[]>(`${ApiRoute.Premium}?city=${cityName}`);

    return data.map(adaptOfferPreview);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<ApiComment[]>(`${ApiRoute.Comments}/${id}/comments`);

    return data.map(adaptComment);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    try {
      const { data } = await api.get<ApiUser>(ApiRoute.Login);

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<{ token: string; email: string }>(ApiRoute.Login, { email, password });
    const { token } = data;

    Token.save(token);
    history.push(AppRoute.Root);

    return email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async () => {
    Token.drop();
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar, isPro }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<ApiUser>(ApiRoute.Register, {
      email,
      password,
      name,
      type: isPro ? 'pro' : 'default',
    });
    if (avatar) {
      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(`${ApiRoute.Users}/${data.id}/avatar`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    history.push(AppRoute.Login);
  });


export const postComment = createAsyncThunk<Comment, CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<ApiComment>(`${ApiRoute.Comments}/${id}/comments`, { text: comment, rating });

    return adaptComment(data, Date.now());
  });

export const postFavorite = createAsyncThunk<{ id: string; isFavorite: boolean }, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      if (status === 1) {
        await api.post(`${ApiRoute.Favorite}/${id}`);
        return { id, isFavorite: true };
      }

      await api.delete(`${ApiRoute.Favorite}/${id}`);
      return { id, isFavorite: false };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });
