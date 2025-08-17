// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IEAS.sol";

contract OathLock {
    using SafeERC20 for IERC20;

    enum Status {
        Created,
        Shipped,
        Approved,
        Disputed,
        Settled,
        Refunded
    }

    enum Category { Counterfeit, Damaged, Undelivered } // 0,1,2

    struct Oath {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        address token;
        uint256 expiry;
        uint256 shipDeadline;
        bytes32 trackingHash;
        string evidenceURL;
        Status status;
    }

    uint256 private _oathCounter;
    mapping(uint256 => Oath) public oaths;
    IERC20 public usdcToken;

    // --- EAS ---
    IEAS public eas;
    // schema UIDs
    bytes32 public SCHEMA_ORDER_OPENED;
    bytes32 public SCHEMA_SHIPMENT_DECLARED;
    bytes32 public SCHEMA_DISPUTE_FILED;
    bytes32 public SCHEMA_REPUTATION_TAG;
    bytes32 public SCHEMA_SETTLEMENT_EXECUTED;

    // link: oathId -> OrderOpened uid
    mapping(uint256 => bytes32) public oathUID;

    event OathCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount, uint256 expiry);
    event SellerShipped(uint256 indexed id, bytes32 trackingHash);
    event BuyerApproved(uint256 indexed id);
    event BuyerDisputed(uint256 indexed id, string evidenceURL);
    event SettledToSeller(uint256 indexed id);
    event RefundedToBuyer(uint256 indexed id);

    constructor(
        address _usdcToken,
        address _eas,
        bytes32 _schemaOrderOpened,
        bytes32 _schemaShipmentDeclared,
        bytes32 _schemaDisputeFiled,
        bytes32 _schemaReputationTag,
        bytes32 _schemaSettlementExecuted
    ) {
        usdcToken = IERC20(_usdcToken);
        eas = IEAS(_eas);
        SCHEMA_ORDER_OPENED       = _schemaOrderOpened;
        SCHEMA_SHIPMENT_DECLARED  = _schemaShipmentDeclared;
        SCHEMA_DISPUTE_FILED      = _schemaDisputeFiled;
        SCHEMA_REPUTATION_TAG     = _schemaReputationTag;
        SCHEMA_SETTLEMENT_EXECUTED= _schemaSettlementExecuted;
    }

    // --------- EAS helper ----------
    function _attest(bytes32 schema, address recipient, bytes32 refUID, bytes memory data) internal returns (bytes32 uid) {
        uid = eas.attest(IEAS.AttestationRequest({
            schema: schema,
            data: IEAS.AttestationRequestData({
                recipient: recipient,
                expirationTime: 0,
                revocable: false,
                refUID: refUID,
                data: data,
                value: 0
            })
        }));
    }

    function createOath(
        address seller,
        uint256 amount,
        uint256 expiry
    ) external returns (uint256) {
        require(seller != address(0), "Invalid seller address");
        require(amount > 0, "Amount must be greater than zero");
        require(expiry > block.timestamp, "Expiry must be in the future");

        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        _oathCounter++;
        uint256 newOathId = _oathCounter;
        oaths[newOathId] = Oath({
            id: newOathId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            token: address(usdcToken),
            expiry: expiry,
            shipDeadline: 0,
            trackingHash: bytes32(0),
            evidenceURL: "",
            status: Status.Created
        });

        emit OathCreated(newOathId, msg.sender, seller, amount, expiry);

        // EAS: OrderOpened (shipDeadline/trackingHash まだ不明なので 0 を入れる)
        bytes32 uid = _attest(
            SCHEMA_ORDER_OPENED,
            seller, // recipient
            bytes32(0),
            abi.encode(newOathId, msg.sender, seller, address(usdcToken), amount, uint64(expiry), uint64(0), bytes32(0))
        );
        oathUID[newOathId] = uid;

        return newOathId;
    }

    function sellerShip(uint256 id, uint256 shipDeadline, bytes32 trackingHash) external {
        Oath storage oath = oaths[id];
        require(msg.sender == oath.seller, "Only seller can ship");
        require(oath.status == Status.Created, "Oath not in created state");
        require(shipDeadline < oath.expiry, "Ship deadline must be before expiry");
        require(block.timestamp <= shipDeadline, "Shipping deadline has passed");
        require(trackingHash != bytes32(0), "Tracking hash cannot be empty");

        oath.status = Status.Shipped;
        oath.shipDeadline = shipDeadline;
        oath.trackingHash = trackingHash;

        emit SellerShipped(id, trackingHash);

        // EAS: ShipmentDeclared
        _attest(
            SCHEMA_SHIPMENT_DECLARED,
            oath.seller,
            oathUID[id],
            abi.encode(id, trackingHash, uint64(block.timestamp), "")
        );
    }

    function buyerApprove(uint256 id) external {
        Oath storage oath = oaths[id];
        require(msg.sender == oath.buyer, "Only buyer can approve");
        require(oath.status == Status.Shipped, "Oath not in shipped state");

        oath.status = Status.Approved;
        usdcToken.safeTransfer(oath.seller, oath.amount);

        emit BuyerApproved(id);

        // EAS: SettlementExecuted (SellerPaid)
        _attest(
            SCHEMA_SETTLEMENT_EXECUTED,
            oath.seller,
            oathUID[id],
            abi.encode(id, oath.seller, uint8(1), "")
        );
    }

    /// @notice 返金はしない方針のまま、カテゴリ別ゲートだけ導入
    function buyerDispute(
        uint256 id,
        uint8 category,              // 0:Counterfeit 1:Damaged 2:Undelivered
        bytes32 evidenceHash,
        string calldata evidenceURI
    ) external {
        Oath storage oath = oaths[id];
        require(msg.sender == oath.buyer, "Only buyer can dispute");
        require(bytes(evidenceURI).length > 0, "Evidence URL cannot be empty");
        require(bytes(oath.evidenceURL).length == 0, "Dispute already filed");

        // カテゴリゲート
        if (Category(category) == Category.Undelivered) {
            require(block.timestamp >= oath.shipDeadline, "Too early for undelivered");
            require(oath.status == Status.Created, "Shipment already declared");
        } else {
            require(oath.status == Status.Shipped, "Not shipped yet");
        }

        oath.status = Status.Disputed;
        oath.evidenceURL = evidenceURI;

        emit BuyerDisputed(id, evidenceURI);

        // ③ DisputeFiled（seller 向け：ネガ集計）
        _attest(
            SCHEMA_DISPUTE_FILED,
            oath.seller,
            oathUID[id],
            abi.encode(id, oath.buyer, oath.seller, category, evidenceHash, evidenceURI)
        );

        // ④ ReputationTag（二重アテスト）: buyer は "不名誉"、 seller は "名誉"
        // kind: 1=DisputeReporter, 2=ReportAcknowledged / polarity: -1 or +1
        _attest(
            SCHEMA_REPUTATION_TAG,
            oath.buyer,
            oathUID[id],
            abi.encode(id, oath.buyer, uint8(1), int8(-1), category)
        );
        _attest(
            SCHEMA_REPUTATION_TAG,
            oath.seller,
            oathUID[id],
            abi.encode(id, oath.seller, uint8(2), int8(1), category)
        );
    }

    function settle(uint256 id) external {
        Oath storage oath = oaths[id];
        require(block.timestamp >= oath.expiry, "Cannot settle before expiry");
        require(
            oath.status != Status.Settled &&
            oath.status != Status.Refunded &&
            oath.status != Status.Approved,
            "Oath already settled, refunded, or approved"
        );

        if (oath.status == Status.Shipped || oath.status == Status.Disputed) {
            oath.status = Status.Settled;
            usdcToken.safeTransfer(oath.seller, oath.amount);
            emit SettledToSeller(id);

            _attest(
                SCHEMA_SETTLEMENT_EXECUTED,
                oath.seller,
                oathUID[id],
                abi.encode(id, oath.seller, uint8(1), "")
            );
        } else if (oath.status == Status.Created) {
            oath.status = Status.Refunded;
            usdcToken.safeTransfer(oath.buyer, oath.amount);
            emit RefundedToBuyer(id);

            _attest(
                SCHEMA_SETTLEMENT_EXECUTED,
                oath.buyer,
                oathUID[id],
                abi.encode(id, oath.buyer, uint8(2), "")
            );
        } else {
            revert("Invalid state for settlement");
        }
    }
}