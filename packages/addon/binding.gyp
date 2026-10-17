{
  "targets": [
    {
      "target_name": "addon",
      "sources": ["src/binding.cpp", "src/calculator.cpp"],
      "dependencies": ["<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except"],
      "defines": ["NAPI_VERSION=9"],
      "cflags_cc": ["-std=c++20"],
      "xcode_settings": {"CLANG_CXX_LANGUAGE_STANDARD": "c++20"},
      "msvs_settings": {"VCCLCompilerTool": {"AdditionalOptions": ["/std:c++20"]}}
    }
  ]
}
