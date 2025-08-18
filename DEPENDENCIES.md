# Dependencies Management Guide

## Installation

When installing dependencies for this project, you must use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
# or
yarn install --legacy-peer-deps
```

This is required due to peer dependency conflicts between various packages in the project.

## Known Issues

### Bitcoin Connect Dependencies

- `@getalby/bitcoin-connect` is pinned at version 3.9.3
- `@getalby/bitcoin-connect-react` is pinned at version 3.9.2
  
These versions have been tested together and are known to work properly. Upgrading either package may require additional testing.

### ZXing Dependencies

There's a peer dependency conflict between:
- `@zxing/browser` which requires `@zxing/library@^0.21.0`
- Our direct dependency on `@zxing/library@^0.20.0`

This conflict is resolved using `--legacy-peer-deps` during installation.

## Future Improvements

Consider the following improvements in future updates:

1. Resolve the ZXing library version conflicts by upgrading `@zxing/library` to version 0.21.x
2. Run `npm audit fix` after resolving these conflicts to address security vulnerabilities
3. Consider code splitting to reduce bundle size (currently over 500kb)

## Security Vulnerabilities

As of August 2025, npm audit shows several vulnerabilities that should be addressed in a future update:
- 4 high severity issues
- 6 moderate severity issues
- 1 low severity issue

Most of these are in development dependencies and don't affect production directly.