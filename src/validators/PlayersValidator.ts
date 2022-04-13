import ValidationError from 'errors/ValidationError';
import { ISerializedPlayer, IValidator } from 'interfaces';
import ArrayValidator from './ArrayValidator';
import CardValidator from './CardValidator';

export default class PlayersValidator implements IValidator {
  constructor(
    public readonly arrayValidator: ArrayValidator = new ArrayValidator(),
    public readonly cardValidator: CardValidator = new CardValidator(),
  ) {}

  public validate(players: ISerializedPlayer[]): boolean {
    this.arrayValidator.validate(players);

    if (players.length > 9) {
      throw new ValidationError('Too many players, - maximum amount is 9', players);
    }

    players.forEach((player) => {
      const { cards } = player;

      if (!cards) {
        throw new ValidationError('Property cards is missing in player object', player);
      }

      this.arrayValidator.validate(cards);

      if (cards.length > 2) {
        throw new ValidationError('Player has too many cards', player);
      }

      if (cards.length < 2) {
        throw new ValidationError('Player should have two cards', player);
      }

      cards.forEach((card) => {
        this.cardValidator.validate(card);
      });
    });

    return true;
  }
}
