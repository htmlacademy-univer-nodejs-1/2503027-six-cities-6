import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator';
import { ApplicationError, HttpError, ValidationErrorField } from '../libs/rest/index.js';
import type { RequestWithTokenPayload } from '../modules/auth/index.js';
import { StatusCodes } from 'http-status-codes';

export function generateRandomValue(min:number, max: number, numAfterDigit = 0) {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}

export function getRandomItems<T>(items: T[], count?: number): T[] {
  if (items.length === 0) {
    return [];
  }

  const targetCount = (count !== undefined)
    ? Math.min(count, items.length)
    : generateRandomValue(1, items.length);

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, targetCount);
}

export function getRandomItem<T>(items: T[]):T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someDto, plainObject, { excludeExtraneousValues: true });
}

export function createErrorObject(errorType: ApplicationError, error: string, details: ValidationErrorField[] = []) {
  return { errorType, error, details };
}

export function reduceValidationErrors(errors: ValidationError[]): ValidationErrorField[] {
  return errors.map(({ property, value, constraints}) => ({
    property,
    value,
    messages: constraints ? Object.values(constraints) : []
  }));
}

export function getFullServerPath(host: string, port: number) {
  return `http://${host}:${port}`;
}

export function getUserId(req: unknown, controllerName: string): string {
  const userId = (req as RequestWithTokenPayload | null | undefined)?.tokenPayload?.id;

  if (!userId) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Unauthorized user',
      controllerName,
    );
  }

  return userId;
}
