import { ParamsDictionary } from 'express-serve-static-core';

export type OfferCityParam = {
  city: string;
} | ParamsDictionary;
