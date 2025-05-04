// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SchoolLibrary
 * @dev Smart contract for a school library with restricted upload permissions
 * @notice This contract maintains the same ABI as StudyMarketplace for compatibility
 */
contract SchoolLibrary {
    // Struct to represent a study material
    struct StudyMaterial {
        uint256 id;
        address payable owner;
        string title;
        string description;
        string category;
        string contentHash; // IPFS hash of the content
        string previewHash; // IPFS hash of the preview (if any)
        uint256 price;
        bool isActive;
        uint256 createdAt;
    }

    // Struct to track purchases
    struct Purchase {
        uint256 materialId;
        address buyer;
        uint256 purchaseDate;
    }

    // Counter for material IDs
    uint256 private _materialIdCounter;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 public platformFeePercent = 250; // 2.5%
    
    // Platform fee recipient address (contract owner/school library admin)
    address payable public platformFeeRecipient;
    
    // Mapping from material ID to StudyMaterial
    mapping(uint256 => StudyMaterial) public materials;
    
    // Mapping from user address to array of owned material IDs
    mapping(address => uint256[]) public ownedMaterials;
    
    // Mapping from user address to array of purchased material IDs
    mapping(address => uint256[]) public purchasedMaterials;
    
    // Mapping to track if a user has purchased a specific material
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    
    // Array of all material IDs
    uint256[] public allMaterialIds;
    
    // Events
    event MaterialListed(uint256 indexed id, address indexed owner, string title, uint256 price);
    event MaterialPurchased(uint256 indexed id, address indexed buyer, address indexed seller, uint256 price);
    event MaterialUpdated(uint256 indexed id, string title, string description, uint256 price);
    event MaterialRemoved(uint256 indexed id);
    
    /**
     * @dev Constructor sets the platform fee recipient (owner)
     */
    constructor(address payable _platformFeeRecipient) {
        platformFeeRecipient = _platformFeeRecipient;
        _materialIdCounter = 1;
    }
    
    /**
     * @dev List a new study material - restricted to contract owner
     */
    function listMaterial(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _contentHash,
        string memory _previewHash,
        uint256 _price
    ) external returns (uint256) {
        // Only allow contract owner (school library admin) to list materials
        require(msg.sender == platformFeeRecipient, "Only school library admin can upload materials");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_contentHash).length > 0, "Content hash cannot be empty");
        
        uint256 materialId = _materialIdCounter;
        _materialIdCounter++;
        
        materials[materialId] = StudyMaterial({
            id: materialId,
            owner: payable(platformFeeRecipient), // Always set owner to admin
            title: _title,
            description: _description,
            category: _category,
            contentHash: _contentHash,
            previewHash: _previewHash,
            price: _price,
            isActive: true,
            createdAt: block.timestamp
        });
        
        ownedMaterials[platformFeeRecipient].push(materialId);
        allMaterialIds.push(materialId);
        
        emit MaterialListed(materialId, platformFeeRecipient, _title, _price);
        
        return materialId;
    }
    
    /**
     * @dev Purchase a study material
     */
    function purchaseMaterial(uint256 _materialId) external payable {
        StudyMaterial storage material = materials[_materialId];
        
        require(material.isActive, "Material is not active");
        require(msg.sender != material.owner, "Cannot purchase your own material");
        require(!hasPurchased[msg.sender][_materialId], "Already purchased this material");
        
        // If the material is free (price = 0), allow direct access without payment
        if (material.price == 0) {
            // Record free access
            purchasedMaterials[msg.sender].push(_materialId);
            hasPurchased[msg.sender][_materialId] = true;
            
            emit MaterialPurchased(_materialId, msg.sender, material.owner, 0);
            return;
        }
        
        // For paid content
        require(msg.value >= material.price, "Insufficient payment");
        
        // Calculate platform fee - in this case, the entire payment goes to the school library
        uint256 platformFee = material.price;
        
        // Direct transfer to platform fee recipient (school library)
        (bool platformFeeSent, ) = platformFeeRecipient.call{value: platformFee}("");
        require(platformFeeSent, "Failed to send payment to school library");
        
        // Refund excess payment
        if (msg.value > material.price) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - material.price}("");
            require(refundSent, "Failed to send refund");
        }
        
        // Record purchase
        purchasedMaterials[msg.sender].push(_materialId);
        hasPurchased[msg.sender][_materialId] = true;
        
        emit MaterialPurchased(_materialId, msg.sender, material.owner, material.price);
    }
    
    /**
     * @dev Update a study material's details - restricted to contract owner
     */
    function updateMaterial(
        uint256 _materialId,
        string memory _title,
        string memory _description,
        uint256 _price
    ) external {
        StudyMaterial storage material = materials[_materialId];
        
        // Only allow contract owner to update materials
        require(msg.sender == platformFeeRecipient, "Only school library admin can update materials");
        require(material.isActive, "Material is not active");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        material.title = _title;
        material.description = _description;
        material.price = _price;
        
        emit MaterialUpdated(_materialId, _title, _description, _price);
    }
    
    /**
     * @dev Remove a study material from the library - restricted to contract owner
     */
    function removeMaterial(uint256 _materialId) external {
        StudyMaterial storage material = materials[_materialId];
        
        // Only allow contract owner to remove materials
        require(msg.sender == platformFeeRecipient, "Only school library admin can remove materials");
        require(material.isActive, "Material is already inactive");
        
        material.isActive = false;
        
        emit MaterialRemoved(_materialId);
    }
    
    /**
     * @dev Update platform fee percentage (only owner)
     */
    function updatePlatformFee(uint256 _newFeePercent) external {
        require(msg.sender == platformFeeRecipient, "Only school library admin can update fee");
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%");
        
        platformFeePercent = _newFeePercent;
    }
    
    /**
     * @dev Get all materials owned by the caller
     */
    function getMyListedMaterials() external view returns (uint256[] memory) {
        return ownedMaterials[msg.sender];
    }
    
    /**
     * @dev Get all materials purchased by the caller
     */
    function getMyPurchasedMaterials() external view returns (uint256[] memory) {
        return purchasedMaterials[msg.sender];
    }
    
    /**
     * @dev Get material details by ID
     */
    function getMaterialDetails(uint256 _materialId) external view returns (
        uint256 id,
        address owner,
        string memory title,
        string memory description,
        string memory category,
        string memory previewHash,
        uint256 price,
        bool isActive,
        uint256 createdAt
    ) {
        StudyMaterial storage material = materials[_materialId];
        return (
            material.id,
            material.owner,
            material.title,
            material.description,
            material.category,
            material.previewHash,
            material.price,
            material.isActive,
            material.createdAt
        );
    }
    
    /**
     * @dev Get content hash (only available to owner or purchaser)
     */
    function getContentHash(uint256 _materialId) external view returns (string memory) {
        require(
            msg.sender == platformFeeRecipient || hasPurchased[msg.sender][_materialId],
            "Only school library admin or purchaser can access content"
        );
        
        return materials[_materialId].contentHash;
    }
    
    /**
     * @dev Get total number of materials
     */
    function getTotalMaterials() external view returns (uint256) {
        return allMaterialIds.length;
    }
    
    /**
     * @dev Get all active material IDs with pagination
     */
    function getActiveMaterials(uint256 _offset, uint256 _limit) external view returns (uint256[] memory) {
        uint256 totalMaterials = allMaterialIds.length;
        
        if (_offset >= totalMaterials) {
            return new uint256[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > totalMaterials) {
            end = totalMaterials;
        }
        
        uint256 resultCount = end - _offset;
        uint256[] memory result = new uint256[](resultCount);
        
        uint256 resultIndex = 0;
        for (uint256 i = _offset; i < end; i++) {
            uint256 materialId = allMaterialIds[i];
            if (materials[materialId].isActive) {
                result[resultIndex] = materialId;
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get contract address
     * @return The address of this contract
     */
    function getContractAddress() external view returns (address) {
        return address(this);
    }
    
    /**
     * @dev Get contract version information
     * @return version The current version of the contract
     * @return abiCompatible Whether the current ABI is compatible
     */
    function getContractVersion() external pure returns (string memory version, bool abiCompatible) {
        return ("1.0.0", true);
    }
    
    /**
     * @dev Get material basic information
     * @param _materialId The ID of the material to get information for
     * @return title The title of the material
     * @return category The category of the material
     * @return owner The address of the material owner
     * @return exists Whether the material exists and is active
     */
    function getMaterialBasicInfo(uint256 _materialId) external view returns (
        string memory title,
        string memory category,
        address owner,
        bool exists
    ) {
        StudyMaterial storage material = materials[_materialId];
        bool materialExists = material.id == _materialId && material.isActive;
        
        return (
            material.title,
            material.category,
            material.owner,
            materialExists
        );
    }
    
    /**
     * @dev Check if an address is authorized to upload materials
     * @param _address The address to check
     * @return True if address is authorized (only the owner), false otherwise
     */
    function isApprovedCreator(address _address) external view returns (bool) {
        return _address == platformFeeRecipient;
    }
} 