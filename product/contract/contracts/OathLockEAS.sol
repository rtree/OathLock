// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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

    event OathCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount, uint256 expiry);
    event SellerShipped(uint256 indexed id, bytes32 trackingHash);
    event BuyerApproved(uint256 indexed id);
    event BuyerDisputed(uint256 indexed id, string evidenceURL);
    event SettledToSeller(uint256 indexed id);
    event RefundedToBuyer(uint256 indexed id);

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
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
    }

    function buyerApprove(uint256 id) external {
        Oath storage oath = oaths[id];
        require(msg.sender == oath.buyer, "Only buyer can approve");
        require(oath.status == Status.Shipped, "Oath not in shipped state");

        oath.status = Status.Approved;
        usdcToken.safeTransfer(oath.seller, oath.amount);

        emit BuyerApproved(id);
    }

    function buyerDispute(uint256 id, string calldata evidenceURL) external {
        Oath storage oath = oaths[id];
        require(msg.sender == oath.buyer, "Only buyer can dispute");
        require(oath.status == Status.Shipped, "Oath not in shipped state");
        require(bytes(evidenceURL).length > 0, "Evidence URL cannot be empty");
        require(bytes(oath.evidenceURL).length == 0, "Dispute already filed");

        oath.status = Status.Disputed;
        oath.evidenceURL = evidenceURL;

        emit BuyerDisputed(id, evidenceURL);
    }

    function settle(uint256 id) external {
        Oath storage oath = oaths[id];
        require(block.timestamp >= oath.expiry, "Cannot settle before expiry");
        require(oath.status != Status.Settled && oath.status != Status.Refunded && oath.status != Status.Approved, "Oath already settled, refunded, or approved");

        if (oath.status == Status.Shipped || oath.status == Status.Disputed) {
            oath.status = Status.Settled;
            usdcToken.safeTransfer(oath.seller, oath.amount);
            emit SettledToSeller(id);
        } else if (oath.status == Status.Created) {
            oath.status = Status.Refunded;
            usdcToken.safeTransfer(oath.buyer, oath.amount);
            emit RefundedToBuyer(id);
        } else {
            revert("Invalid state for settlement");
        }
    }
}