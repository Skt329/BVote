const hre = require("hardhat");

async function main() {
  console.log("Deploying BVote contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const BVote = await hre.ethers.getContractFactory("BVote");
  const bVote = await BVote.deploy();

  // Wait for deployment transaction to be mined
  await bVote.waitForDeployment();

  const address = await bVote.getAddress();
  console.log("BVote deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deployData = {
    address: address,
    network: hre.network.name
  };
    
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deployData, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
