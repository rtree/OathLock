
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

- 「発送しました」には“発送前提条件”を付ける
  - sellerShip() 呼出しには 発送期限（shipDeadline < expiry） を必須化
  - 押した瞬間に trackingHash（追跡番号のハッシュ） を保存（空は不可）
- 未着/偽物”申告の濫用対策（購入者側）
  - 一取引1回のみ、かつ期限前のみ申告可（期限後の駆け込みは無効）
  - 申告は EAS へのアテステ必須（URL はここに格納、資金分岐には影響しない）
    - スパム申告でも資金は動かない、評判だけが動く。
- イベントの透明性
  - 誰でもダッシュボードで確認可能に
    - “炎上”がコスト化される（売り手は続けにくく、買い手は安易に押しにくい）
    - OathCreated / SellerShipped / BuyerApproved / BuyerDisputed / SettledToSeller / RefundedToBuyer / Expired
を発行
- liveness 確保
  - settle(id) は誰でも実行可。期限超過で自動決着しないバグを回避。
  - （Stretch で）Automation を噛ませれば UX が上がるが、MVP は手動でOK。
- タイミングの明確化
  - expiry と別に shipDeadline を導入（= ステップ9の「発送前/後」の判定を明確化）
  - sellerShip() は block.timestamp <= shipDeadline の時だけ有効。
  - shipDeadline < expiry をコントラクトで強制。

## Stretch Goals

- Goals
  - Privy ulitization
    - UX improvement for users, with e-mail login, wallet creation and onramp
  - Oracles utilization
    - Product arrival/shipment info from delivery providers
  - Community driven settlement
    - ERC-792
  - Introduce constraints on sellers, using accumulated Attestations to
    - 売り手から利用料をもらい、悪評が溜まってきた売り手に悪評をつけた購入者には後で売上や利用料の一部を還元する
      - 還元する元資金はこのように確保する
        - ローリング準備金（Rolling Reserve）
          - **販売者アカウントに“継続的な保留金”**を持たせる
          - 各販売者に売上の x% を期間Tだけ保留（例：10–20%を14–30日）
          - 保留金は“同期間の取引群の損害（返金）”に自動充当
          - 紛争率が上がるほど「保留率x」「保留期間T」「新規注文の上限額」を自動引き上げ
          - 悪評で新規が止まる＝長期の損になる（= 新アカウントを作り直すコストも考慮）
    - 新規販売者の“初期上限”を設ける。Registry に maxOutstanding（同時オープン可能な Oath 総額）を持たせ、初期は小さく
      - 悪評が増えると 上限さらに縮小（ゼロまで）
      - 逃げても大きく稼げない
  - 「嘘をつくと（評判＋保管料などで）損」「事実なら即時/低コストで勝てる」という、クリプトらしい自己実現的ゲーム設計

