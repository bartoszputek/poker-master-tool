import { BOARD_INDEX } from '../../constants';
import Mapper from '../../utils/Mapper';

export default class BoardController {
  constructor(boardView, setCursor) {
    this.boardView = boardView;
    this.setCursor = setCursor;
    this.communityCards = [];
  }

  addCard(card, cursor) {
    const cardIndex = Mapper.getBoardIndex(cursor);

    const { cardIndex: boardCardIndex, deletedCard } = this.addCardToBoard(card, cardIndex);

    this.boardView.setCard(card, boardCardIndex);

    this.setCursor(BOARD_INDEX + boardCardIndex + 1);

    return deletedCard;
  }

  addCardToBoard(card, cardIndex) {
    if (this.communityCards.length < cardIndex) {
      const { length } = this.communityCards;
      const deletedCard = this.communityCards[length];
      this.communityCards[length] = card;

      return {
        cardIndex: length,
        deletedCard,
      };
    }

    const deletedCard = this.communityCards[cardIndex];
    this.communityCards[cardIndex] = card;

    return {
      cardIndex,
      deletedCard,
    };
  }

  reset() {
    this.communityCards = [];
  }
}
