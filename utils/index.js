const hre = require("hardhat");

const gcf = hre.ethers.getContractFactory;
const dp = hre.upgrades.deployProxy;
const pEth = hre.ethers.parseEther;
const dc = hre.ethers.deployContract;

function getRole(role) {
  return hre.ethers.keccak256(hre.ethers.toUtf8Bytes(role));
}

async function ex(contract, command, args, messageWhenFailed) {
  try {
    var tx = await contract[command](...args);
    return await tx.wait();
  } catch (e) {
    console.error(messageWhenFailed, e);
  }
}

async function verify(implementation, contractName, arguments = []) {
  if (!process.env.HARDHAT_NETWORK) return;
  try {
    await hre.run("verify:verify", {
      address: implementation,
      constructorArguments: [...arguments],
    });
  } catch (e) {
    if (e.message.includes("Contract source code already verified"))
      console.log(`${contractName} is verified already`);
    else console.error(`Error veryfing - ${contractName}`, e);
  }
}

async function printAddress(contractName, proxyAddress) {
  console.log(`${contractName} Proxy Address: ${proxyAddress}`);
  var implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log(`${contractName} Impl Address: ${implementationAddress}`);
  return implementationAddress;
}

async function deploySC(contractName, args = []) {
  var smartContract = await gcf(contractName);
  var proxyContract = await dp(smartContract, [...args], {
    kind: "uups",
  });
  if (process.env.HARDHAT_NETWORK) {
    // true cuando se usa '--network matic' en el script de deployment
    var tx = await proxyContract.waitForDeployment();
    await tx.deploymentTransaction().wait(5);
  }
  return proxyContract;
}

async function deploySCNoUp(contractName, args = []) {
  var smartContract = await dc(contractName, [...args]);

  // true cuando se usa '--network matic' en el script de deployment
  if (process.env.HARDHAT_NETWORK) {
    var res = await smartContract.waitForDeployment();
    await res.deploymentTransaction().wait(5);

    console.log(`${contractName} - Imp: ${await smartContract.getAddress()}`);
  }
  return smartContract;
}

module.exports = {
  ex,
  verify,
  getRole,
  printAddress,
  deploySC,
  deploySCNoUp,
  pEth,
};
