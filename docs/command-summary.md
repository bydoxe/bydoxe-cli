# BYDOXE CLI Command Summary

This file is generated from `docs/command-catalog.json`. Run `npm run summary:generate` after changing command registries.

## Totals

- Package: `@bydoxe/bydoxe-cli`
- Version: `0.1.3`
- Schema version: `1`
- Command count: `107`
- Write commands with local validation rules: `35/35`
- Commands requiring exact confirmation: `36`

## Command Groups

| Group | Commands | Auth Scope | Risk Profile | Parameter Modes |
| --- | --- | --- | --- | --- |
| Public REST | `27` | public: 27 | low: 27 | `none`, `query` |
| Authenticated REST | `38` | private: 38 | low: 38 | `body`, `query` |
| Write REST | `35` | private: 35 | high: 35 | `body` |
| WebSocket | `7` | public: 3<br>private: 4 | low: 3<br>medium: 3<br>high: 1 | `message` |

## Safety Summary

- Public REST commands are read-only market and exchange data operations.
- Authenticated REST read commands require local credentials but do not require `CONFIRM`.
- Write REST commands require local credentials, dry-run review, and exact `CONFIRM` before live execution.
- WebSocket public commands support bounded live execution; private WebSocket live execution remains disabled behind safety gates.
- Generated references expose auth scope, risk level, required parameters, optional parameters, and write validation rules.

## Generated References

- Full human-readable command surface: [command-reference.md](command-reference.md)
- Machine-readable command catalog: [command-catalog.json](command-catalog.json)
