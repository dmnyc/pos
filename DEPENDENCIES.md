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

The ZXing library dependencies have been updated to compatible versions:
- `@zxing/browser` version ^0.1.4 (resolves to 0.1.5)
- `@zxing/library` version ^0.21.0 (resolves to 0.21.3)

These versions are now compatible with each other and the peer dependency requirements have been satisfied.

## Future Improvements

Consider the following improvements in future updates:

1. Run `npm audit fix` to address security vulnerabilities
2. Consider code splitting to reduce bundle size (currently over 500kb)

## Security Vulnerabilities

As of August 2025, npm audit shows several vulnerabilities that should be addressed in a future update:
- 4 high severity issues
- 6 moderate severity issues
- 1 low severity issue

Most of these are in development dependencies and don't affect production directly.