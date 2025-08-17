// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal EAS interface used in this repo.
interface IEAS {
    struct AttestationRequestData {
        address recipient;
        uint64  expirationTime; // 0 = no expiry
        bool    revocable;      // we use false for immutable logs
        bytes32 refUID;         // link to base order
        bytes   data;           // abi.encode(...)
        uint256 value;          // always 0 for this repo
    }

    struct AttestationRequest {
        bytes32 schema;
        AttestationRequestData data;
    }

    function attest(AttestationRequest calldata req)
        external
        payable
        returns (bytes32);
}