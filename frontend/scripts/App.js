import Mapper from './utils/Mapper';
import View from './views/View';
import ApiProxy from './utils/ApiProxy';
import PlayersController from './controllers/PlayersController';
import BoardController from './controllers/BoardController';
import DeathCardsController from './controllers/DeathCardsController';

export default class App {
  constructor() {
    this.view = new View();
    this.apiProxy = new ApiProxy();

    this.cursor = 0;

    const setCursor = (i) => {
      this.cursor = i;
    };

    this.playersController = new PlayersController(this.view.playersView, setCursor);
    this.boardController = new BoardController(this.view.boardView, setCursor);
    this.deathCardsController = new DeathCardsController(this.view.deathCardsView, setCursor);

    this.mapper = new Mapper(this.playersController, this.boardController, this.deathCardsController);
  }

  prepare() {
    this.view.initCardIcons((card) => this.addCard(card));
    this.view.initResetButton(() => {
      this.cursor = 0;
      this.playersController.reset();
      this.boardController.reset();
    });

    this.view.initElements((i) => {
      this.cursor = i;
      this.removeCard();
    });
  }

  async addCard(card) {
    const object = this.mapper.getObject(this.cursor);

    if (!object) {
      return false;
    }

    object.addCard(card, this.cursor);

    this.view.focusElement(card);

    this.handleResults();

    return true;
  }

  async removeCard() {
    const object = this.mapper.getObject(this.cursor);

    if (!object) {
      return false;
    }

    const deletedCard = object.removeCard(this.cursor);

    if (deletedCard) {
      this.view.resetCardIcon(deletedCard);
    }

    this.handleResults();

    return true;
  }

  async handleResults() {
    if (this.shouldFetchResults()) {
      const results = await this.getResults();

      this.view.playersView.setPlayerResults(results);
    }
  }

  shouldFetchResults() {
    const { players } = this.playersController;
    const { communityCards } = this.boardController;

    const isEveryPlayerReady = players.every((player) => player.cards.length === 0 || player.cards.length === 2);
    const isAtLeastOnePlayerFilled = players.some((player) => player.cards.length === 2);
    const areCommunityCardsReady = communityCards.length !== 2 && communityCards.length !== 1;

    return isEveryPlayerReady && isAtLeastOnePlayerFilled && areCommunityCardsReady;
  }

  async getResults() {
    const board = {
      communityCards: this.boardController.communityCards,
      deathCards: this.deathCardsController.deathCards,
      players: this.playersController.players,
    };

    const data = this.getPlayersWithCards(board);
    const indexesReadyPlayers = this.getIndexesReadyPlayers(board);

    const response = await this.apiProxy.getResults(data);

    response.players = response.players.map((playerResponse, index) => (
      {
        playerIndex: indexesReadyPlayers[index],
        ...playerResponse,
      }
    ));

    return response;
  }

  getPlayersWithCards(board) {
    const data = { ...board };
    const playersWithCards = data.players.filter((player) => player.cards.length);

    data.players = playersWithCards;

    return data;
  }

  getIndexesReadyPlayers(board) {
    const indexesReadyPlayers = [];

    board.players.forEach((player, index) => {
      if (player.cards.length) {
        indexesReadyPlayers.push(index);
      }
    });

    return indexesReadyPlayers;
  }
}
