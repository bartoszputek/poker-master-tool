#include <string.h>

#include <algorithm>
#include <chrono>
#include <filesystem>
#include <iostream>

#include "pokerlib.hpp"

#define int64 int64_t

int64 IDs[612978] = {0};
int HR[32487834] = {0};
int numIDs = 1;
int numcards = 0;
int maxHR = 0;
int64 maxID = 0;

// Converts 0-52 int to rrrr00ss card format and insert to IDin
// Function is reducing number of IDs by removing suits when they are not significant and sorting cards.
// To suppport iteration, it also returns 0 in cases when an ID is invalid -
// having more than 2 same cards and having more than 4 same ranks.
// Returns a 64-bit hand ID, for up to 8 cards, stored 1 per byte.
int64 MakeID(int64 IDin, int newcard) {
    int suitcount[4 + 1] = {0};
    int rankcount[13 + 1] = {0};
    int cards[7] = {0};

    // can't have more than 6 cards!
    for (int i = 0; i < 6; i++) {
        // leave the 0 hole for new card
        cards[i + 1] = (int)((IDin >> (8 * i)) & 0xff);
    }

    // Get card rank by (newcard >> 2) operation <=> newcard / 4
    // Get card suit by (newcard & 3) operation <=> newcard % 4
    cards[0] = (((newcard >> 2) + 1) << 4) + (newcard & 3) + 1;

    for (numcards = 0; numcards < 8; numcards++) {
        if (cards[numcards] == 0) {
            break;
        }

        // Count card suit and rank
        suitcount[cards[numcards] & 0xf]++;
        rankcount[(cards[numcards] >> 4) & 0xf]++;
        if (numcards) {
            // Check if card is duplicated
            if (cards[0] == cards[numcards])
                return 0;
        }
    }

    if (numcards > 4) {
        for (int rank = 1; rank < 14; rank++) {
            // Check if there are more than 4 cards with same rank
            if (rankcount[rank] > 4)
                return 0;
        }
    }

    // For suit to be significant, need to have n-2 of same suit
    int needsuited = numcards - 2;
    if (needsuited > 1) {
        for (int i = 0; i < numcards; i++) {
            if (suitcount[cards[i] & 0xf] < needsuited) {
                // Check suitcount to the number I need to have suits significant
                // if not enough - 0 out the suit - now this suit would be a 0 vs 1-4
                cards[i] &= 0xf0;
            }
        }
    }

    sortCards(cards);

    int64 ID = (int64)cards[0] +
               ((int64)cards[1] << 8) +
               ((int64)cards[2] << 16) +
               ((int64)cards[3] << 24) +
               ((int64)cards[4] << 32) +
               ((int64)cards[5] << 40) +
               ((int64)cards[6] << 48);
    return ID;
}

// Inserts an ID to the IDs array and return the index
// When the ID exists in the array it only return the index, assure uniqueness of elements
int SaveID(int64 ID) {
    if (ID == 0)
        return 0;

    if (ID >= maxID) {
        if (ID > maxID) {
            IDs[numIDs++] = ID;
            maxID = ID;
        }
        return numIDs - 1;
    }

    // Find the slot (by a pseudo bsearch algorithm)
    int low = 0;
    int high = numIDs - 1;
    int64 currentValue;
    int mid;

    while (high - low > 1) {
        mid = (high + low + 1) / 2;
        currentValue = IDs[mid] - ID;
        if (currentValue > 0)
            high = mid;
        else if (currentValue < 0)
            low = mid;
        else
            return mid;
    }

    // When ID can't be found in the array make space for it to the current location (high)
    memmove(&IDs[high + 1], &IDs[high], (numIDs - high) * sizeof(IDs[0]));
    IDs[high] = ID;
    numIDs++;

    return high;
}

