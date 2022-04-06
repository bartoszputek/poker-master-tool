import { BOARD_INDEX } from '../../constants';
import Mapper from '../../utils/Mapper';

export default class BoardView {
  boardElement = document.getElementById('board');

  init(callback) {
    for (let i = 0; i < 5; i += 1) {
      this.boardElement.children[i].addEventListener('click', () => {
        callback(BOARD_INDEX + i);
      });
    }
  }

  setCard(card, cardIndex) {
    const mappedCard = Mapper.mapCard(card);
    this.boardElement.children[cardIndex].style.backgroundImage = `url(assets/img/${mappedCard.toUpperCase()}.svg)`;
  }

  reset() {
    const items = Array.from(this.boardElement.children);

    items.forEach((card) => {
      card.style.backgroundImage = 'url(assets/img/2B.svg)';
    });
  }

  focus(cardIndex) {
    this.boardElement.children[cardIndex].focus();
  }
}
