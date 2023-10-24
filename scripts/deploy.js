require("dotenv").config();
var { ethers } = require("hardhat");
var pEth = ethers.parseEther;

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

//const { getRootFromMT } = require("../utils/merkleTree");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Publicar NFT en Mumbai
async function deployMumbai() {
  var relAddMumbai; // relayer mumbai
  var name = "Chose a name";
  var symbol = "Chose a symbol";

  // utiliza deploySC
  // utiliza printAddress
  // utiliza ex
  // utiliza ex
  // utiliza verify

  await verify(implAdd, "CUYNFT");
}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployGoerli() {
  var relAddGoerli; // relayer goerli

  //Contrato de Tokens a publicar
  var BitesToken = "BitesToken";
  var usdcToken = "USDCoin";

  //Dirección Proxy de los conratos Actualizables
  var proxyContractBBTK = await deploySC(BitesToken);
  
  //Desplegamos contrato no actualizable
  var deployUSDC = await deploySCNoUp(usdcToken);
  var addressUSDC = await deployUSDC.getAddress();

  //Dirección de implementación de los contratos Actualizables
  var impBBTK = await printAddress(BitesToken, await proxyContractBBTK.getAddress());

  //Verificamos los contratos
  verify(impBBTK, BitesToken);
  console.log("\n");
  verify(addressUSDC, usdcToken);

  //

}

async function publicLiquidity() {
  
  //Publicamos y verificamos contrato
  var liquidityContract = "LiquidityProvider";

  var deployLiquidity = await deploySCNoUp(liquidityContract);
  var liquidityAddress = await deployLiquidity.getAddress();

  verify(liquidityAddress, liquidityContract);

}

async function addLiquidity() {
  
  var pEth = ethers.parseEther;
  var [owner] = await ethers.getSigners();
  
  var tokenAAdd = "0x9D0811F7753e6fB442c57d54A4E82E8Fb406a0dB";
  var TokenA = await ethers.getContractFactory("BitesToken");
  var tokenA = TokenA.attach(tokenAAdd);

  var tokenBAdd = "0xEfB83Efa68177627E1191c2391A9E04cF9B4fe59";
  var TokenB = await deploySC("BitesToken");
  var tokenB = TokenB.attach(tokenBAdd);

  var loquidityProviderAdd = "0xf98964C48d0B8687cF19b5e3D5e372d02DFCac62";
  var LiquidityProv = await ethers.getContractFactory("LiquidityProvider");
  var liquidityProv = LiquidityProv.attach(loquidityProviderAdd);
  
  var tx = await tokenA.connect(owner[0]).transfer(loquidityProviderAdd, pEth("1000000"));
  await tx.wait();
  
 

  var _tokenA = tokenAAdd;
  var _tokenB = tokenBAdd;
  var _amountADesired = pEth("1000000");
  var _amountBDesired = pEth("500000");
  var _amountAMin = pEth("1000000");
  var _amountBMin = pEth("500000");
  var _to = owner.address;
  var _deadline = new Date().getTime() + 60000;

  tx = await liquidityProv.addLiquidity(
    _tokenA,
    _tokenB,
    _amountADesired,
    _amountBDesired,
    _amountAMin,
    _amountBMin,
    _to,
    _deadline
  );
  var res = await tx.wait();
  console.log(`Hash de la transaction ${res.hash}`);
  /**/
}



 //deployMumbai()
 //deployGoerli()
 //publicLiquidity()
 addLiquidity()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
//npx hardhat run --network <your-network> scripts/deploy.js
//npx hardhat run --network goerli scripts/deploy.js