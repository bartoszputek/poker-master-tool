const path = require('node:path');
const addon = require('./build/Release/addon.node');

const LOOKUP_TABLE_PATH = path.join(__dirname, 'data', 'HandRanks.dat');

function initLookUpTable() {
  return new Promise((resolve, reject) => {
    addon.initLookUpTable(LOOKUP_TABLE_PATH, (error) => (error ? reject(error) : resolve()));
  });
}

function calculate(playersCards, communityCards, deathCards) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(playersCards) || playersCards.length > 9) {
      reject(new Error('Maximum length of players array is 9!'));
      return;
    }

    if (!playersCards.every((cards) => cards.length === 2)) {
      reject(new Error('Player should have two cards!'));
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
