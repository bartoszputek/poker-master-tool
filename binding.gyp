{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon/addon.cc",
        "addon/calculator.cc",
        "addon/async.cc"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}