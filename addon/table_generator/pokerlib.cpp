#include "pokerlib.hpp"

#include <algorithm>

#include "arrays.hpp"

unsigned find_fast(unsigned u) {
    unsigned a, b, r;
    u += 0xe91aaa35;
    u ^= u >> 16;
    u += u << 8;
    u ^= u >> 4;
    b = (u >> 8) & 0x1ff;
    a = (u + (u << 2)) >> 19;
    r = a ^ hash_adjust[b];
    return r;
}

// Sort Using XOR. Netcards for N=7, using Bose-Nelson Algorithm:
void sortCards(int (&cards)[7]) {
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
}

int _eval_5hand_fast(int c1, int c2, int c3, int c4, int c5) {
    int q = (c1 | c2 | c3 | c4 | c5) >> 16;
    short s;
    if (c1 & c2 & c3 & c4 & c5 & 0xf000) return flushes[q];  // check for flushes and straight flushes
    if ((s = unique5[q])) return s;                          // check for straights and high card hands
    return hash_values[find_fast((c1 & 0xff) * (c2 & 0xff) * (c3 & 0xff) * (c4 & 0xff) * (c5 & 0xff))];
}

short eval_5hand(int *hand) {
    int c1 = *hand++;
    int c2 = *hand++;
    int c3 = *hand++;
    int c4 = *hand++;
    int c5 = *hand;

    return _eval_5hand_fast(c1, c2, c3, c4, c5);
}

short eval_6hand(int *hand) {
    int best;

    int c1 = *hand++;
    int c2 = *hand++;
    int c3 = *hand++;
    int c4 = *hand++;
    int c5 = *hand++;
    int c6 = *hand;

    best = std::min(
        {_eval_5hand_fast(c1, c2, c3, c4, c5),
         _eval_5hand_fast(c1, c2, c3, c4, c6),
         _eval_5hand_fast(c1, c2, c3, c5, c6),
         _eval_5hand_fast(c1, c2, c4, c5, c6),
         _eval_5hand_fast(c1, c3, c4, c5, c6),
         _eval_5hand_fast(c2, c3, c4, c5, c6)});

    return best;
}

// This is a non-optimized method of determining the
// best five-card hand possible out of seven cards.
short eval_7hand(int *hand) {
    int i, j, q, best = 9999, subhand[5];

    for (i = 0; i < 21; i++) {
        for (j = 0; j < 5; j++)
            subhand[j] = hand[perm7[i][j]];
        q = _eval_5hand_fast(subhand[0], subhand[1], subhand[2], subhand[3], subhand[4]);
        if (q < best)
            best = q;
    }
    return (best);
}
