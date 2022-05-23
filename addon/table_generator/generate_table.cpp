// HandRankSetup.cpp : Sets up the HandRank File for VERY fast Lookups
// by Ray Wotton and the 2+2 list  My code is GPL, use it as you like

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include <filesystem>

#include "poker.hpp"

#define int64 int64_t

inline int min(int const x, int const y) {
    return y < x ? y : x;
}

int64 IDs[612978] = {0};
int HR[32487834] = {0};
int numIDs = 1;
int numcards = 0;
int maxHR = 0;
int64 maxID = 0;

// BP: ID format:
// 0x0(c1)(c2)(c3)(c4)(c5)(c6)(c7)
// card format: rrrr00ss
int64 MakeID(int64 IDin, int newcard) {
    // returns a 64-bit hand ID, for up to 8 cards, stored 1 per byte.

    int suitcount[4 + 1] = {0};
    int rankcount[13 + 1] = {0};
    int cards[8] = {0};  // intentially keeping one as a 0 end

    // can't have more than 6 cards!
    for (int i = 0; i < 6; i++) {
        // leave the 0 hole for new card
        cards[i + 1] = (int)((IDin >> (8 * i)) & 0xff);
    }

    // my cards are 2c = 1, 2d = 2  ... As = 52
    newcard--;  // make 0 based!

    // add next card. formats card to rrrr00ss
    // BP: Wyciąganie rank: newcard >> 2 <=> newcard / 4
    // BP: Wyciąganie koloru: newcard & 3 <=> newcard % 4
    cards[0] = (((newcard >> 2) + 1) << 4) + (newcard & 3) + 1;

    for (numcards = 0; cards[numcards]; numcards++) {
        // need to see if suit is significant
        suitcount[cards[numcards] & 0xf]++;
        // and rank to be sure we don't have 4!
        rankcount[(cards[numcards] >> 4) & 0xf]++;
        if (numcards) {
            // can't have the same card twice
            // if so need to get out after counting numcards
            if (cards[0] == cards[numcards])
                return 0;
        }
    }

    if (numcards > 4) {
        for (int rank = 1; rank < 14; rank++) {
            // if I have more than 4 of a rank then I shouldn't do this one!!
            // can't have more than 4 of a rank so return an ID that can't be!
            if (rankcount[rank] > 4)
                return 0;
        }
    }

    // However in the ID process I prefered that
    // 2s = 0x21, 3s = 0x31,.... Kc = 0xD4, Ac = 0xE4
    // This allows me to sort in Rank then Suit order

    // if we don't have at least 2 cards of the same suit for 4,
    // we make this card suit 0.

    // for suit to be significant, need to have n-2 of same suit
    int needsuited = numcards - 2;
    if (needsuited > 1) {
        for (int i = 0; i < numcards; i++) {  // for each card
            if (suitcount[cards[i] & 0xf] < needsuited) {
                // check suitcount to the number I need to have suits significant
                // if not enough - 0 out the suit - now this suit would be a 0 vs 1-4
                cards[i] &= 0xf0;
            }
        }
    }

// Sort Using XOR.  Netcards for N=7, using Bose-Nelson Algorithm:
// Thanks to the thread!
#define SWAP(I, J)                 \
    {                              \
        if (cards[I] < cards[J]) { \
            cards[I] ^= cards[J];  \
            cards[J] ^= cards[I];  \
            cards[I] ^= cards[J];  \
        }                          \
    }

    SWAP(0, 4);
    SWAP(1, 5);
    SWAP(2, 6);
    SWAP(0, 2);
    SWAP(1, 3);
    SWAP(4, 6);
    SWAP(2, 4);
    SWAP(3, 5);
    SWAP(0, 1);
    SWAP(2, 3);
    SWAP(4, 5);
    SWAP(1, 4);
    SWAP(3, 6);
    SWAP(1, 2);
    SWAP(3, 4);
    SWAP(5, 6);

    // long winded way to put the pieces into a int64
    // cards in bytes --66554433221100
    // the resulting ID is a 64 bit value with each card represented by 8 bits.
    int64 ID = (int64)cards[0] +
               ((int64)cards[1] << 8) +
               ((int64)cards[2] << 16) +
               ((int64)cards[3] << 24) +
               ((int64)cards[4] << 32) +
               ((int64)cards[5] << 40) +
               ((int64)cards[6] << 48);
    return ID;
}

