var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");


const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;


describe("Pruebas Tokens", () => {

  async function loadBBTK() {
    // consultar una lista de signers de prueba
    // estos signers se pueden convertir en msg.sender en el contrato
    var [owner, alice, bob, carl] = await ethers.getSigners();

    // creando una referencia del contrato inteligente
    var BitesToken = await ethers.getContractFactory("BitesToken");

    //Creando proxy del contrato
    BitesToken = await hre.upgrades.deployProxy(BitesToken, {
      kind: "uups",
    });
    
    //var [owner, alice] = await ethers.getSigners();
    //await BitesToken.mint(alice.address, 1000000000);
    //var balanceAlice = await BitesToken.balanceOf(alice.address);
    //console.log(balanceAlice);

    return { BitesToken, owner, alice, bob, carl };
  }

  async function loadUSDC() {
    // consultar una lista de signers de prueba
    // estos signers se pueden convertir en msg.sender en el contrato
    var [owner, alice, bob, carl] = await ethers.getSigners();

    // creando una referencia del contrato inteligente
    var USDCoin = await ethers.getContractFactory("USDCoin");

    var usdCoin = await USDCoin.deploy();

    return { usdCoin, owner, alice, bob, carl };
  }

  describe("Verificar Cantidad de BBTK Del Owner", () => {
    it("Se publicó sin errores y con valores correctos", async () => {
      // cargando los contratos
      var { BitesToken, owner } = await loadFixture(loadBBTK);
      
      var balanceOwner = await BitesToken.balanceOf(owner.address);
      
      console.log(balanceOwner);
      

    });
  });

  describe("Verificar Cantidad de USD Del Owner", () => {
    it("Se publicó sin errores y con valores correctos", async () => {
      
      var { usdCoin, owner } = await loadFixture(loadUSDC);
      
      var balanceOwner = await usdCoin.balanceOf(owner.address);
      
      console.log(balanceOwner);

    });
  });


});

//npx hardhat test test/testBBTK.js








describe("PublicaR", function () {});
