# @tscircuit/kicad-mod-server

This server serves the kicad mod files using the git repository

| Endpoint            | Description             |
| ------------------- | ----------------------- |
| `/kicad_files.json` | List of all kicad files |
| `/*.kicad_mod`      | Get a kicad mod file    |

## License

All code in this repo is licensed under MIT. Note that the assets served are licensed
according to [KiCad's license](https://www.kicad.org/about/licenses/), assets are
dynamically loaded/cached by the server.
