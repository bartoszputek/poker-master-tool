#include "calculator.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstring>
#include <string>
#include <vector>

using namespace std;

vector<int> FULL_DECK{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
                      28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52};
array<int, 10> initHand = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
array<std::pair<int, double>, 3> initResult = {std::make_pair(0, 0), std::make_pair(0, 0), std::make_pair(0, 0)};

// The handranks lookup table - loaded from HANDRANKS.DAT.
int HR[32487834];

array<string, 10> getHandNames() {
    array<string, 10> handNames = {
        "bad",
        "highCard",
        "onePair",
        "twoPair",
        "trips",
        "straight",
        "flush",
        "fullHouse",
        "quads",
        "straightFlush"};

    return handNames;
}

array<string, 3> getResultNames() {
    array<string, 3> results = {
        "win",
        "draw",
        "lose"};

    return results;
}

array<PlayerStats, 9> initStructures() {
    array<PlayerStats, 9> players;

    for (int i = 0; i < 9; i++) {
        players[i].handTypeSum = initHand;
        players[i].results = initResult;
    }

    return players;
}

vector<int> getDeathCards(vector<vector<int>> players, vector<int> communityCards, vector<int> deathCards) {
    vector<int> cardsToRemove = deathCards;

    cardsToRemove.insert(cardsToRemove.end(), communityCards.begin(), communityCards.end());

    for (vector<vector<int>>::iterator playerIterator = players.begin(); playerIterator != players.end(); ++playerIterator) {
        vector<int> playerCards = *playerIterator;
        cardsToRemove.insert(cardsToRemove.end(), playerCards.begin(), playerCards.end());
    }

    return cardsToRemove;
}

vector<int> getDeck(vector<int> cardsToRemove) {
    vector<int> filteredDeck = FULL_DECK;

    sort(begin(cardsToRemove), end(cardsToRemove));

    filteredDeck.erase(remove_if(begin(filteredDeck), end(filteredDeck),
                                 [&](auto x) { return binary_search(begin(cardsToRemove), end(cardsToRemove), x); }),
                       end(filteredDeck));

    return filteredDeck;
}

int evalPointer(vector<int> cards, int pointer = 53) {
    int length = cards.size();

    if (length == 1) {
        return HR[pointer + cards[0]];
    }

    int card = cards[length - 1];
    cards.pop_back();

    return evalPointer(cards, HR[pointer + card]);
}

vector<int> evalPointers(vector<vector<int>> players, vector<int> communityCards) {
    vector<int> pointers;

    for (vector<vector<int>>::iterator playerIterator = players.begin(); playerIterator != players.end(); ++playerIterator) {
        vector<int> cards = communityCards;
        vector<int> playerCards = *playerIterator;

        cards.insert(cards.end(), playerCards.begin(), playerCards.end());

        int pointer = evalPointer(cards);
        pointers.push_back(pointer);
    }

    return pointers;
}

vector<int> determineWinner(int max, vector<int>& ranks) {
    vector<int> winnerIndexes;
    for (vector<int>::iterator it = ranks.begin(); it != ranks.end(); ++it) {
        int index = it - ranks.begin();

        if (*it == max) {
            winnerIndexes.push_back(index);
        }
    }

    if (winnerIndexes.size() == ranks.size()) {
        return {};
    }

    return winnerIndexes;
}

void handleResults(vector<int>& results, array<PlayerStats, 9>& players) {
    if (results.size() == 0) {
        for (array<PlayerStats, 9>::iterator it = players.begin(); it != players.end(); ++it) {
            (*it).results[1].first++;
        }
        return;
    }

    for (vector<int>::iterator it = results.begin(); it != results.end(); ++it) {
        players[(*it)].results[0].first++;
    }
}

int iterate(
    vector<int>::iterator it,
    vector<int>& playerPointers,
    int iteration,
    vector<int>& deck,
    vector<int>& ranks,
    array<PlayerStats, 9>& playersStats,
    int count = 0) {
    if (iteration == 0) {
        int max = 0;

        for (vector<int>::iterator p_iterator = playerPointers.begin(); p_iterator != playerPointers.end(); ++p_iterator) {
            int index = p_iterator - playerPointers.begin();
            array<int, 10>& handSum = playersStats[index].handTypeSum;
            int handRank = *p_iterator >> 12;
            handSum[handRank] += 1;
            ranks.push_back(*p_iterator);

            if (*p_iterator > max) {
                max = *p_iterator;
            }
        }

        vector<int> results = determineWinner(max, ranks);
        handleResults(results, playersStats);
        ranks.clear();

        return 1;
    }

    vector<int> newPointers;
    newPointers.reserve(playerPointers.size());

    for (vector<int>::iterator it1 = it; it1 != deck.end() - iteration + 1; ++it1) {
        for (vector<int>::iterator p_iterator = playerPointers.begin(); p_iterator != playerPointers.end(); ++p_iterator) {
            newPointers.push_back(HR[*p_iterator + *it1]);
        }

        count += iterate(it1 + 1, newPointers, iteration - 1, deck, ranks, playersStats);

        newPointers.clear();
    }

    return count;
}

int calculate(
    vector<vector<int>> players,
    vector<int> communityCards,
    vector<int> deathCards,
    array<PlayerStats, 9>& playersStats) {
    vector<int> cardsToRemove = getDeathCards(players, communityCards, deathCards);
    vector<int> deck = getDeck(cardsToRemove);
    vector<int> pointers = evalPointers(players, communityCards);
    vector<int> ranks;

    int combinations = iterate(deck.begin(), pointers, 5 - communityCards.size(), deck, ranks, playersStats);

    return combinations;
}

int initData() {
    memset(HR, 0, sizeof(HR));
    FILE* file = fopen("addon/data/HandRanks.dat", "rb");
    if (!file)
        return false;
    fread(HR, sizeof(HR), 1, file);
    fclose(file);

    return true;
}

Results processResults(int combinations, array<PlayerStats, 9>& playersStats) {
    Results results;
    results.combinations = combinations;

    for (int i = 0; i < 9; i++) {
        int wins = playersStats[i].results[0].first;
        int draws = playersStats[i].results[1].first;
        int loses = combinations - wins - draws;
        playersStats[i].results[2].first = loses;

        playersStats[i].results[0].second = std::ceil((wins / (double)combinations) * 10000.0) / 100.0;
        playersStats[i].results[1].second = std::ceil((draws / (double)combinations) * 10000.0) / 100.0;
        playersStats[i].results[2].second = std::ceil((loses / (double)combinations) * 10000.0) / 100.0;
    }

    results.playerStats = playersStats;

    return results;
}

Results compute(vector<vector<int>> players, vector<int> communityCards, vector<int> deathCards) {
    array<PlayerStats, 9> playersStats = initStructures();

    int combinations = calculate(players, communityCards, deathCards, playersStats);

    return processResults(combinations, playersStats);
}
