# OathLock — Escrow Contract for Decentralized eCommerce

> *Put the oath on-chain, settle with truth.*

OathLock — Escrow for Decentralized eCommerce is a trust-minimized escrow contract for eCommerce on EVM-compatible chains. OathLock aligns incentives with a **seller-favored, fraud-resistant design**, while keeping **all transaction events and disputes transparent on-chain** via attestations.


## Just deployed to Mainnet

### Flow EVM Mainnet

<img width="165" height="62" alt="image" src="https://github.com/user-attachments/assets/07105451-c5d8-4641-997b-c00cc3aca5b6" />

[Link to contract address](https://github.com/rtree/OathLock/blob/main/product/contract/ignition/deployments/chain-747/deployed_addresses.json)

```json
{"Flow EVM Testnet":
  {
    "OathLockModule#IEAS": "0xBCF2dA8f82fb032A2474c92Ec5b70C95A83fc0cc",
    "OathLockModule#ISchemaRegistry": "0x97900F59828Da4187607Cb8F84f49e3944199d18",
    "OathLockModule#MockUSDC": "0xFB80FF7525935fD13775B4feE34fd67022a5CA68",
    "OathLockModule#OathLockEAS": "0x42747984FD172a03550Ea58bEC0f91c690f794a9"
  },
  "Flow EVM Mainnet":
  {
    "OathLockModule#IERC20": "0xF1815bd50389c46847f0Bda824eC8da914045D14",
    "OathLockModule#OathLock": "0x9AFB5F28E2317D75212A503eECf02DcE4A7B6F0E"
  },
}
```

### ZCirtuit Mainnet

<img width="139" height="55" alt="image" src="https://github.com/user-attachments/assets/4bbd05b1-d251-4354-aff8-2d83fb42a580" /><img width="59" height="55" alt="image" src="https://github.com/user-attachments/assets/bdc10076-7214-4bd9-b4f9-4c1f39a9f057" />

```json
{"Zircuit Testnet":
  {
    "OathLockModule#IERC20": "0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF",
    "OathLockModule#OathLock": "0xd7C2a36786124738d54AdB710D59abc8d8CAca75"
  },
}
```

[Link to contract address](https://github.com/rtree/OathLock/blob/main/product/contract/ignition/deployments/chain-48900/deployed_addresses.json)


## 🌐 You want to take a look? Here is! ✨

- **Live demo**: <https://oathlock.ngrok.io/ui/ethereum-collection.html>
- **Powerpoint**: <https://github.com/rtree/OathLock/blob/main/presentation/Zircuit%20presentation.pdf>

### MVP — What works today

#### How to use

1. **Create Oath (Buyer):** Deposit **USDC** + `(seller, expiry)` as an *Oath*. Check seller history via on-chain **attestations**.
2. **Ship (Seller):** Review Oath, then press **“Shipped”** with a **tracking hash** (shipping deadline enforced).
3. **Inspect (Buyer):**  
   - **Approve** → funds released to seller (early release supported)  
   - **Dispute** *(not delivered/counterfeit, with evidence URL)* → **no refund**, but a **negative attestation** is recorded
4. **Expiry fallback:**  
   - **Not shipped** → refund to buyer  
   - **Shipped** → full payment to seller  
   - **Anyone** may call `settle(id)` to ensure **liveness**


### Design choices

- **Model A (seller-favored):** Disputes affect **reputation**, not funds → removes buyer free-riding incentive  
- **Transparent events:** `OathCreated / SellerShipped / BuyerApproved / BuyerDisputed / SettledToSeller / RefundedToBuyer / Expired`  
- **Abuse prevention:** one dispute per order, strict deadlines, attestations required for disputes

- **Incentive alignment:** Our design creates balanced incentives for both parties:
  - **Buyer risk/reward:** Bears financial risk but can damage seller reputation through disputes
  - **Seller risk/reward:** Cannot counter-dispute buyers but always receives payment (if shipped on time)
  - **Dispute mechanics:** Buyer disputes are automatically accepted, but buyers receive no refunds
  - **Seller protection:** Cannot defend against disputes, but receives full payment unless shipping deadlines are missed

**Result:** This creates a virtuous cycle where both parties act with genuine intent:

- **Buyers** act purely from community goodwill—they either receive their product peacefully or gain honor by exposing bad sellers to protect future buyers. Refund abusers are eliminated since refunds are impossible.
- **Sellers** act with integrity because this marketplace is valuable to their business—while one-time scams are possible, repeat fraud isn't viable. Honest sellers face no risk of buyer theft, while scammers accumulate bad reputation and are driven away from OathLock.

## 🔭 Why this matters

OathLock is a **eCommerce primitive**: escrow + reputation that other marketplaces and apps can plug into. It tackles the core frictions of online trade—**delivery, authenticity, finality**—without intermediaries.

> **In short:** Escrow with reputation → **decentralized trust layer** → the foundation for **future decentralized commerce**.

[Look at our survey](https://github.com/rtree/OathLock/blob/main/presentation/Zircuit%20presentation.pdf). Web2 players are almost prone to this problem, as they are intermidiaries with no whole picture of what's going on as payment and settlment are not in hands of them and no information of neighbors.

<img width="897" height="449" alt="image" src="https://github.com/user-attachments/assets/59f9703d-3094-4058-a00e-685853ea3663" />

Let's draw eCommerce from Web2 to Web3, where all transactions are accmulating for reputations and tacle with this issue!

## 🗺️ Roadmap (future primitives)

- **Reputation & Risk:** richer attestation history, **AI trust scoring**, **rolling reserves**, seller **max outstanding** limits  
- **Incentives & Arbitration:** redistribution from reserves, **ERC‑792 / Kleros** escalation, game-theoretic “**truth wins**” design  
- **Security & Cross‑chain:** Flow/Zircuit, **Sequencer‑Level Security (SLS)**, **watchers/arbitrators as AVS**  
- **UX & Automation:** Privy login & wallet, shipping **oracles**, **auto‑settlement**, **ENS/EFP**-aware trust graphs

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

## Our team

We are team of 20+ years experience of a programmer in Financial industry + an entrepreneur of founding many companies. 
---
