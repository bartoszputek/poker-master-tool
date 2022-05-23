#include "async.hpp"

#include <nan.h>

#include <vector>

#include "calculator.hpp"

using Nan::AsyncQueueWorker;
using Nan::AsyncWorker;
using Nan::Callback;
using Nan::Get;
using Nan::HandleScope;
using Nan::New;
using Nan::Null;
using Nan::Set;
using Nan::To;
using std::vector;
using v8::Array;
using v8::Function;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

class CalculateWorker : public AsyncWorker {
   public:
    CalculateWorker(
        Callback *callback,
        vector<vector<int32_t>> serializedPlayers,
        vector<int32_t> serializedCommunityCards,
        vector<int32_t> serializedDeathCards) : AsyncWorker(callback, "poker-eval:calculateWorker"),
                                                serializedPlayers(serializedPlayers),
                                                serializedCommunityCards(serializedCommunityCards),
                                                serializedDeathCards(serializedDeathCards) {}
    ~CalculateWorker() {}

    void Execute() {
        result = compute(serializedPlayers, serializedCommunityCards, serializedDeathCards);
    }

    void HandleOKCallback() {
        HandleScope scope;

        Local<Array> players = Nan::New<Array>();
        std::array<PlayerStats, 9> playersStats = result.playerStats;
        int combinations = result.combinations;

        std::array<std::string, 10> handNames = getHandNames();
        std::array<std::string, 3> resultNames = getResultNames();

        // Map Results struct to JS object
        for (unsigned int i = 0; i < serializedPlayers.size(); i++) {
            Local<Object> player = Nan::New<Object>();
            std::array<int, 10> playerStats = playersStats[i].handTypeSum;
            Local<Object> handTypeSum = Nan::New<Object>();
            for (int j = 0; j < 10; j++) {
                Set(handTypeSum, Nan::New<String>(handNames[j]).ToLocalChecked(), Nan::New<Number>(playerStats[j]));
            }
            Set(player, Nan::New<String>("handTypes").ToLocalChecked(), handTypeSum);

            std::array<std::pair<int, double>, 3> playerResults = playersStats[i].results;
            Local<Object> results = Nan::New<Object>();
            for (int j = 0; j < 3; j++) {
                Local<Array> singleResult = Nan::New<Array>();
                Set(singleResult, 0, Nan::New<Number>(playerResults[j].first));
                Set(singleResult, 1, Nan::New<Number>(playerResults[j].second));

                Set(results, Nan::New<String>(resultNames[j]).ToLocalChecked(), singleResult);
            }

            Set(player, Nan::New<String>("results").ToLocalChecked(), results);

            Set(players, i, player);
        }

        Local<Object> results = Nan::New<Object>();
        Set(results, Nan::New<String>("players").ToLocalChecked(), players);
        Set(results, Nan::New<String>("combinations").ToLocalChecked(), Nan::New<Number>(combinations));

        Local<Value> argv[] = {
            Null(),
            results};

        callback->Call(2, argv, async_resource);
    }

   private:
    vector<vector<int32_t>> serializedPlayers;
    vector<int32_t> serializedCommunityCards;
    vector<int32_t> serializedDeathCards;
    Results result;
};

class InitWorker : public AsyncWorker {
   public:
    InitWorker(Callback *callback)
        : AsyncWorker(callback, "poker-eval:initWorker") {}
    ~InitWorker() {}

    void Execute() {
        initData();
    }

    void HandleOKCallback() {
        HandleScope scope;

        Local<Value> argv[] = {
            Null(), New<Number>(1)};

        callback->Call(2, argv, async_resource);
    }
};

NAN_METHOD(InitLookUpTable) {
    Callback *callback = new Callback(To<Function>(info[0]).ToLocalChecked());

    AsyncQueueWorker(new InitWorker(callback));
}

NAN_METHOD(CalculateAsync) {
    Local<Array> playersLocal = Local<Array>::Cast(info[0]);

    vector<vector<int32_t>> serializedPlayers;
    // Map v8:Array<Array<Number>> to vector<vector<int32_t>>
    for (uint32_t i = 0; i < playersLocal->Length(); i++) {
        Local<Array> cards = Local<Array>::Cast(Get(playersLocal, i).ToLocalChecked());
        vector<int32_t> playerCards;
        for (int i = 0; i < 2; i++) {
            Local<Value> card = Get(cards, i).ToLocalChecked();
            int32_t number = card->Int32Value(Nan::GetCurrentContext()).ToChecked();
            playerCards.push_back(number);
        }
        serializedPlayers.push_back(playerCards);
    }

    Local<Array> communityCardsLocal = Local<Array>::Cast(info[1]);

    vector<int32_t> serializedCommunityCards;
    // Map v8:Array<Number> to vector<int32_t>
    for (uint32_t i = 0; i < communityCardsLocal->Length(); i++) {
        Local<Value> card = Get(communityCardsLocal, i).ToLocalChecked();
        int32_t number = card->Int32Value(Nan::GetCurrentContext()).ToChecked();
        serializedCommunityCards.push_back(number);
    }

    Local<Array> deathCardsLocal = Local<Array>::Cast(info[2]);

    vector<int32_t> serializedDeathCards;
    // Map v8:Array<Number> to vector<int32_t>
    for (uint32_t i = 0; i < deathCardsLocal->Length(); i++) {
        Local<Value> card = Get(deathCardsLocal, i).ToLocalChecked();
        int32_t number = card->Int32Value(Nan::GetCurrentContext()).ToChecked();
        serializedDeathCards.push_back(number);
    }

    Callback *callback = new Callback(To<Function>(info[3]).ToLocalChecked());

    AsyncQueueWorker(new CalculateWorker(callback, serializedPlayers, serializedCommunityCards, serializedDeathCards));
}