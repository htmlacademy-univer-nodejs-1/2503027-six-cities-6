import { User } from './user.type.js';

export enum CityName {
  Paris = 'Paris',
  Cologne = 'Cologne',
  Brussels = 'Brussels',
  Amsterdam = 'Amsterdam',
  Hamburg = 'Hamburg',
  Dusseldorf = 'Dusseldorf',
}

export const CITIES: Record<CityName, { latitude: number; longitude: number }> = {
  [CityName.Paris]: { latitude: 48.85661, longitude: 2.351499 },
  [CityName.Cologne]: { latitude: 50.938361, longitude: 6.959974 },
  [CityName.Brussels]: { latitude: 50.846557, longitude: 4.351697 },
  [CityName.Amsterdam]: { latitude: 52.370216, longitude: 4.895168 },
  [CityName.Hamburg]: { latitude: 53.550341, longitude: 10.000654 },
  [CityName.Dusseldorf]: { latitude: 51.225402, longitude: 6.776314 },
};

export type City = {
  name: keyof typeof CityName;
  latitude: number;
  longitude: number;
}

export enum ConvenienceType {
    Breakfast = 'Breakfast',
    AirConditioning = 'Air conditioning',
    LaptopFriendlyWorkspace = 'Laptop friendly workspace',
    BabySeat = 'Baby seat',
    Washer = 'Washer',
    Towels = 'Towels',
    Fridge = 'Fridge',
}

export enum OfferType {
    Apartment = 'apartment',
    House = 'house',
    Room = 'room',
    Hotel = 'hotel',
}

export type Offer = {
    title: string;
    description: string;
    postDate: Date;
    city: CityName;
    previewPath: string;
    images: string[];
    isPremium: boolean;
    isFavorite: boolean;
    rating: number;
    type: OfferType;
    roomsCount: number;
    guestsCount: number;
    price: number;
    conveniences: ConvenienceType[];
    user: User;
    commentsCount: number;
    latitude: number;
    longitude: number;
}

export type Location = {
  latitude: number;
  longitude: number;
}
