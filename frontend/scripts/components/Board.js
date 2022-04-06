export default class Board {
  players = [];

  communityCards = [];

  deathCards = [];

  constructor() {
    this.initPlayers();
  }

  initPlayers() {
    this.players = [];

    for (let i = 0; i < 9; i += 1) {
      this.players.push({ cards: [] });
    }
  }

  addCardToPlayer(card, playerIndex, cardIndex) {
    const player = this.players[playerIndex];

    if (player.cards.length < cardIndex) {
      const deletedCard = player.cards[0];
      player.cards[0] = card;

      return {
        cardIndex: 0,
        deletedCard,
      };
    }

    const deletedCard = player.cards[cardIndex];
    player.cards[cardIndex] = card;

    return {
      cardIndex,
      deletedCard,
    };
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

  addCardToDeathCards(card, cardIndex) {
    if (this.deathCards.length < cardIndex) {
      const { length } = this.deathCards;
      const deletedCard = this.deathCards[length];
      this.deathCards[length] = card;

      return {
        cardIndex: length,
        deletedCard,
      };
    }

    const deletedCard = this.deathCards[cardIndex];
    this.deathCards[cardIndex] = card;

    return {
      cardIndex,
      deletedCard,
    };
  }

  reset() {
    this.initPlayers();
    this.communityCards = [];
    this.deathCards = [];
  }
}
