import { BOARD_INDEX } from '../constants';
import CardsRepository from '../repositories/CardsRepository';
import Mapper from '../utils/Mapper';

export default class BoardController {
  constructor(boardView, cursorController) {
    this.boardView = boardView;
    this.cursorController = cursorController;
    this.cardsRepository = new CardsRepository();
  }

  get communityCards() {
    return this.cardsRepository.cards.filter((card) => card);
  }

  addCard(card) {
    const index = this.cardsRepository.addCard(card);
    const nextIndex = this.cardsRepository.getIndex();

    this.boardView.setCard(card, index);

    this.cursorController.position = BOARD_INDEX + nextIndex;

    return true;
  }

  removeCard(cursor) {
    const cardIndex = Mapper.getBoardIndex(cursor);

    const deletedCard = this.cardsRepository.removeCard(cardIndex);

    this.boardView.resetCard(cardIndex);

    this.cursorController.position = BOARD_INDEX + cardIndex;

    return deletedCard;
  }

  reset() {
    this.cardsRepository.reset();
  }
}
