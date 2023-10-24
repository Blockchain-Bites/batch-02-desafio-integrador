// npx hardhat test test/testPublicSales.js
var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");


const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const { getSigner } = require("@openzeppelin/hardhat-upgrades/dist/utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;

describe("Pruebas Public Sales", function () {

      async function loadPublicSales() {
        var { BitesToken, alice, implementationAddress } = await loadFixture(loadBBTK);

        // consultar una lista de signers de prueba
        // estos signers se pueden convertir en msg.sender en el contrato
        var [owner] = await ethers.getSigners();
    
        // creando una referencia del contrato inteligente
        var PublicSale = await ethers.getContractFactory("PublicSale");
        var bbtkAdd = "0x9D0811F7753e6fB442c57d54A4E82E8Fb406a0dB";
        var usdCoin = "0xEfB83Efa68177627E1191c2391A9E04cF9B4fe59";
        var router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        
        //Creando proxy del contrato
        publicSale = await hre.upgrades.deployProxy(PublicSale, [implementationAddress,usdCoin,router],
         {initializer: 'initialize',
          kind: "uups",
        });
    
        return { publicSale, owner};
      }

      async function loadBBTK() {

        // consultar una lista de signers de prueba
        // estos signers se pueden convertir en msg.sender en el contrato
        var [alice] = await ethers.getSigners();
    
        // creando una referencia del contrato inteligente
        var BitesToken = await ethers.getContractFactory("BitesToken");
    
        //Creando proxy del contrato
        BitesToken = await hre.upgrades.deployProxy(BitesToken, {
          kind: "uups",
        });

        //
        var implementationAddress =
        await hre.upgrades.erc1967.getImplementationAddress(
          BitesToken.target
        );

        BitesToken.grantRole("MINTER_ROLE", alice.address)
    
        return { BitesToken, alice, implementationAddress};
      }

      async function loadUSDC() {
        // consultar una lista de signers de prueba
        // estos signers se pueden convertir en msg.sender en el contrato
        var [bob] = await ethers.getSigners();
    
        // creando una referencia del contrato inteligente
        var USDCoin = await ethers.getContractFactory("USDCoin");
    
        var usdCoin = await USDCoin.deploy();

        usdCoin.grantRole("MINTER_ROLE", bob.address)
    
        return { usdCoin, bob};
      }

    //BBTKN & USDC
    describe ("Desplegar y probar mint de BBTKN y USDC", () => {
    
      it("Se publicó sin errores BBTK y mintea un MINTER_ROLE", async () => {
          var { BitesToken, alice } = await loadFixture(loadBBTK);
          var amount = 10000;
    
          await BitesToken.connect(alice);
                
          var tx = await BitesToken.mint(await alice.getAddress(), amount);
    
          await expect(tx).changeTokenBalance(BitesToken, await alice.getAddress(),
              amount
            );
                
        });
    
      it("Se publicó sin errores USDC y mintea un MINTER_ROLE", async () => {
          var { usdCoin, bob } = await loadFixture(loadUSDC);
          var amount = 10000;
                
          var tx = await usdCoin.mint(await bob.getAddress(), amount);
    
          await expect(tx).changeTokenBalance(usdCoin, await bob.getAddress(),
              amount
            );
                
        });
    
    });

    //Consultar Precios
    describe("Consultar Precios", function () {

      it("Consultar precio ID {1}", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        
        var id = 1;
        var value = await publicSale.getPriceForId(id);

        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

       it("Consultar precio ID {200}", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        
        var id = 200;
        var value = await publicSale.getPriceForId(id);

        
        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

       it("Consultar precio ID {500}", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        
        var id = 500;
        var value = await publicSale.getPriceForId(id);

        
        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

       it("Consultar precio ID {500} Fecha 2 de Octubre", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        var id = 500;
        var value = await publicSale.getPriceForId(id);

        
        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

       it("Consultar precio ID {500} Fecha 4 de Octubre", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        
        var id = 500;
        var value = await publicSale.getPriceForId(id);

        
        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

       it("Consultar precio ID {500} Fecha 6 de Octubre", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);           
        
        var id = 500;
        var value = await publicSale.getPriceForId(id);

        
        expect(await publicSale.getPriceForId(id)).to.be.equal(value);
       
       });

    });

    //Comprar con BBTKN
    describe("Prueba Comprar con BBTKN", function () {

        it("Compra Correcta purchaseWithTokens BBTKM", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);  
        var { BitesToken, alice } = await loadFixture(loadBBTK);
            
        //Mintear BBTKN
        var amount = 10000;

        await BitesToken.mint(await alice.getAddress(), amount);
            
        var id = 1;
             
        expect(publicSale.connect(alice).purchaseWithTokens(id)).to.emit(publicSale, "PurchaseNftWithId").withArgs(await alice.getAddress(), id);
           
        });

        it("Comprando con ID Fuera de Rango BBTKN", async () => {
          var { publicSale, owner } = await loadFixture(loadPublicSales);  
          var { BitesToken, alice } = await loadFixture(loadBBTK);
              
          //Mintear BBTKN
          var amount = 10000;
  
          await BitesToken.mint(await alice.getAddress(), amount);
              
          var id = 2001;
              
          //expect(await publicSale.getPriceForId(id)).to.be.equal(1000000000000000000000);
          //expect(await publicSale.purchaseWithTokens(id))
              
          expect(publicSale.connect(alice).purchaseWithTokens(id)).to.be.revertedWith('ID Fuera de Rango Permitido');
             
        });

        it("Comprando con ID ya minteado BBTKN", async () => {
          var { publicSale, owner } = await loadFixture(loadPublicSales);  
          var { BitesToken, alice } = await loadFixture(loadBBTK);
          var [bob] = await ethers.getSigners();

          //Mintear BBTKN
          var amount = 10000;
          var sendAmount = 5000;
          var id = 1;
          
          //Alice Transfiere BBTK a bob para que comre
          await BitesToken.mint(await alice.getAddress(), amount);

          await publicSale.connect(alice).purchaseWithTokens(id);
          var tx = await publicSale.connect(bob).purchaseWithTokens(id);
        
          expect(tx).to.be.revertedWith('Este NFT ya se ha minteado');
             
        });

        it("Sin saldo Suficientes de BBTKN", async () => {
          var { publicSale, owner } = await loadFixture(loadPublicSales);  
          var { BitesToken, alice } = await loadFixture(loadBBTK);
          var [bob] = await ethers.getSigners();

          //Mintear BBTKN
          var amount = 999;
          var id = 1;
          
          //Alice Transfiere BBTK a bob para que comre
          await BitesToken.mint(await alice.getAddress(), amount);

          
          var tx = await publicSale.connect(alice).purchaseWithTokens(id);
        
          expect(tx).to.be.revertedWith('No tienes suficientes BBTKN para Comprar');
             
        });
        
    });

    //Comprar con USDC
    
    describe("Prueba Comprar con USDC", function () {

      it("Disparar Evento PurchaseNftWithId BBTKM", async () => {
      var { publicSale, owner } = await loadFixture(loadPublicSales);  
      var { UsdCoin, bob } = await loadFixture(loadBBTK);
          
      //Mintear BBTKN
      var amount = 10000;

      await BitesToken.mint(await alice.getAddress(), amount);
          
      var id = 1;
           
      expect(publicSale.connect(alice).purchaseWithTokens(id)).to.emit(publicSale, "PurchaseNftWithId").withArgs(await alice.getAddress(), id);
         
      });
      /*
      it("Comprando con ID Fuera de Rango BBTKN", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);  
        var { UsdCoin, bob } = await loadFixture(loadBBTK);
            
        //Mintear BBTKN
        var amount = 10000;

        await BitesToken.mint(await alice.getAddress(), amount);
            
        var id = 2001;
            
        //expect(await publicSale.getPriceForId(id)).to.be.equal(1000000000000000000000);
        //expect(await publicSale.purchaseWithTokens(id))
            
        expect(publicSale.connect(alice).purchaseWithTokens(id)).to.be.revertedWith('ID Fuera de Rango Permitido');
           
      });

      it("Comprando con ID ya minteado BBTKN", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);  
        var { UsdCoin, bob } = await loadFixture(loadBBTK);
        var [bob] = await ethers.getSigners();

        //Mintear BBTKN
        var amount = 10000;
        var sendAmount = 5000;
        var id = 1;
        
        //Alice Transfiere BBTK a bob para que comre
        await BitesToken.mint(await alice.getAddress(), amount);

        await publicSale.connect(alice).purchaseWithTokens(id);
        var tx = await publicSale.connect(bob).purchaseWithTokens(id);
      
        expect(tx).to.be.revertedWith('Este NFT ya se ha minteado');
           
      });

      it("Sin saldo Suficientes de BBTKN", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);  
        var { UsdCoin, bob } = await loadFixture(loadBBTK);
        var [bob] = await ethers.getSigners();

        //Mintear BBTKN
        var amount = 999;
        var id = 1;
        
        //Alice Transfiere BBTK a bob para que comre
        await BitesToken.mint(await alice.getAddress(), amount);

        
        var tx = await publicSale.connect(alice).purchaseWithTokens(id);
      
        expect(tx).to.be.revertedWith('No tienes suficientes BBTKN para Comprar');
           
      });*/
      
    });

    //Comprar con Ether
    describe("Prueba Comprar con Ether", function () {

      it("Compra Correcta purchaseWithEtherAndId ETH", async () => {
      var { publicSale, owner } = await loadFixture(loadPublicSales);  
      var [bob] = await ethers.getSigners();

      var valueETH = ethers.parseEther("0.01");;
      var id = 700;

      var tx = await publicSale.connect(bob).purchaseWithEtherAndId(id,{value: valueETH,});
      
      expect(tx).to.emit(publicSale, "PurchaseNftWithId").withArgs(await bob.getAddress(), id);
         
      });

      it("Id Fuera de Rango purchaseWithEtherAndId ETH", async () => {
      var { publicSale, owner } = await loadFixture(loadPublicSales);  
      var [bob] = await ethers.getSigners();

      var valueETH = ethers.parseEther("0.01");;
      var id = 698;
      
      await expect(publicSale.connect(bob).purchaseWithEtherAndId(id,{value: valueETH,})).to.be.revertedWith("ID Fuera de Rango Permitido");
         
      });
      
      it("Comprando con ID ya minteado purchaseWithEtherAndId ETH", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);
        var { BitesToken, alice } = await loadFixture(loadBBTK);
        var [bob] = await ethers.getSigners();

        var valueETH = ethers.parseEther("0.01");;
        var id = 700;

        await publicSale.connect(alice).purchaseWithEtherAndId(id);
        var tx = await publicSale.connect(bob).purchaseWithEtherAndId(id);
      
        expect(tx).to.be.revertedWith('Este NFT ya se ha minteado');
           
      });

      it("Compra Correcta depositEthForARandomNft ETH", async () => {
        var { publicSale, owner } = await loadFixture(loadPublicSales);  
        var [bob] = await ethers.getSigners();
  
        var valueETH = ethers.parseEther("0.01");;
  
        var tx = await publicSale.connect(bob).depositEthForARandomNft({value: valueETH,});
        
        expect(tx).to.emit(publicSale, "PurchaseNftWithId");
           
        });

    });

});