int SaveID(int64 ID) {
    // this inserts a hand ID into the IDs array.

    if (ID == 0)
        return 0;  // don't use up a record for a 0!

    // take care of the most likely first goes on the end...
    if (ID >= maxID) {
        if (ID > maxID) {        // greater than create new else it was the last one!
            IDs[numIDs++] = ID;  // add the new ID
            maxID = ID;
        }
        return numIDs - 1;
    }

    // find the slot (by a pseudo bsearch algorithm)
    int low = 0;
    int high = numIDs - 1;
    int64 testval;
    int holdtest;

    while (high - low > 1) {
        holdtest = (high + low + 1) / 2;
        testval = IDs[holdtest] - ID;
        if (testval > 0)
            high = holdtest;
        else if (testval < 0)
            low = holdtest;
        else
            return holdtest;  // got it!!
    }
    // it couldn't be found so must be added to the current location (high)
    // make space...  // don't expect this much!
    memmove(&IDs[high + 1], &IDs[high], (numIDs - high) * sizeof(IDs[0]));

    IDs[high] = ID;  // do the insert into the hole created
    numIDs++;
    return high;
}

int DoEval(int64 IDin) {
    // converts a 64bit handID to an absolute ranking.

    // I guess I have some explaining to do here...
    // I used the Cactus Kevs Eval ref http://suffe.cool/poker/evaluator.html
    // I Love the pokersource for speed, but I needed to do some tweaking
    // to get it my way and Cactus Kevs stuff was easy to tweak ;-)
    int result = 0;
    int mainsuit = 20;  // just something that will never hit...
    // TODO: need to eliminate the main suit from the iterator
    // int suititerator = 0;
    int suititerator = 1;  // changed as per Ray Wotton's comment at http://archives1.twoplustwo.com/showflat.php?Cat=0&Number=8513906&page=0&fpart=18&vc=1
    int holdrank;
    int cards[8] = {0};  // "work" intentially keeping one as a 0 end
    int holdcards[8] = {0};
    int cardsAmount = 0;

    // See Cactus Kevs page for explainations for this type of stuff...
    const int primes[] = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41};

    if (!IDin) {  // if I have a good ID then do it...
        return 0;
    }

    for (int i = 0; i < 7; i++) {
        // convert all 7 cards (0s are ok)
        holdcards[i] = (int)((IDin >> (8 * i)) & 0xff);
        if (holdcards[i] == 0)
            break;  // once I hit a 0 I know I am done
        cardsAmount++;
        // if not 0 then count the card
        if (holdcards[i] & 0xf) {
            // find out what suit (if any) was significant and remember it
            mainsuit = holdcards[i] & 0xf;
        }
    }

    for (int i = 0; i < cardsAmount; i++) {
        // just have numcards...
        int currentCard = holdcards[i];

        // convert to cactus kevs way!!
        // ref http://www.suffecool.net/poker/evaluator.html
        //   +--------+--------+--------+--------+
        //   |xxxbbbbb|bbbbbbbb|cdhsrrrr|xxpppppp|
        //   +--------+--------+--------+--------+
        //   p = prime number of rank (deuce=2,trey=3,four=5,five=7,...,ace=41)
        //   r = rank of card (deuce=0,trey=1,four=2,five=3,...,ace=12)
        //   cdhs = suit of card
        //   b = bit turned on depending on rank of card

        int rank = (currentCard >> 4) - 1;  // my rank is top 4 bits 1-13 so convert
        int suit = currentCard & 0xf;       // my suit is bottom 4 bits 1-4, order is different, but who cares?
        if (suit == 0) {
            // if suit wasn't significant though...
            suit = suititerator++;  // Cactus Kev needs a suit!
            if (suititerator == 5)  // loop through available suits
                suititerator = 1;
            if (suit == mainsuit) {     // if it was the sigificant suit...  Don't want extras!!
                suit = suititerator++;  // skip it
                if (suititerator == 5)  // roll 1-4
                    suititerator = 1;
            }
        }
        // now make Cactus Kev's Card
        cards[i] = primes[rank] | (rank << 8) | (1 << (suit + 11)) | (1 << (16 + rank));
    }

    // James Devlin: replaced all calls to Cactus Kev's eval_5cards with calls to
    // Senzee's improved eval_5hand_fast

    switch (cardsAmount) {  // run Cactus Keys routines
        case 5:
            holdrank = eval_5hand_fast(cards[0], cards[1], cards[2], cards[3], cards[4]);
            break;
            // if 6 cards I would like to find Result for them
            // Cactus Key is 1 = highest - 7362 lowest
            // I need to get the min for the permutations
        case 6:
            holdrank = eval_5hand_fast(cards[0], cards[1], cards[2], cards[3], cards[4]);
            holdrank = min(holdrank,
                           eval_5hand_fast(cards[0], cards[1], cards[2], cards[3], cards[5]));
            holdrank = min(holdrank,
                           eval_5hand_fast(cards[0], cards[1], cards[2], cards[4], cards[5]));
            holdrank = min(holdrank,
                           eval_5hand_fast(cards[0], cards[1], cards[3], cards[4], cards[5]));
            holdrank = min(holdrank,
                           eval_5hand_fast(cards[0], cards[2], cards[3], cards[4], cards[5]));
            holdrank = min(holdrank,
                           eval_5hand_fast(cards[1], cards[2], cards[3], cards[4], cards[5]));
            break;
        case 7:
            holdrank = eval_7hand(cards);
            break;
        default:  // problem!!  shouldn't hit this...
            printf("    Problem with numcards = %d!!\n", numcards);
            break;
    }

    // I would like to change the format of Catus Kev's ret value to:
    // hhhhrrrrrrrrrrrr   hhhh = 1 high card -> 9 straight flush
    //                    r..r = rank within the above	1 to max of 2861
    result = 7463 - holdrank;  // now the worst hand = 1

    if (result < 1278)
        result = result - 0 + 4096 * 1;  // 1277 high card
    else if (result < 4138)
        result = result - 1277 + 4096 * 2;  // 2860 one pair
    else if (result < 4996)
        result = result - 4137 + 4096 * 3;  //  858 two pair
    else if (result < 5854)
        result = result - 4995 + 4096 * 4;  //  858 three-kind
    else if (result < 5864)
        result = result - 5853 + 4096 * 5;  //   10 straights
    else if (result < 7141)
        result = result - 5863 + 4096 * 6;  // 1277 flushes
    else if (result < 7297)
        result = result - 7140 + 4096 * 7;  //  156 full house
    else if (result < 7453)
        result = result - 7296 + 4096 * 8;  //  156 four-kind
    else
        result = result - 7452 + 4096 * 9;  //   10 str.flushes

    return result;  // now a handrank that I like
}

