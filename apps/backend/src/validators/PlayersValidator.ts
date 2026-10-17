import ValidationError from '../errors/ValidationError.ts';
import type { ISerializedPlayer, IValidator } from '../interfaces.ts';
import ArrayValidator from './ArrayValidator.ts';
import CardValidator from './CardValidator.ts';

export default class PlayersValidator implements IValidator {
  public readonly arrayValidator: ArrayValidator;

  public readonly cardValidator: CardValidator;

  constructor(
    arrayValidator: ArrayValidator = new ArrayValidator(),
    cardValidator: CardValidator = new CardValidator(),
  ) {
    this.arrayValidator = arrayValidator;
    this.cardValidator = cardValidator;
  }

  public validate(players: ISerializedPlayer[]): boolean {
    this.arrayValidator.validate(players);

    if (players.length > 9) {
      throw new ValidationError('Length of players array is too long (9 is maximum)', players);
    }

    if (players.length < 1) {
      throw new ValidationError('Players array should have at least 1 element', players);
    }

    players.forEach((player) => {
      const { cards } = player;

      if (!cards) {
        throw new ValidationError('Property cards is missing in player object', player);
      }

      this.arrayValidator.validate(cards);

      if (cards.length !== 2) {
        throw new ValidationError(
          'Cards property in player object should have exactly two cards',
          player,
        );
      }

      cards.forEach((card) => {
        this.cardValidator.validate(card);
      });
    });

    return true;
  }
}
