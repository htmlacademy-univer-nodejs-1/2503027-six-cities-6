import { City } from '../types/city.type.js';
import { CityName, Location } from '../types/offer.type.js';

export const Cities: Record<CityName, City> = {
  [CityName.Paris]: {
    name: CityName.Paris,
    location: {
      latitude: 48.85661,
      longitude: 2.351499
    } as Location
  },
  [CityName.Cologne]: {
    name: CityName.Cologne,
    location: {
      latitude: 50.938361,
      longitude: 6.959974
    } as Location
  },
  [CityName.Brussels]: {
    name: CityName.Brussels,
    location: {
      latitude: 50.846557,
      longitude: 4.351697
    } as Location
  },
  [CityName.Amsterdam]: {
    name: CityName.Amsterdam,
    location: {
      latitude: 52.370216,
      longitude: 4.895168
    } as Location
  },
  [CityName.Hamburg]: {
    name: CityName.Hamburg,
    location: {
      latitude: 53.550341,
      longitude: 10.000654
    } as Location
  },
  [CityName.Dusseldorf]: {
    name: CityName.Dusseldorf,
    location: {
      latitude: 51.225402,
      longitude: 6.776314
    } as Location
  }
};
