// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UCCRegistry (UCC Article 12 Controllable Electronic Records Anchor)
 * @author Promethean Council of Stewards
 * 
 * @notice Bridges on-chain fractionalized asset tokens with physical Real-World Assets (RWAs)
 * by recording state-certified UCC-1 financing statement hashes and Article 12 Control Assertions.
 * Whosoever holds cryptographic control of the private keys governing these tokens holds
 * legally defensible property title under UNCITRAL MLETR and US UCC Article 12.
 */
contract UCCRegistry {
    
    struct ControllableRecord {
        uint256 tokenId;
        string physicalAssetDescription;
        string legalWrapperCID; // IPFS CID to Wyoming/Delaware Series LLC documents
        string uccFilingHash;   // Hash of State Secretary UCC-1 certified filing
        string stateReceiptUrl; // PDF receipt URL from Secretary of State
        bytes32 controlSignatureHash; // Proof of current Article 12 "Control" transfer
        address owner;
        uint256 lastUpdated;
    }

    // Mapping from unique token ID to its UCC legal metadata
    mapping(uint256 => ControllableRecord) public registry;
    
    // Mapping to check if a specific UCC-1 Filing is already registered
    mapping(string => bool) public registeredFilings;

    address public governanceAuthority;

    event AssetRegistered(
        uint256 indexed tokenId, 
        string uccFilingHash, 
        address indexed owner
    );

    event ControlTransferred(
        uint256 indexed tokenId, 
        address indexed oldOwner, 
        address indexed newOwner, 
        bytes32 newControlHash
    );

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "UCCRegistry: Only governance consensus can invoke");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @dev Sets the governing authority (e.g., Wyoming DUNA Multi-Sig or on-chain governance address).
     */
    function setGovernanceAuthority(address _newAuth) external onlyGovernance {
        require(_newAuth != address(0), "UCCRegistry: Invalid authority address");
        governanceAuthority = _newAuth;
    }

    /**
     * @dev Registers a physical asset under UCC Article 12 CER standard.
     */
    function registerAsset(
        uint256 _tokenId,
        string calldata _physicalAssetDescription,
        string calldata _legalWrapperCID,
        string calldata _uccFilingHash,
        string calldata _stateReceiptUrl,
        bytes32 _controlSignatureHash,
        address _initialOwner
    ) external onlyGovernance {
        require(registry[_tokenId].tokenId == 0, "UCCRegistry: Token ID already registered");
        require(!registeredFilings[_uccFilingHash], "UCCRegistry: UCC-1 Filing already linked");

        registry[_tokenId] = ControllableRecord({
            tokenId: _tokenId,
            physicalAssetDescription: _physicalAssetDescription,
            legalWrapperCID: _legalWrapperCID,
            uccFilingHash: _uccFilingHash,
            stateReceiptUrl: _stateReceiptUrl,
            controlSignatureHash: _controlSignatureHash,
            owner: _initialOwner,
            lastUpdated: block.timestamp
        });

        registeredFilings[_uccFilingHash] = true;

        emit AssetRegistered(_tokenId, _uccFilingHash, _initialOwner);
    }

    /**
     * @dev Transfers legal "Control" and property title of the CER under UCC § 12-105.
     */
    function transferControl(
        uint256 _tokenId,
        address _newOwner,
        bytes32 _newControlSignatureHash
    ) external {
        ControllableRecord storage record = registry[_tokenId];
        require(record.tokenId != 0, "UCCRegistry: Asset does not exist");
        require(msg.sender == record.owner || msg.sender == governanceAuthority, "UCCRegistry: Caller is not the current owner or authority");
        require(_newOwner != address(0), "UCCRegistry: Invalid target owner");

        address oldOwner = record.owner;
        record.owner = _newOwner;
        record.controlSignatureHash = _newControlSignatureHash;
        record.lastUpdated = block.timestamp;

        emit ControlTransferred(_tokenId, oldOwner, _newOwner, _newControlSignatureHash);
    }

    /**
     * @dev Helper function to retrieve complete legal metadata of an asset for court verification.
     */
    function getAssetLegalMetadata(uint256 _tokenId) external view returns (ControllableRecord memory) {
        require(registry[_tokenId].tokenId != 0, "UCCRegistry: Asset does not exist");
        return registry[_tokenId];
    }
}
