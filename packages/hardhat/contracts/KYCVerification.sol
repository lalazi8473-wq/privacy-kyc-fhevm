// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title KYCVerification
 * @notice Privacy-preserving KYC verification using Fully Homomorphic Encryption
 * @dev Users submit encrypted age and gender, contract verifies against rules without revealing data
 */
contract KYCVerification is ZamaEthereumConfig {
    // ==================== State Variables ====================
    
    // Encrypted user data
    mapping(address => euint32) private userAges;
    mapping(address => euint32) private userGenders;
    mapping(address => euint32) private verificationResults;
    mapping(address => bool) public hasSubmitted;
    
    // KYC Rules (plaintext for this demo, can be encrypted for more privacy)
    euint32 private minAge;           // Minimum age requirement (18)
    euint32 private requiredGender;   // Required gender (0=female, 1=male)
    
    // ==================== Events ====================
    
    event IdentitySubmitted(address indexed user, uint256 timestamp);
    event VerificationCompleted(address indexed user, uint256 timestamp);
    
    // ==================== Constructor ====================
    
    constructor() {
        // Set KYC rules: age >= 18, gender = male (1)
        minAge = FHE.asEuint32(uint32(18));
        requiredGender = FHE.asEuint32(uint32(1));
        
        // Allow contract to access these values
        FHE.allowThis(minAge);
        FHE.allowThis(requiredGender);
    }
    
    // ==================== Core Functions ====================
    
    /**
     * @notice Submit encrypted identity information for KYC verification
     * @param encryptedAge User's encrypted age
     * @param encryptedGender User's encrypted gender (0=female, 1=male)
     * @param proofAge Zero-knowledge proof for age
     * @param proofGender Zero-knowledge proof for gender
     */
    function submitIdentity(
        externalEuint32 encryptedAge,
        externalEuint32 encryptedGender,
        bytes calldata proofAge,
        bytes calldata proofGender
    ) external {
        // Convert external encrypted inputs to internal format
        euint32 age = FHE.fromExternal(encryptedAge, proofAge);
        euint32 gender = FHE.fromExternal(encryptedGender, proofGender);
        
        // Store encrypted user data
        userAges[msg.sender] = age;
        userGenders[msg.sender] = gender;
        
        // Perform FHE verification
        // Rule 1: age >= 18 (using NOT(age < 18) since gte might not be available)
        ebool ageTooYoung = FHE.lt(age, minAge);
        ebool ageValid = FHE.not(ageTooYoung);
        
        // Rule 2: gender = male (1)
        ebool genderValid = FHE.eq(gender, requiredGender);
        
        // Combine both rules (AND operation)
        ebool kycPassed = FHE.and(ageValid, genderValid);
        
        // Convert boolean result to euint32 (1=passed, 0=failed)
        euint32 one = FHE.asEuint32(uint32(1));
        euint32 zero = FHE.asEuint32(uint32(0));
        euint32 result = FHE.select(kycPassed, one, zero);
        
        // Store result
        verificationResults[msg.sender] = result;
        hasSubmitted[msg.sender] = true;
        
        // ⚠️ Critical: Double authorization
        FHE.allowThis(result);         // Contract can return handle
        FHE.allow(result, msg.sender); // User can decrypt
        
        emit IdentitySubmitted(msg.sender, block.timestamp);
        emit VerificationCompleted(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Get encrypted verification result
     * @return bytes32 Handle for encrypted result (use userDecrypt to reveal)
     */
    function getMyResult() external view returns (bytes32) {
        require(hasSubmitted[msg.sender], "No identity submitted yet");
        return FHE.toBytes32(verificationResults[msg.sender]);
    }
    
    /**
     * @notice Check if user has submitted identity
     * @param user Address to check
     * @return bool True if user has submitted
     */
    function hasUserSubmitted(address user) external view returns (bool) {
        return hasSubmitted[user];
    }
    
    // ==================== Admin Functions (Optional) ====================
    
    /**
     * @notice Update KYC rules (only for demo purposes)
     * @dev In production, consider adding access control
     */
    function updateKYCRules(uint32 newMinAge, uint32 newRequiredGender) external {
        minAge = FHE.asEuint32(newMinAge);
        requiredGender = FHE.asEuint32(newRequiredGender);
        
        FHE.allowThis(minAge);
        FHE.allowThis(requiredGender);
    }
}

