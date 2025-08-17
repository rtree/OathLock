// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal SchemaRegistry interface (resolver is address; set 0x0 if none)
interface ISchemaRegistry {
    function register(
        string calldata schema,
        address resolver,
        bool revocable
    ) external returns (bytes32);
}