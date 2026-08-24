// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YIELDToken
 * @notice Restricted ERC20 security token representing 49% of Series SPV economic equity.
 * @dev Implements strict SEC Regulation D Rule 506(c) compliance whitelisting on all transfers.
 * Dual-Class Token Matrix - Fulfills TPNS LPA Section 4.1.
 */
contract YIELDToken {
    // --- Custom Errors ---
    error TransferRestrictedByCompliance(address account);
    error UnauthorizedGeneralPartnerOnly();

    // --- State Variables ---
    string public constant name = "TPNS YIELD Asset Token";
    string public constant symbol = "YIELD";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    address public generalPartner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isWhitelisted;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event WhitelistUpdated(address indexed investor, bool status);

    // --- Modifier ---
    modifier onlyGeneralPartner() {
        if (msg.sender != generalPartner) {
            revert UnauthorizedGeneralPartnerOnly();
        }
        _;
    }

    /**
     * @notice Constructor sets the General Partner (GP) as the sole controller of compliance whitelisting.
     */
    constructor() {
        generalPartner = msg.sender;
    }

    /**
     * @notice Updates the compliance whitelist status for an investor (CPA/attestation verified).
     * @param _investor The address of the investor.
     * @param _status True to authorize, false to restrict.
     */
    function setWhitelisted(address _investor, bool _status) external onlyGeneralPartner {
        isWhitelisted[_investor] = _status;
        emit WhitelistUpdated(_investor, _status);
    }

    /**
     * @notice Mints new economic equity units to a verified, whitelisted co-investor.
     * @param _to The address of the investor.
     * @param _amount The amount to mint.
     */
    function mint(address _to, uint256 _amount) external onlyGeneralPartner {
        if (!isWhitelisted[_to]) {
            revert TransferRestrictedByCompliance(_to);
        }
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    /**
     * @notice Standard ERC20 transfer override that enforces compliance-gated checks on both sides.
     */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        if (!isWhitelisted[msg.sender]) {
            revert TransferRestrictedByCompliance(msg.sender);
        }
        if (!isWhitelisted[_to]) {
            revert TransferRestrictedByCompliance(_to);
        }
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");

        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
     * @notice Standard ERC20 transferFrom override that enforces compliance-gated checks on both sides.
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        if (!isWhitelisted[_from]) {
            revert TransferRestrictedByCompliance(_from);
        }
        if (!isWhitelisted[_to]) {
            revert TransferRestrictedByCompliance(_to);
        }
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "Insufficient allowance");

        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @notice Standard ERC20 approve function.
     */
    function approve(address _spender, uint256 _amount) external returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
}
