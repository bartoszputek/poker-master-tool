const addon = require('../build/Release/addon.node');

function initLookUpTable() {
  return new Promise((resolve) => {
    addon.initLookUpTable(() => resolve());
  });
}

function calculate(playersCards, communityCards, deathCards) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(playersCards) || playersCards.length > 9) {
      reject(new Error('Maximum length of players array is 9!'));
      return;
    }

    if (!playersCards.every((cards) => cards.length === 2)) {
      reject(new Error('Player should have 2 cards!'));
      return;
    }

    if (!Array.isArray(communityCards) || communityCards.length > 5) {
      reject(new Error('Maximum length of communityCards array is 5!'));
      return;
    }

    if (!Array.isArray(deathCards)) {
      reject(new Error('The argument deathCards should be an array!'));
      return;
    }

    function callback(err, result) {
      resolve(result);
    }

    addon.calculateAsync(playersCards, communityCards, deathCards, callback);
  });
}

module.exports = {
  initLookUpTable,
  calculate,
};
