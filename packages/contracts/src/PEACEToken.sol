// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PEACEToken
 * @notice Soulbound, non-transferable civic identity token representing 51% local voting veto power.
 * @dev Reverts on all standard ERC20 transfer operations to enforce permanent, self-sovereign bonding.
 * Dual-Class Token Matrix - Fulfills TPNS LPA Section 4.2.
 */
contract PEACEToken {
    // --- Custom Errors ---
    error SoulboundTokenNonTransferable();
    error UnauthorizedMinterOnly();
    error UnauthorizedBurnerOnly();

    // --- State Variables ---
    string public constant name = "TPNS PEACE Civic Token";
    string public constant symbol = "PEACE";
    uint8 public constant decimals = 18;
    
    uint256 public totalSupply;
    address public immutable communityTrust;

    mapping(address => uint256) public balanceOf;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Minted(address indexed citizen, uint256 amount);
    event Revoked(address indexed citizen, uint256 amount);

    // --- Modifier ---
    modifier onlyCommunityTrust() {
        if (msg.sender != communityTrust) {
            revert UnauthorizedMinterOnly();
        }
        _;
    }

    /**
     * @notice Constructor sets the localized Perpetual Purpose Trust (PPT) as the sole controller.
     * @param _communityTrust The address of the Perpetual Purpose Trust or localized NGO.
     */
    constructor(address _communityTrust) {
        require(_communityTrust != address(0), "Invalid trust address");
        communityTrust = _communityTrust;
    }

    /**
     * @notice Mints a new soulbound civic token to a verified resident.
     * @param _citizen The address of the verified resident.
     * @param _amount The civic token allocation (typically 1.0 * 10^18 representing 1 personhood vote).
     */
    function mint(address _citizen, uint256 _amount) external onlyCommunityTrust {
        require(_citizen != address(0), "Cannot mint to zero address");
        balanceOf[_citizen] += _amount;
        totalSupply += _amount;
        emit Minted(_citizen, _amount);
        emit Transfer(address(0), _citizen, _amount);
    }

    /**
     * @notice Revokes/burns the civic token if a resident departs the enclave (right-of-exit execution).
     * @param _citizen The address of the resident.
     * @param _amount The amount to burn.
     */
    function burn(address _citizen, uint256 _amount) external onlyCommunityTrust {
        if (balanceOf[_citizen] < _amount) {
            revert UnauthorizedBurnerOnly();
        }
        balanceOf[_citizen] -= _amount;
        totalSupply -= _amount;
        emit Revoked(_citizen, _amount);
        emit Transfer(_citizen, address(0), _amount);
    }

    // --- Standard ERC20 Transfer Overrides (Enforcing Soulbound Behavior) ---

    function transfer(address, uint256) external pure returns (bool) {
        revert SoulboundTokenNonTransferable();
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert SoulboundTokenNonTransferable();
    }

    function approve(address, uint256) external pure returns (bool) {
        revert SoulboundTokenNonTransferable();
    }

    function allowance(address, address) external pure returns (uint256) {
        return 0;
    }
}
