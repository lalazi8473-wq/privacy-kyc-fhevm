import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying KYCVerification contract to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  const KYCVerification = await ethers.getContractFactory("KYCVerification");
  console.log("⏳ Deploying contract...");
  
  const kycContract = await KYCVerification.deploy();
  await kycContract.waitForDeployment();
  
  const contractAddress = await kycContract.getAddress();
  
  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\n📋 Next steps:");
  console.log("1. Update NEXT_PUBLIC_CONTRACT_ADDRESS in packages/nextjs-showcase/.env.local");
  console.log("2. Verify contract (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

