#include <nan.h>

#include "async.h"

using Nan::GetFunction;
using Nan::New;
using Nan::Set;
using v8::FunctionTemplate;
using v8::Object;
using v8::String;

NAN_MODULE_INIT(InitAll) {
    Set(target, New<String>("initLookUpTable").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(InitLookUpTable)).ToLocalChecked());

    Set(target, New<String>("calculateAsync").ToLocalChecked(),
        GetFunction(New<FunctionTemplate>(CalculateAsync)).ToLocalChecked());
}

NODE_MODULE(addon, InitAll)