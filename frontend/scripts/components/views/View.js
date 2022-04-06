import { CARDS } from '../../constants';
import Mapper from '../../utils/Mapper';
import BoardView from './BoardView';
import DeathCardsView from './DeathCardsView';
import PlayersView from './PlayersView';

export default class View {
  cardsElements = CARDS.map((card) => document.getElementById(card));

  playersView = new PlayersView();

  boardView = new BoardView();

  deathCardsView = new DeathCardsView();

  initElements(callback) {
    this.playersView.init(callback);
    this.boardView.init(callback);
    this.deathCardsView.init(callback);
  }

  initCardIcons(addCard) {
    this.cardsElements.forEach((card) => {
      card.addEventListener('click', () => {
        if (addCard(card.id)) {
          card.classList.add('hide');
        }
      });
    });
  }

  initResetButton(callback) {
    const resetButton = document.getElementById('reset');

    resetButton.addEventListener('click', callback);

    resetButton.addEventListener('click', () => {
      this.playersView.resetPlayers();
      this.playersView.resetPoputResults();
      this.playersView.resetResults();
      this.boardView.reset();
      this.deathCardsView.reset();
    });

    resetButton.addEventListener('click', () => {
      this.cardsElements.forEach((card) => {
        card.classList.remove('hide');
      });
    });
  }

  resetCardIcon(card) {
    const cardElement = document.getElementById(card);

    cardElement.classList.remove('hide');
  }

  focusElement(index) {
    const { object, cardIndex, playerIndex } = Mapper.getObject(index);

    if (object === 'player') {
      this.playersView.focus(playerIndex, cardIndex);
    }

    if (object === 'board') {
      this.boardView.focus(cardIndex);
    }

    if (object === 'deathCards') {
      this.deathCardsView.focus(cardIndex);
    }
  }
}
