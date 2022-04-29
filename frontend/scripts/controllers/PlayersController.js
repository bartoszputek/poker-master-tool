import CardsRepository from '../repositories/CardsRepository';
import Mapper from '../utils/Mapper';

export default class PlayersController {
  constructor(playersView, setCursor) {
    this.playersView = playersView;
    this.setCursor = setCursor;
    this.initPlayers();
  }

  get players() {
    return this.playerRepositories.map((playerRepository) => ({ cards: playerRepository.cards.filter((card) => card) }));
  }

  addCard(card, cursor) {
    const { playerIndex } = Mapper.getPlayerIndexes(cursor);

    const index = this.playerRepositories[playerIndex].addCard(card);

    this.playersView.setCard(card, playerIndex, index);

    this.setCursor((playerIndex * 2) + index + 1);
  }

  removeCard(cursor) {
    const { cardIndex, playerIndex } = Mapper.getPlayerIndexes(cursor);

    const deletedCard = this.playerRepositories[playerIndex].removeCard(cardIndex);

    this.playersView.resetCard(playerIndex, cardIndex);

    this.setCursor((playerIndex * 2) + cardIndex);

    return deletedCard;
  }

  reset() {
    this.initPlayers();
  }

  initPlayers() {
    this.playerRepositories = [];

    for (let i = 0; i < 9; i += 1) {
      this.playerRepositories.push(new CardsRepository());
    }
  }
}
