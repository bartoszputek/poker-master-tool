const path = require('node:path');
const addon = require('./build/Release/addon.node');

const LOOKUP_TABLE_PATH = path.join(__dirname, 'data', 'HandRanks.dat');

function initLookUpTable() {
  return addon.initLookUpTable(LOOKUP_TABLE_PATH);
}

// async turns the input errors that the addon throws into a rejected promise.
async function calculate(playersCards, communityCards, deathCards) {
  return addon.calculate(playersCards, communityCards, deathCards);
}

module.exports = {
  initLookUpTable,
  calculate,
};
