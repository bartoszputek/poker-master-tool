#include <napi.h>

#include <atomic>
#include <cmath>
#include <mutex>
#include <set>
#include <string>
#include <utility>
#include <vector>

#include "calculator.hpp"

namespace {

using calculator::BOARD_SIZE;
using calculator::CARDS_PER_PLAYER;
using calculator::DECK_SIZE;
using calculator::MAX_PLAYERS;

// The table is shared by all threads and all Node.js environments in the process.
std::mutex tableMutex;
std::atomic<bool> tableLoaded{false};

class PromiseWorker : public Napi::AsyncWorker {
   public:
    PromiseWorker(Napi::Env env, const char* resourceName)
        : Napi::AsyncWorker(env, resourceName), deferred(Napi::Promise::Deferred::New(env)) {}

    Napi::Promise Promise() const { return deferred.Promise(); }

   protected:
    void OnError(const Napi::Error& error) override { deferred.Reject(error.Value()); }

    Napi::Promise::Deferred deferred;
};

class InitWorker : public PromiseWorker {
   public:
    InitWorker(Napi::Env env, std::string path)
        : PromiseWorker(env, "poker-master-tool:initLookUpTable"), path(std::move(path)) {}

   protected:
    void Execute() override {
        std::lock_guard lock(tableMutex);
        // Do not write the table again: calculations can read it at the same time.
        if (tableLoaded) {
            return;
        }
        if (!calculator::loadTable(path)) {
            SetError("Cannot read the lookup table: " + path);
            return;
        }
        tableLoaded = true;
    }

    void OnOK() override { deferred.Resolve(Env().Undefined()); }

   private:
    std::string path;
};

class CalculateWorker : public PromiseWorker {
   public:
    CalculateWorker(Napi::Env env, std::vector<calculator::Hand> players, std::vector<int> communityCards,
                    std::vector<int> deathCards)
        : PromiseWorker(env, "poker-master-tool:calculate"),
          players(std::move(players)),
          communityCards(std::move(communityCards)),
          deathCards(std::move(deathCards)) {}

   protected:
    void Execute() override { result = calculator::compute(players, communityCards, deathCards); }

    void OnOK() override {
        Napi::Env env = Env();
        Napi::Array playersArray = Napi::Array::New(env, players.size());
        for (uint32_t i = 0; i < players.size(); ++i) {
            const calculator::PlayerStats& stats = result.players[i];

            Napi::Object handTypes = Napi::Object::New(env);
            for (size_t j = 0; j < calculator::HAND_TYPE_NAMES.size(); ++j) {
                handTypes.Set(calculator::HAND_TYPE_NAMES[j], Napi::Number::New(env, stats.handTypes[j]));
            }

            Napi::Object results = Napi::Object::New(env);
            results.Set("win", ToResult(env, stats.win));
            results.Set("draw", ToResult(env, stats.draw));
            results.Set("lose", ToResult(env, stats.lose));

            Napi::Object player = Napi::Object::New(env);
            player.Set("handTypes", handTypes);
            player.Set("results", results);
            playersArray.Set(i, player);
        }

        Napi::Object response = Napi::Object::New(env);
        response.Set("players", playersArray);
        response.Set("combinations", Napi::Number::New(env, result.combinations));
        deferred.Resolve(response);
    }

   private:
    static Napi::Array ToResult(Napi::Env env, const calculator::Outcome& outcome) {
        Napi::Array array = Napi::Array::New(env, 2);
        array.Set(0u, Napi::Number::New(env, outcome.count));
        array.Set(1u, Napi::Number::New(env, outcome.percentage));
        return array;
    }

    std::vector<calculator::Hand> players;
    std::vector<int> communityCards;
    std::vector<int> deathCards;
    calculator::Results result;
};

Napi::Array asArray(const Napi::Value& value, const char* message) {
    if (!value.IsArray()) {
        throw Napi::TypeError::New(value.Env(), message);
    }
    return value.As<Napi::Array>();
}

std::vector<int> toCards(const Napi::Array& array) {
    std::vector<int> cards;
    cards.reserve(array.Length());

    for (uint32_t i = 0; i < array.Length(); ++i) {
        Napi::Value value = array.Get(i);
        const double card = value.IsNumber() ? value.As<Napi::Number>().DoubleValue() : 0;
        if (card < 1 || card > DECK_SIZE || std::trunc(card) != card) {
            throw Napi::TypeError::New(array.Env(), "Card should be an integer from 1 to 52!");
        }
        cards.push_back(static_cast<int>(card));
    }

    return cards;
}

Napi::Value InitLookUpTable(const Napi::CallbackInfo& info) {
    if (!info[0].IsString()) {
        throw Napi::TypeError::New(info.Env(), "The argument path should be a string!");
    }

    auto* worker = new InitWorker(info.Env(), info[0].As<Napi::String>().Utf8Value());
    worker->Queue();
    return worker->Promise();
}

Napi::Value Calculate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    const Napi::Array playersArray = asArray(info[0], "The argument playersCards should be an array!");
    if (playersArray.Length() == 0) {
        throw Napi::TypeError::New(env, "Minimum length of players array is 1!");
    }
    if (playersArray.Length() > MAX_PLAYERS) {
        throw Napi::TypeError::New(env, "Maximum length of players array is 9!");
    }

    std::vector<calculator::Hand> players;
    for (uint32_t i = 0; i < playersArray.Length(); ++i) {
        const Napi::Value value = playersArray.Get(i);
        if (!value.IsArray() || value.As<Napi::Array>().Length() != CARDS_PER_PLAYER) {
            throw Napi::TypeError::New(env, "Player should have two cards!");
        }
        const std::vector<int> cards = toCards(value.As<Napi::Array>());
        players.push_back({cards[0], cards[1]});
    }

    const Napi::Array communityArray = asArray(info[1], "The argument communityCards should be an array!");
    if (communityArray.Length() > BOARD_SIZE) {
        throw Napi::TypeError::New(env, "Maximum length of communityCards array is 5!");
    }
    std::vector<int> communityCards = toCards(communityArray);

    std::vector<int> deathCards = toCards(asArray(info[2], "The argument deathCards should be an array!"));

    std::set<int> usedCards(communityCards.begin(), communityCards.end());
    usedCards.insert(deathCards.begin(), deathCards.end());
    for (const auto& cards : players) {
        usedCards.insert(cards.begin(), cards.end());
    }
    const size_t cardCount = communityCards.size() + deathCards.size() + players.size() * CARDS_PER_PLAYER;
    if (usedCards.size() != cardCount) {
        throw Napi::TypeError::New(env, "Each card can be used only one time!");
    }
    if (cardCount + BOARD_SIZE - communityCards.size() > static_cast<size_t>(DECK_SIZE)) {
        throw Napi::TypeError::New(env, "Not enough cards are left in the deck to complete the board!");
    }

    if (!tableLoaded) {
        throw Napi::Error::New(env, "The lookup table is not loaded. Call initLookUpTable() first!");
    }

    auto* worker = new CalculateWorker(env, std::move(players), std::move(communityCards), std::move(deathCards));
    worker->Queue();
    return worker->Promise();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("initLookUpTable", Napi::Function::New(env, InitLookUpTable, "initLookUpTable"));
    exports.Set("calculate", Napi::Function::New(env, Calculate, "calculate"));
    return exports;
}

}  // namespace

NODE_API_MODULE(addon, Init)
