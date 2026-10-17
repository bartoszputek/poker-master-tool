#include "calculator.hpp"

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

    for (int i = 0; i < 9; ++i) {
        players[i].handTypeSum = initHand;
        players[i].results = initResult;
    }

    return players;
}

vector<int> getDeathCards(const vector<vector<int>>& players, const vector<int>& communityCards,
                          const vector<int>& deathCards) {
    vector<int> cardsToRemove = deathCards;

    cardsToRemove.insert(cardsToRemove.end(), communityCards.begin(), communityCards.end());

    for (const vector<int>& playerCards : players) {
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

// Adds the cards from the last to the first, like the previous recursive version.
int evalPointer(const vector<int>& cards) {
    int pointer = 53;
    for (auto card = cards.rbegin(); card != cards.rend(); ++card) {
        pointer = HR[pointer + *card];
    }
    return pointer;
}

array<int, 9> evalPointers(const vector<vector<int>>& players, const vector<int>& communityCards) {
    array<int, 9> pointers{};

    for (size_t i = 0; i < players.size(); ++i) {
        vector<int> cards = communityCards;
        cards.insert(cards.end(), players[i].begin(), players[i].end());
        pointers[i] = evalPointer(cards);
    }

    return pointers;
}

// A board where all players have the best hand is a draw for all of them.
// Otherwise each player with the best hand gets a win.
void handleBoard(const array<int, 9>& ranks, size_t playerCount, array<PlayerStats, 9>& playersStats) {
    int max = 0;
    size_t winners = 0;

    for (size_t i = 0; i < playerCount; ++i) {
        const int rank = ranks[i];
        ++playersStats[i].handTypeSum[rank >> 12];

        if (rank > max) {
            max = rank;
            winners = 1;
        } else if (rank == max) {
            ++winners;
        }
    }

    if (winners == playerCount) {
        for (PlayerStats& stats : playersStats) {
            ++stats.results[1].first;
        }
        return;
    }

    for (size_t i = 0; i < playerCount; ++i) {
        if (ranks[i] == max) {
            ++playersStats[i].results[0].first;
        }
    }
}

int iterate(
    size_t start,
    const array<int, 9>& playerPointers,
    size_t playerCount,
    size_t iteration,
    const vector<int>& deck,
    array<PlayerStats, 9>& playersStats) {
    if (iteration == 0) {
        handleBoard(playerPointers, playerCount, playersStats);
        return 1;
    }

    array<int, 9> newPointers;
    int count = 0;

    for (size_t card = start; card + iteration <= deck.size(); ++card) {
        for (size_t i = 0; i < playerCount; ++i) {
            newPointers[i] = HR[playerPointers[i] + deck[card]];
        }

        count += iterate(card + 1, newPointers, playerCount, iteration - 1, deck, playersStats);
    }

    return count;
}

int calculate(
    const vector<vector<int>>& players,
    const vector<int>& communityCards,
    const vector<int>& deathCards,
    array<PlayerStats, 9>& playersStats) {
    vector<int> cardsToRemove = getDeathCards(players, communityCards, deathCards);
    vector<int> deck = getDeck(cardsToRemove);
    array<int, 9> pointers = evalPointers(players, communityCards);

    return iterate(0, pointers, players.size(), 5 - communityCards.size(), deck, playersStats);
}

bool initData(const string& path) {
    memset(HR, 0, sizeof(HR));
    FILE* file = fopen(path.c_str(), "rb");
    if (!file)
        return false;
    size_t blocksRead = fread(HR, sizeof(HR), 1, file);
    fclose(file);

    return blocksRead == 1;
}

Results processResults(int combinations, array<PlayerStats, 9>& playersStats) {
    Results results;
    results.combinations = combinations;

    for (int i = 0; i < 9; ++i) {
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

Results compute(const vector<vector<int>>& players, const vector<int>& communityCards, const vector<int>& deathCards) {
    array<PlayerStats, 9> playersStats = initStructures();

    int combinations = calculate(players, communityCards, deathCards, playersStats);

    return processResults(combinations, playersStats);
}
