# OathLock — Escrow for Decentralized Commerce (EVM)

> *Put the oath on-chain, settle with truth.*

A trust-minimized escrow contract for physical-goods commerce on EVM-compatible chains. OathLock aligns incentives with a **seller-favored, fraud-resistant design**, while keeping **all transaction events and disputes transparent on-chain** via attestations.


## This project runs on:

### Flow
<img width="161" height="150" alt="image" src="https://github.com/user-attachments/assets/689b0530-3e55-4f5e-bc6d-1c58053468a7" />
0x0FBF8E4536f40831EE7eC35E2127D8a6580Bdee7

### ZCirtuit
<img width="139" height="55" alt="image" src="https://github.com/user-attachments/assets/4bbd05b1-d251-4354-aff8-2d83fb42a580" /><img width="59" height="55" alt="image" src="https://github.com/user-attachments/assets/bdc10076-7214-4bd9-b4f9-4c1f39a9f057" />
0x76D72a4bf89Bb2327759826046FabE9BDA884E8B



---

## 🌐 Demo

- **E-commerce demo:** <https://oathlock.ngrok.io/ui/ethereum-collection.html>
- **App URL:** <https://oathlock.ngrok.io>

---

## ✨ MVP — What works today

1. **Create Oath (Buyer):** Deposit **USDC** + `(seller, expiry)` as an *Oath*. Check seller history via on-chain **attestations**.
2. **Ship (Seller):** Review Oath, then press **“Shipped”** with a **tracking hash** (shipping deadline enforced).
3. **Inspect (Buyer):**  
   - **Approve** → funds released to seller (early release supported)  
   - **Dispute** *(not delivered/counterfeit, with evidence URL)* → **no refund**, but a **negative attestation** is recorded
4. **Expiry fallback:**  
   - **Not shipped** → refund to buyer  
   - **Shipped** → full payment to seller  
   - **Anyone** may call `settle(id)` to ensure **liveness**


## Design choices

- **Model A (seller-favored):** Disputes affect **reputation**, not funds → removes buyer free-riding incentive  
- **Transparent events:** `OathCreated / SellerShipped / BuyerApproved / BuyerDisputed / SettledToSeller / RefundedToBuyer / Expired`  
- **Abuse prevention:** one dispute per order, strict deadlines, attestations required for disputes

---

## 🔭 Why this matters

OathLock is a **commerce primitive**: escrow + reputation that other marketplaces and apps can plug into.  
It tackles the core frictions of online trade—**delivery, authenticity, finality**—without intermediaries.

> **In short:** Escrow with reputation → **decentralized trust layer** → the foundation for **future decentralized commerce**.

---

## 🗺️ Roadmap (future primitives)

- **Reputation & Risk:** richer attestation history, **AI trust scoring**, **rolling reserves**, seller **max outstanding** limits  
- **Incentives & Arbitration:** redistribution from reserves, **ERC‑792 / Kleros** escalation, game-theoretic “**truth wins**” design  
- **Security & Cross‑chain:** Flow/Zircuit, **Sequencer‑Level Security (SLS)**, **watchers/arbitrators as AVS**  
- **UX & Automation:** Privy login & wallet, shipping **oracles**, **auto‑settlement**, **ENS/EFP**-aware trust graphs

---

## 🔌 Network (for demo/testing)

<details>
<summary><strong>Flow EVM Mainnet</strong></summary>

- **RPC:** https://mainnet.evm.nodes.onflow.org  
- **Chain ID:** 747  
- **Currency:** FLOW  
- **Explorer:** https://evm.flowscan.io/  
- **USDC (stgUSDC):** `0xF1815bd50389c46847f0Bda824eC8da914045D14`  
- **Bridge/DEX:** Stargate (stargate.finance), PunchSwap  
- **EAS:**  
  - Explorer: https://flow.easscan.credora.io  
  - `SchemaRegistry.sol`: `0xB0cF748a05AEA8D59e15834446CFC95bcFF510F0`  
  - `EAS.sol`: `0xc6376222F6E009A705a34dbF1dF72fEf8efB3964`
</details>

<details>
<summary><strong>Flow EVM Testnet</strong></summary>

- **RPC:** https://testnet.evm.nodes.onflow.org  
- **Chain ID:** 545  
- **Currency:** FLOW  
- **Explorer:** https://evm-testnet.flowscan.io  
- **USDC (stgUSDC):** `XXX` *(project mimic)*  
- **Bridge/DEX:** Stargate, PunchSwap  
- **EAS:**  
  - Explorer: https://flow-testnet.easscan.credora.io  
  - `SchemaRegistry.sol`: `0x97900F59828Da4187607Cb8F84f49e3944199d18`  
  - `EAS.sol`: `0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc`
</details>

<details>
<summary><strong>Zircuit Mainnet</strong></summary>

- **RPC:** https://mainnet.zircuit.com  
- **Chain ID:** 48900  
- **Currency:** ETH  
  - **ZRC:** `0xfd418e42783382e86ae91e445406600ba144d162` / `0xfd418e42783382E86Ae91e445406600Ba144D162`  
- **Explorer:** https://explorer.zircuit.com  
- **USDC.e:** `0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF`  
- **Bridge/DEX:** https://bridge.zircuit.com/ , https://app.circuit.money/swap  
- **EAS:** Explorer / SchemaRegistry / EAS.sol: **TBD**

</details>

---
