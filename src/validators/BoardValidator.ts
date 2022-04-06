import ValidationError from 'errors/ValidationError';
import { ISerializedBoard, IValidator } from 'interfaces';
import ArrayValidator from './ArrayValidator';
import CardValidator from './CardValidator';
import PlayersValidator from './PlayersValidator';

export default class BoardValidator implements IValidator {
  constructor(
    public readonly playersValidator: IValidator = new PlayersValidator(),
    public readonly arrayValidator: ArrayValidator = new ArrayValidator(),
    public readonly cardValidator: CardValidator = new CardValidator(),
  ) {}

  public validate(board: ISerializedBoard): boolean {
    const { communityCards, players, deathCards } = board;

    this.playersValidator.validate(players);

    if (!communityCards) {
      throw new ValidationError('Property cards is missing in board object', board);
    }

    this.arrayValidator.validate(communityCards);

    if (communityCards.length > 5) {
      throw new ValidationError('Board has too many cards', board);
    }

    communityCards.forEach((card) => {
      this.cardValidator.validate(card);
    });

    this.arrayValidator.validate(deathCards);

    deathCards.forEach((card) => {
      this.cardValidator.validate(card);
    });

    return true;
  }
}