// Converts a 64bit handID to an absolute ranking using Cactus Kev's calculator.
int DoEval(int64 IDin) {
    const int primes[] = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41};

    int mainsuit = 0;
    int suititerator = 1;
    int cards[7] = {0};
    int cardsAmount = 0;

    if (!IDin) {
        return 0;
    }

    for (int i = 0; i < 7; i++) {
        cards[i] = (int)((IDin >> (8 * i)) & 0xff);
        if (cards[i] == 0)
            break;
        cardsAmount++;
        if (cards[i] & 0xf) {
            // find out what suit (if any) was significant and remember it
            mainsuit = cards[i] & 0xf;
        }
    }

    for (int i = 0; i < cardsAmount; i++) {
        int currentCard = cards[i];

        int rank = (currentCard >> 4) - 1;
        int suit = currentCard & 0xf;
        if (suit == 0) {
            // if suit wasn't significant add not main suit because Cactus Kev needs a suit
            suit = suititerator++;
            if (suititerator == 5)  // loop through available suits
                suititerator = 1;
            if (suit == mainsuit) {
                suit = suititerator++;
                if (suititerator == 5)
                    suititerator = 1;
            }
        }

        // Make Cactus Kev's Card
        cards[i] = primes[rank] | (rank << 8) | (1 << (suit + 11)) | (1 << (16 + rank));
    }

    int holdrank;

    switch (cardsAmount) {
        case 5:
            holdrank = eval_5hand(cards);
            break;
        case 6:
            holdrank = eval_6hand(cards);
            break;
        default:
            holdrank = eval_7hand(cards);
            break;
    }

    // Return in format
    // hhhhrrrrrrrrrrrr   hhhh = 1 high card -> 9 straight flush
    //                    r..r = rank within the above	1 to max of 2861
    int result = 7463 - holdrank;  // the worst hand = 1

    if (result < 1278)
        result = result - 0 + 4096 * 1;  // 1277 high card
    else if (result < 4138)
        result = result - 1277 + 4096 * 2;  // 2860 one pair
    else if (result < 4996)
        result = result - 4137 + 4096 * 3;  // 858 two pair
    else if (result < 5854)
        result = result - 4995 + 4096 * 4;  // 858 three-kind
    else if (result < 5864)
        result = result - 5853 + 4096 * 5;  // 10 straights
    else if (result < 7141)
        result = result - 5863 + 4096 * 6;  // 1277 flushes
    else if (result < 7297)
        result = result - 7140 + 4096 * 7;  // 156 full house
    else if (result < 7453)
        result = result - 7296 + 4096 * 8;  // 156 four-kind
    else
        result = result - 7452 + 4096 * 9;  // 10 str.flushes

    return result;
}

int main() {
    int64 ID;
    int IDnum;

    std::cout << "Getting Card IDs!" << std::endl;

    auto start = std::chrono::high_resolution_clock::now();

    // The loop is going to fill the IDs[] array before populating HR table
    // as IDs[] should be stable when we set the handranks
    for (IDnum = 0; IDs[IDnum] || IDnum == 0; IDnum++) {
        for (int card = 0; card < 52; card++) {
            ID = MakeID(IDs[IDnum], card);
            if (numcards < 7)
                SaveID(ID);
        }
        // std::cout << "\rID - " << IDnum;  // show progress -- this counts up to 612976
    }

    std::cout << "Setting HandRanks!" << std::endl;

    int IDslot;

    for (IDnum = 0; IDs[IDnum] || IDnum == 0; IDnum++) {
        for (int card = 0; card < 52; card++) {
            ID = MakeID(IDs[IDnum], card);
            if (numcards < 7) {
                // When in the index mode (< 7 cards) get the id to save
                IDslot = SaveID(ID) * 53 + 53;
            } else {
                // If I am at the 7th card, get the equivalence class ("hand rank") to save
                IDslot = DoEval(ID);
            }
            maxHR = IDnum * 53 + (card + 1) + 53;
            HR[maxHR] = IDslot;
        }

        if (numcards == 6 || numcards == 7) {
            // Get the equivalence class ("hand rank") when there is 5 or 6 cards
            HR[IDnum * 53 + 53] = DoEval(IDs[IDnum]);
        }

        // std::cout << "\rID - " << IDnum;  // show progress -- this counts up to 612976
    }

    std::filesystem::create_directories("../data");

    FILE *fout = fopen("../data/HandRanks.dat", "wb");
    if (!fout) {
        std::cout << "Problem creating the Output File!" << std::endl;
        return 1;
    }
    fwrite(HR, sizeof(HR), 1, fout);

    fclose(fout);

    auto stop = std::chrono::high_resolution_clock::now();

    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(stop - start);

    std::cout << std::endl
              << duration.count() << "ms" << std::endl;

    return 0;
}
