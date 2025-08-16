// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Mock of Flow EVM stgUSDC (Bridged USDC via Stargate)
 * - Name:    "Bridged USDC (Stargate)"
 * - Symbol:  "stgUSDC"
 * - Decimals: 6 (USDC standard)
 * - Owner:   Deployer
 *
 * Real stgUSDC on Flow EVM Mainnet:
 *   0xF1815bd50389c46847f0Bda824eC8da914045D14
 *   (ref: https://developers.flow.com/ecosystem/defi-liquidity/defi-contracts)
 */

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, ERC20Permit, Ownable {
    constructor()
        ERC20("Mock Bridged USDC (Stargate)", "stgUSDC")
        ERC20Permit("stgUSDC")
        Ownable(msg.sender) // set owner to deployer
    {}

    /// @dev USDC-style 6 decimals.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint tokens (owner-only).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn your own tokens.
    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
}