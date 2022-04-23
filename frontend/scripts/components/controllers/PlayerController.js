import Mapper from '../../utils/Mapper';

export default class PlayerController {
  constructor(playersView, setCursor) {
    this.playersView = playersView;
    this.setCursor = setCursor;
    this.initPlayers();
  }

  addCard(card, cursor) {
    const { cardIndex, playerIndex } = Mapper.getPlayerIndexes(cursor);

    const { playerCardIndex, deletedCard } = this.addCardToPlayer(card, playerIndex, cardIndex);

    this.playersView.setCard(card, playerIndex, playerCardIndex);

    this.setCursor((playerIndex * 2) + playerCardIndex + 1);

    return deletedCard;
  }

  addCardToPlayer(card, playerIndex, cardIndex) {
    const player = this.players[playerIndex];

    if (player.cards.length < cardIndex) {
      const deletedCard = player.cards[0];
      player.cards[0] = card;

      return {
        playerCardIndex: 0,
        deletedCard,
      };
    }

    const deletedCard = player.cards[cardIndex];
    player.cards[cardIndex] = card;

    return {
      playerCardIndex: cardIndex,
      deletedCard,
    };
  }

  reset() {
    this.initPlayers();
  }

  initPlayers() {
    this.players = [];

    for (let i = 0; i < 9; i += 1) {
      this.players.push({ cards: [] });
    }
  }
}
