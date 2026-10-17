import ValidationError from '../errors/ValidationError.ts';
import type { IValidator } from '../interfaces.ts';

export default class ArrayValidator implements IValidator {
  public validate(array: unknown): boolean {
    if (!Array.isArray(array)) {
      throw new ValidationError('Object is not an array', { array });
    }

    return true;
  }
}
