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
        throw new ValidationError('Cards property in player object should have exactly two cards', player);
      }

      cards.forEach((card) => {
        this.cardValidator.validate(card);
      });
    });

    return true;
  }
}
