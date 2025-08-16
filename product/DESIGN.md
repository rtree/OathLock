
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

- Malicious buyer: Even if they report issues, USDC doesn't return to them, so there's no incentive for free-riding.

　⇒ Adopted "Model A: Seller-favored"
        Model A (0%): In disputes, buyer gets zero refund. Only bad reputation can be left.
        Model B (100%): In disputes, buyer gets full refund. However, this strengthens buyer's fraud incentive. Buyer-favored.
        Model C (0 < x < 100): Middle ground between Model A and Model B. Expected values of risk and malice vary, but there's no universally acceptable standard.

## Stretch Goals

- Goals
  - Use accumulated Attestations to "introduce constraints on sellers"
    - 売り手から利用料をもらい、悪評が溜まってきた売り手に悪評をつけた購入者には後で利用料の一部を還元する
    - 新規販売者の“初期上限”を設ける。Registry に maxOutstanding（同時オープン可能な Oath 総額）を持たせ、初期は小さく
      - 悪評が増えると 上限さらに縮小（ゼロまで）
      - 逃げでも大きく稼げない

