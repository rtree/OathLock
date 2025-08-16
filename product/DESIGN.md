# Product design

Create an escrow contract on the EVM chain.
OathLock — "Put the oath on-chain, settle with truth."

## MVP

### MVP: How to use

  1. The buyer connects to OathLock and deposits an Oath (seller address + escrow expiration date + USDC).Before depositing, they can view the seller's past Attestations and decide whether to proceed with the transaction.

  2. The seller connects to OathLock, and if there are no issues, ships the product and presses **"Shipped"**. If there are issues, they don't ship and end the transaction (refund to buyer after expiration), as they can verify before pressing:
     - Oath contents
     - Buyer's OathLock-related Attestations

  3. After the buyer receives the product and inspects it, if there are no problems, they press **"Product inspection passed"**. This triggers **USDC transfer to the seller even before the expiration date**.

  4. If the buyer reports **"Not delivered/Counterfeit" with evidence URL**, the transaction is treated as failed and USDC is sent to the seller (※only reputation changes). Simultaneously, a record is left in the Attestation:
     - Buyer side: Purchase canceled due to non-delivery/counterfeit
     - Seller side: Transaction ended due to dispute

  5. When expiration date is reached:
     - Before shipping: Full refund to buyer
     - After shipping: Full payment to seller

### MVP: Key architecture

- Malicious seller: As non-delivery/counterfeit disputes increase, reputation deteriorates on Attestation → becomes untrustworthy on OathLock.

- Malicious buyer: Even if they report issues, USDC doesn't return to them, so there's no incentive for free-riding. -> Adopted "Model A: Seller-favored", among following candidates:
  - Model A (0%): In disputes, buyer gets zero refund. Only bad reputation can be left.
  - Model B (100%): In disputes, buyer gets full refund. However, this strengthens buyer's fraud incentive. Buyer-favored.
  - Model C (0 < x < 100): Middle ground between Model A and Model B. Expected values of risk and malice vary, but there's no universally acceptable standard.

### MVP: Detailed

- Add shipping preconditions to the "Shipped" action
  - Make a shipping deadline mandatory for sellerShip() calls (shipDeadline < expiry)
  - When the button is pressed, save trackingHash (hash of the tracking number). Empty is not allowed.
- Abuse prevention for "Not Received / Counterfeit" claims (buyer side)
  - Only one claim per transaction, and only before the deadline (last-minute filings after the deadline are invalid)
  - A claim must be attested to EAS (store the URL here; it does not affect fund routing)
    - Even if the claim is spam, funds do not move—only reputation changes.
- Event transparency
  - Make everything viewable by anyone via a dashboard
    - Public flare-ups become costly (harder for sellers to keep operating; buyers are less likely to file casually)
    - Emit: OathCreated / SellerShipped / BuyerApproved / BuyerDisputed / SettledToSeller / RefundedToBuyer / Expired
- Ensure liveness
  - settle(id) can be executed by anyone, avoiding a bug where auto-settlement fails after the deadline
  - (As a stretch) wiring in Automation improves UX, but manual is fine for the MVP
- Clarify timing
  - Introduce shipDeadline separate from expiry (= clarifies the "before/after shipping" judgment in step 5)
  - sellerShip() is only valid when block.timestamp <= shipDeadline
  - The contract enforces shipDeadline < expiry

## Stretch Goals

- Goals
  - CDP by Coinbase
  - Emphasize Sequencer Level Security's "malicious transaction isolation": Execute escrow approve and settle under SLS protection = promote user protection. Deployment & verification on Zircuit is the prize requirement itself.
  - Privy utilization
    - UX improvement for users, with e-mail login, wallet creation and onramp
  - Oracles utilization
    - Product arrival/shipment info from delivery providers
  - Community driven settlement
    - ERC-792
  - Introduce constraints on sellers, using accumulated Attestations to:
    - Collect usage fees from sellers, and later redistribute part of sales or usage fees to buyers who left negative reviews for sellers with accumulated bad reputation
      - Secure funding for redistribution as follows:
        - Rolling Reserve
          - **Maintain "continuous reserve funds" in seller accounts**
          - Hold x% of each seller's sales for period T (e.g., 10-20% for 14-30 days)
          - Reserve funds automatically cover "damages (refunds) from transaction groups in the same period"
          - As dispute rate increases, automatically raise "reserve rate x", "reserve period T", and "maximum amount for new orders"
          - Bad reputation stops new orders = long-term loss (= also consider cost of creating new accounts)
    - Set "initial limits" for new sellers. Have Registry maintain maxOutstanding (total Oath amount that can be open simultaneously), starting small
      - As bad reputation increases, limits shrink further (down to zero)
      - Can't earn big even if they run away
  - Crypto-native self-fulfilling game design where "lying causes loss (reputation + storage fees etc.)" and "truth wins immediately/at low cost"
  - Cross chain -> Deposit to Flow, but send USDC to other chain
  - “Watchers/Arbitrators as AVS”（証拠検証やチャレンジを担う再ステーク型AVS**） like Eigenlayer
  - EFP（Ethereum Follow Protocol）やENSを使い、フォロー/信頼グラフでボンド係数を動的調整（信用が高い買い手は低ボンド）。デモでEAS×EFPの可視化パネルを見せると通ります。
  - Automation対応（checkUpkeep/performUpkeep or time-based trigger）
  - - Automationで期限越え即settle()（OKなら売り手へ／NG＋裁定なら返金）。
    - 買い手がNG → EASに“未着”アテステーション発行 → Klerosに送付。
    - すべてのTxはProtect/MEV-Blocker経由で安全にブロードキャスト。
    - - docs.kleros.io
