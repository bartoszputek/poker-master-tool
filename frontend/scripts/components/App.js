import Mapper from '../utils/Mapper';
import View from './views/View';
import ApiProxy from './ApiProxy';
import PlayerController from './controllers/PlayerController';
import BoardController from './controllers/BoardController';
import DeathCardsController from './controllers/DeathCardsController';

export default class App {
  constructor() {
    this.view = new View();
    this.apiProxy = new ApiProxy();

    this.cursor = 0;

    const setCursor = (a) => {
      this.cursor = a;
    };

    this.playerController = new PlayerController(this.view.playersView, setCursor);
    this.boardController = new BoardController(this.view.boardView, setCursor);
    this.deathCardsController = new DeathCardsController(this.view.deathCardsView, setCursor);
  }

  prepare() {
    this.view.initCardIcons((card) => this.addCard(card));
    this.view.initResetButton(() => {
      this.cursor = 0;
      this.playerController.reset();
      this.boardController.reset();
    });

    this.view.initElements((i) => {
      this.cursor = i;
    });
  }

  async addCard(card) {
    let deletedCard;

    switch (Mapper.getObject(this.cursor)) {
      case 'player':
        deletedCard = this.playerController.addCard(card, this.cursor);
        break;
      case 'board':
        deletedCard = this.boardController.addCard(card, this.cursor);
        break;
      case 'deathCards':
        deletedCard = this.deathCardsController.addCard(card, this.cursor);
        break;
      default:
        return false;
    }

    if (deletedCard) {
      this.view.resetCardIcon(deletedCard);
    }

    this.view.focusElement(this.cursor);

    if (this.shouldFetchResults()) {
      const results = await this.getResults();

      this.view.playersView.setPlayerResults(results);
    }

    return true;
  }

  shouldFetchResults() {
    const { players } = this.playerController;
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
      players: this.playerController.players,
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
