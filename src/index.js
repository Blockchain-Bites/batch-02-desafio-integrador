import { Contract, ethers } from "ethers";

import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
// import bbitesTokenAbi
// import publicSaleAbi
// import nftTknAbi

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer/";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";
var Buffer = buffer.Buffer;
var merkleTree;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() {
  var elementosHasheados;
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });
}

var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress = "";
  bbitesTknAdd = "";
  pubSContractAdd = "";

  usdcTkContract; // = new Contract(...
  bbitesTknContract; // = new Contract(...
  pubSContract; // = new Contract(...
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = "";

  nftContract; // = new Contract(...
}

function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  var walletIdEl = document.getElementById("walletId");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);
      walletIdEl.innerHTML = account;
      signer = await provider.getSigner(account);
    }
  });

  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await usdcTkContract.balanceOf(account);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf

  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttn = document.getElementById("approveButtonBBTkn");

  // APPROVE USDC
  // usdcTkContract.approve
  var bttn = document.getElementById("approveButtonUSDC");

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");

  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");

  // send Ether
  var bttn = document.getElementById("sendEtherButton");

  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");

  // getProofs
  var bttn = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {
    var id;
    var address;
    var proofs = merkleTree.getHexProof(hashToken(id, address));
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  // usar ethers.hexlify porque es un array de bytes
  // var proofs = document.getElementById("whiteListToInputProofsId").value;
  // proofs = JSON.parse(proofs).map(ethers.hexlify);

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
}

function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
  // pubSContract - "PurchaseNftWithId"

  var bbitesListEl = document.getElementById("bbitesTList");
  // bbitesCListener - "Transfer"

  var nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"

  var burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  initSCsGoerli();

  // initSCsMumbai

  // setUpListeners

  // setUpEventsContracts

  // buildMerkleTree
}

setUp()
  .then()
  .catch((e) => console.log(e));
