# Security Policy

## Supported Scope

This policy covers the BurnerSOL frontend, API routes, wallet scan logic, token creation flow, tokenomics configuration, and public documentation.

## Reporting

Please report security issues privately before public disclosure.

Include:

- Summary
- Affected file or route
- Steps to reproduce
- Wallet/network used
- Screenshots or transaction signatures if relevant

## High Priority Issues

- Transaction construction that sends SOL or tokens to an unexpected destination
- Incorrect close-account destination
- Hidden mint or freeze authority behavior
- XSS or wallet-draining injection
- API abuse that can degrade service availability
- Incorrect risk labels that make dangerous actions look safe

## Launch Security Requirements

Before token launch:

- Mint authority must be revoked after initial mint.
- Freeze authority must be revoked unless publicly justified.
- Allocation wallets must be documented.
- Treasury should use multi-sig.
- Team allocation should use vesting.
- Metadata must be final before signing.