int main() {
    int64 ID;

    // step through the ID array - always shifting the current ID and
    // adding 52 cards to the end of the array.
    // when I am at 7 cards put the Hand Rank in!!
    // stepping through the ID array is perfect!!

    int IDnum;

    printf("\nGetting Card IDs!\n");

    // Jmd: Okay, this loop is going to fill up the IDs[] array which has
    // 612,967 slots. as this loops through and find new combinations it
    // adds them to the end. I need this list to be stable when I set the
    // handranks (next set)  (I do the insertion sort on new IDs these)
    // so I had to get the IDs first and then set the handranks
    for (IDnum = 0; IDs[IDnum] || IDnum == 0; IDnum++) {
        // start at 1 so I have a zero catching entry (just in case)
        for (int card = 1; card < 53; card++) {
            // the ids above contain cards upto the current card.  Now add a new card
            ID = MakeID(IDs[IDnum], card);  // get the new ID for it
            // and save it in the list if I am not on the 7th card
            if (numcards < 7)
                SaveID(ID);
        }
        printf("\rID - %d", IDnum);  // show progress -- this counts up to 612976
    }

    printf("\nSetting HandRanks!\n");

    int IDslot;
    // this is as above, but will not add anything to the ID list, so it is stable
    for (IDnum = 0; IDs[IDnum] || IDnum == 0; IDnum++) {
        // start at 1 so I have a zero catching entry (just in case)
        for (int card = 1; card < 53; card++) {
            ID = MakeID(IDs[IDnum], card);

            if (numcards < 7) {
                // when in the index mode (< 7 cards) get the id to save
                // printf("ERKA - %d el %d", SaveID(ID), ID);  // show progress -- this counts up to 612976
                IDslot = SaveID(ID) * 53 + 53;
            } else {
                // if I am at the 7th card, get the equivalence class ("hand rank") to save
                IDslot = DoEval(ID);
            }

            maxHR = IDnum * 53 + card + 53;  // find where to put it
            HR[maxHR] = IDslot;              // and save the pointer to the next card or the handrank
        }

        if (numcards == 6 || numcards == 7) {
            // an extra, If you want to know what the handrank when there is 5 or 6 cards
            // you can just do HR[u3] or HR[u4] from below code for Handrank of the 5 or
            // 6 card hand
            // this puts the above handrank into the array
            HR[IDnum * 53 + 53] = DoEval(IDs[IDnum]);
        }

        printf("\rID - %d", IDnum);  // show the progress -- counts to 612976 again
    }

    printf("\nNumber IDs = %d\nmaxHR = %d\n", numIDs, maxHR);  // for warm fuzzys

    std::filesystem::create_directories("../data");

    FILE *fout = fopen("../data/HandRanks.dat", "wb");
    if (!fout) {
        printf("Problem creating the Output File!\n");
        return 1;
    }
    fwrite(HR, sizeof(HR), 1, fout);  // big write, but quick

    fclose(fout);

    return 0;
}
