// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title MetabolicWaterfall
 * @notice Automates the 21/30/49 non-custodial financial splits for incoming platform yield.
 * @dev Fulfills Section 5.2 of the Global Operating Playbook and LPA.
 */
contract MetabolicWaterfall {
    // --- Custom Errors ---
    error AllocationMismatch();
    error TransferFailed();
    error UnauthorizedGeneralPartnerOnly();

    // --- State Variables ---
    address public immutable hostTreasury;         // 21% Host Fiscal Yield (MIDA, Regional Agencies)
    address public immutable communityWealthFund;  // 30% Localized Trust Fund for Residents
    address public immutable operationalOpEx;       // 49% Operations, Maintenance, and Investor Yield
    address public immutable generalPartner;

    // --- Events ---
    event YieldDistributed(uint256 totalAmount, uint256 hostShare, uint256 communityShare, uint256 opexShare);
    event ERC20YieldDistributed(address indexed token, uint256 totalAmount, uint256 hostShare, uint256 communityShare, uint256 opexShare);

    modifier onlyGeneralPartner() {
        if (msg.sender != generalPartner) {
            revert UnauthorizedGeneralPartnerOnly();
        }
        _;
    }

    /**
     * @notice Constructor initializes the tripartite routing destinations.
     * @param _hostTreasury The 21% Sovereign Host allocation address.
     * @param _communityWealthFund The 30% Localized Community Trust fund address.
     * @param _operationalOpEx The 49% Operations, Maintenance, and commercial Debt/Equity address.
     */
    constructor(
        address _hostTreasury,
        address _communityWealthFund,
        address _operationalOpEx
    ) {
        require(_hostTreasury != address(0), "Invalid hostTreasury");
        require(_communityWealthFund != address(0), "Invalid communityWealthFund");
        require(_operationalOpEx != address(0), "Invalid operationalOpEx");

        hostTreasury = _hostTreasury;
        communityWealthFund = _communityWealthFund;
        operationalOpEx = _operationalOpEx;
        generalPartner = msg.sender;
    }

    /**
     * @notice Fallback receive function to execute the 21/30/49 split on direct ETH transfers.
     */
    receive() external payable {
        uint256 total = msg.value;
        if (total > 0) {
            _splitETH(total);
        }
    }

    /**
     * @notice Triggers manual distribution of any accumulated ETH.
     */
    function distributeETH() external onlyGeneralPartner {
        uint256 total = address(this).balance;
        require(total > 0, "No ETH to distribute");
        _splitETH(total);
    }

    /**
     * @notice Executes the 21/30/49 split for standard stablecoin (USDC, USDT) or protocol tokens.
     * @param _token The ERC20 token address.
     */
    function distributeERC20(address _token) external {
        require(_token != address(0), "Invalid token address");
        uint256 total = IERC20(_token).balanceOf(address(this));
        require(total > 0, "No tokens to distribute");

        // Calculate precise splits (with math scaling)
        uint256 hostShare = (total * 21) / 100;
        uint256 communityShare = (total * 30) / 100;
        uint256 opexShare = total - hostShare - communityShare; // Absorbs dust/precision remainder (totaling 49%)

        // Execute ERC20 transfers
        if (!IERC20(_token).transfer(hostTreasury, hostShare)) revert TransferFailed();
        if (!IERC20(_token).transfer(communityWealthFund, communityShare)) revert TransferFailed();
        if (!IERC20(_token).transfer(operationalOpEx, opexShare)) revert TransferFailed();

        emit ERC20YieldDistributed(_token, total, hostShare, communityShare, opexShare);
    }

    /**
     * @dev Core internal split logic for native gas token (ETH/UVT).
     */
    function _splitETH(uint256 _total) internal {
        uint256 hostShare = (_total * 21) / 100;
        uint256 communityShare = (_total * 30) / 100;
        uint256 opexShare = _total - hostShare - communityShare; // Absorbs division dust (totaling 49%)

        // Execute payments
        (bool success1, ) = hostTreasury.call{value: hostShare}("");
        (bool success2, ) = communityWealthFund.call{value: communityShare}("");
        (bool success3, ) = operationalOpEx.call{value: opexShare}("");

        if (!success1 || !success2 || !success3) {
            revert TransferFailed();
        }

        emit YieldDistributed(_total, hostShare, communityShare, opexShare);
    }
}
