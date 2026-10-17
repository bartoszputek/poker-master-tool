import { CARD_RANKS, CARD_SUITS } from '../constant.ts';
import ValidationError from '../errors/ValidationError.ts';
import type { IValidator } from '../interfaces.ts';

export default class CardValidator implements IValidator {
  public validate(card: string): boolean {
    if (!card) {
      throw new ValidationError('Incorrect card format', { card });
    }

    if (card.length !== 2) {
      throw new ValidationError('Incorrect card format', { card });
    }

    if (!CARD_RANKS.includes(card[0].toLowerCase())) {
      throw new ValidationError('Incorrect card format', { card });
    }

    if (!CARD_SUITS.includes(card[1].toLowerCase())) {
      throw new ValidationError('Incorrect card format', { card });
    }

    return true;
  }
}
