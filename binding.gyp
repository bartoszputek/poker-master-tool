{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon/addon.cpp",
        "addon/calculator.cpp",
        "addon/async.cpp"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}