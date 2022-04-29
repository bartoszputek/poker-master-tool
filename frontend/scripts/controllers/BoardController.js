import { BOARD_INDEX } from '../constants';
import CardsRepository from '../repositories/CardsRepository';
import Mapper from '../utils/Mapper';

export default class BoardController {
  constructor(boardView, setCursor) {
    this.boardView = boardView;
    this.setCursor = setCursor;
    this.cardsRepository = new CardsRepository();
  }

  get communityCards() {
    return this.cardsRepository.cards.filter((card) => card);
  }

  addCard(card) {
    const index = this.cardsRepository.addCard(card);

    this.boardView.setCard(card, index);

    this.setCursor(BOARD_INDEX + index + 1);
  }

  removeCard(cursor) {
    const cardIndex = Mapper.getBoardIndex(cursor);

    const deletedCard = this.cardsRepository.removeCard(cardIndex);

    this.boardView.resetCard(cardIndex);

    this.setCursor(BOARD_INDEX + cardIndex);

    return deletedCard;
  }

  reset() {
    this.cardsRepository.reset();
  }
}
