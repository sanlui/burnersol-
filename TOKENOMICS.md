# BurnerSOL (BURN) Tokenomics

Status: pre-launch. BurnerSOL has not been created yet.

This document defines the intended tokenomics for BurnerSOL. It does not announce
or imply a token price, liquidity amount, launch date, exchange listing, or mint
address. Any missing operational decision is marked as `TBD`.

## Core Parameters

| Field | Value |
| --- | --- |
| Token name | BurnerSOL |
| Symbol | BURN |
| Supply | 100,000,000 BURN |
| Decimals | 9 |
| Mint address | TBD |
| Launch date | TBD |

## Authority Policy

BurnerSOL is intended to have a fixed supply.

After the initial supply is minted:

- Mint authority must be revoked.
- Freeze authority must be revoked.
- Authority status must be publicly verifiable on-chain.
- The verified mint address must be published before any public claim about the
  token being live.

Expected post-launch authority state:

```text
mintAuthority: null
freezeAuthority: null
supply: 100000000000000000
decimals: 9
```

## Allocation

The total supply is fixed at 100,000,000 BURN. Allocations are designed to avoid
unlimited emissions, reduce insider risk, and keep rewards tied to real protocol
usage.

| Category | Allocation | Amount | Release policy |
| --- | ---: | ---: | --- |
| Community rewards | 25% | 25,000,000 | Released only for verified protocol usage, subject to caps |
| Liquidity and market depth | 25% | 25,000,000 | Lock, LP, or market-making policy: TBD |
| Treasury and operations | 20% | 20,000,000 | Multisig controlled, public spending policy: TBD |
| Team and contributors | 15% | 15,000,000 | Public vesting, 12-month cliff, then 36-month linear vesting |
| Ecosystem and integrations | 10% | 10,000,000 | Grants, integrations, audits, security work |
| Security and contingency reserve | 5% | 5,000,000 | Multisig controlled, emergency/security use only |

## Circulating Supply

Initial circulating supply must be published before launch and must only include
tokens that are actually transferable at launch.

| Component | Circulating at launch |
| --- | ---: |
| Public distribution | TBD |
| Initial liquidity | TBD |
| Unlocked community rewards | TBD |
| Treasury unlocked at launch | TBD |
| Team and contributor tokens | 0 |
| Locked reserves | 0 |

Initial circulating supply: `TBD`

Any tokens assigned to vesting contracts, locks, or multisig reserves must not be
counted as circulating until they are transferable.

## Vesting and Locks

Vesting and lock details must be public before launch.

- Team and contributor allocation: 12-month cliff, then 36-month linear vesting.
- Treasury allocation: multisig controlled, with public wallet addresses: TBD.
- Community rewards reserve: released gradually under reward caps.
- Liquidity lock or market-making policy: TBD.
- Vesting contracts or lock addresses: TBD.

## Protocol Fee

BurnerSOL charges a service fee only on SOL actually recovered by the protocol.
No fee should be presented as a guaranteed investment return.

| Tier | Requirement | Fee |
| --- | --- | ---: |
| Standard | No BURN lock required | 8% |
| Locked BURN | Lock threshold: TBD | 6% |
| Minimum fee | Exceptional campaigns or approved partners only | 5% |

Rules:

- The standard protocol fee is 8%.
- Users who lock BURN can access a reduced 6% fee.
- The absolute minimum fee is 5%.
- No user tier, burn mechanic, coupon, or promotion may reduce the fee below 5%.
- Fee discounts must require real BURN locking, not temporary wallet balance
  snapshots.
- Lock duration, lock threshold, and unlock rules are `TBD`.

## Fee Routing

Fee routing must prioritize sustainability over aggressive token support.

| Destination | Share of protocol fee | Purpose |
| --- | ---: | --- |
| Operations treasury | 40% | Infrastructure, RPC, support, legal, maintenance |
| Security reserve | 20% | Audits, monitoring, incident response |
| Rewards vault | 20% | Usage-based BURN rewards, subject to caps |
| Buyback and liquidity support | 20% | Optional support using real protocol revenue only |

Buyback rules:

- Buybacks are not guaranteed.
- Buybacks may only use realized protocol revenue.
- Buybacks must not be advertised as price support or guaranteed profit.
- Buyback wallet, frequency, and execution policy: TBD.

## Rewards

BURN rewards must be limited, earned, and tied to real SOL recovered by the
protocol.

Reward principles:

- Rewards are paid from the fixed community rewards allocation.
- No rewards are minted after launch.
- No idle staking emissions.
- No unlimited referral emissions.
- No rewards for failed, simulated, duplicated, or sybil-like activity.
- Rewards are calculated only after recovery is complete and the recovered SOL is
  confirmed.

Reward caps:

| Limit | Value |
| --- | ---: |
| Maximum reward pool per epoch | TBD |
| Maximum reward per wallet per epoch | TBD |
| Maximum reward per recovery | TBD |
| Minimum recovered SOL required for rewards | TBD |

The reward formula must be published before launch. It should reference recovered
SOL and available reward budget, not a fixed high emission rate that can be
farmed regardless of protocol revenue.

Recommended formula:

```text
user_reward = min(
  recovered_SOL_based_reward,
  per_recovery_cap,
  wallet_epoch_cap,
  remaining_epoch_budget
)
```

Exact reward rate: `TBD`

## Utility

BURN utility is intentionally simple.

Primary utility:

- Lock BURN to reduce the protocol fee from 8% to 6%.
- Participate in capped, usage-based rewards when eligible.
- Support public governance signals for non-critical protocol decisions: TBD.

Excluded or postponed utility:

- No automatic APY.
- No guaranteed yield.
- No fee tier below 5%.
- No complex boost stacks.
- No unlimited burn-to-discount mechanic.
- No hidden founder tax.

## Governance and Controls

Before launch, BurnerSOL should publish:

- Multisig wallet addresses: TBD.
- Multisig signer count and threshold: TBD.
- Treasury spending policy: TBD.
- Reward budget policy: TBD.
- Vesting and lock addresses: TBD.
- Token mint address: TBD.

All material changes to fee routing, reward policy, vesting, or treasury controls
should be documented publicly.

## Anti-Scam Commitments

BurnerSOL should not launch with:

- Hidden mint authority.
- Active freeze authority after launch.
- Fake TVL.
- Fake APY.
- Fake user counts.
- Guaranteed profit language.
- Unlimited emissions.
- Undisclosed insider unlocks.
- Undisclosed treasury wallets.

## Verification

After launch, authority and supply should be verified publicly.

```bash
npm run token:verify -- <MINT_ADDRESS>
```

Expected result:

- `mintAuthority: null`
- `freezeAuthority: null`
- `supply: 100000000000000000`
- `decimals: 9`

Mint address: `TBD`
