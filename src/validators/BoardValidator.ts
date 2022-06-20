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
    if (!board) {
      throw new ValidationError('Board object does not exist in request body', board);
    }

    const { communityCards, players, deathCards } = board;

    this.playersValidator.validate(players);

    if (!communityCards) {
      throw new ValidationError('Property communityCards is missing in board object', board);
    }

    if (!deathCards) {
      throw new ValidationError('Property deathCards is missing in board object', board);
    }

    this.arrayValidator.validate(communityCards);

    if (communityCards.length > 5) {
      throw new ValidationError('Property communityCards has too many cards (5 is maximum)', board);
    }

    communityCards.forEach((card) => {
      this.cardValidator.validate(card);
    });

    this.arrayValidator.validate(deathCards);

    deathCards.forEach((card) => {
      this.cardValidator.validate(card);
    });

    const playerCards: string[] = players.flatMap((player) => player.cards);

    if (this.hasDuplicates([...communityCards, ...playerCards, ...deathCards])) {
      throw new ValidationError('Board includes duplicated cards', board);
    }

    return true;
  }

  private hasDuplicates(cards: string[]): Boolean {
    return new Set(cards).size !== cards.length;
  }
}
