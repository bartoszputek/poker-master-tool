{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "src/addon.cpp",
        "src/calculator.cpp",
        "src/async.cpp"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}