var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers, network } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

//npx hardhat test test/testNFT.js

describe("Upgradeable CuyCollectionNft", () => {

  async function loadCuyCollectio() {
    // consultar una lista de signers de prueba
    // estos signers se pueden convertir en msg.sender en el contrato
    var [owner, alice, bob, carl] = await ethers.getSigners();

    // creando una referencia del contrato inteligente
    var CuyCollectionNft = await ethers.getContractFactory("CuyCollection");

    //Creando proxy del contrato
    CuyCollectionNft = await hre.upgrades.deployProxy(CuyCollectionNft, {
      kind: "uups",
    });

    return { CuyCollectionNft, owner, alice, bob, carl };
  }

  describe("Testeando Contrato NFT", () => {

    it("Mintear con ID disponible", async () => {
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      
      var address = owner.getAddress();
      var id = 1;

      await CuyCollectionNft.connect(owner);
      
      await CuyCollectionNft.safeMint(address, id);

      expect(await CuyCollectionNft.balanceOf(address)).to.be.equal(1);

    });

    it("Mintear con ID no disponible", async () => {
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      
      var address = owner.getAddress();
      var id = 1;

      var addressAlise = alice.getAddress();

      await CuyCollectionNft.connect(owner);
      
      await CuyCollectionNft.safeMint(address, id);

      await CuyCollectionNft.connect(alice);

      await expect(CuyCollectionNft.safeMint(addressAlise, id)).to.be.revertedWith("ID no Disponible");

    });

    it("Probando con HashearInfo y Verify", async () => {
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      
      var leaf = await CuyCollectionNft.connect(owner)._hashearInfo("0x7CCF2C3630EA896A36CA1a58cc5809e2322B1074", 1003);


      expect(await CuyCollectionNft.verify(leaf, 
        [
          '0x48d7765f2d535d1bfc5f5a3e6805c47ac523986ee1d64285425c73d388a2c022',
          '0x48781e8f88ab4d1d07af285d1367732f0dcc4e6f5704640f66ea3c8d3864b713',
          '0x75ad7771622ed025954d6bc816dac7e107c82b9f3cbf83a14c7bca9aa655cff0',
          '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
          '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
          '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
          '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
          '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
          '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
          '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
        ]
        )).to.be.equal(true);

    });

    it("Mintear en WhiteList", async () => {
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      
      var id = 1003;
      var proof = 
      [
        '0x48d7765f2d535d1bfc5f5a3e6805c47ac523986ee1d64285425c73d388a2c022',
        '0x48781e8f88ab4d1d07af285d1367732f0dcc4e6f5704640f66ea3c8d3864b713',
        '0x75ad7771622ed025954d6bc816dac7e107c82b9f3cbf83a14c7bca9aa655cff0',
        '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
        '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
        '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
        '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
        '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
        '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
        '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
      ]

      var addressOwnerInWhiteList = "0x7CCF2C3630EA896A36CA1a58cc5809e2322B1074";
      var customSigner = await ethers.getSigner(addressOwnerInWhiteList);

       // Obtener la dirección de la cuenta
      var customSignerAddress = await customSigner.getAddress();

      await CuyCollectionNft.connect(customSigner);
      
      await CuyCollectionNft.safeMintWhiteList(customSignerAddress, id, proof);


      expect(await CuyCollectionNft.ownerOf(id)).to.be.equal(customSignerAddress);

    });

    it("Intentar Mintear sin estar en WhiteList", async () => {
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      
      var id = 1000;
      var proof = 
      [
        '0x48d7765f2d535d1bfc5f5a3e6805c47ac523986ee1d64285425c73d388a2c022',
        '0x48781e8f88ab4d1d07af285d1367732f0dcc4e6f5704640f66ea3c8d3864b713',
        '0x518c1b704d9c7921f348110d152e7fa3a105f62b9fb257ad2ab020f05407b088',
        '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
        '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
        '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e466f6a0ac1d918a0',
        '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
        '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
        '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
        '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
      ];

      var addressOwnerNotInWhiteList = "0x9A5b0F2B08F9853d6BD7f52f581ac63F43F9098d";

      await CuyCollectionNft.connect(owner);
      
      await expect(CuyCollectionNft.safeMintWhiteList(addressOwnerNotInWhiteList, id, proof)).to.be.revertedWith("No eres parte de la WhiteList");


    });
    /*
    it("Quemar NFT De WhiteList", async () => {
      
      var { CuyCollectionNft, owner, alice, bob, carl } = await loadFixture(loadCuyCollectio);
      var llavePrivada = "0x3d4eae5cb9baa198d0265bcb0d2b4eb6e63a341bb582e7887d7a9b22da4f95c8";
      var addressEther = "0xcfd75111058cdA410c698D1b2DB52040999f86Fd";

      //Crear Wallet
      var walllet = new ethers.Wallet(llavePrivada);

      //Añadir fondos
      await network.provider.send("hardhat_setBalance", [
        addressEther,
        "0x1000",
      ])
      
      var id = 1004;
      var proof = 
      [
        '0x58faad89202d2a25cf0ce57f183e02fd5f9f0d364fc9f03da083297f3152d9b7',
        '0x17d214de774d5cfbcd632f21586b1a2604d001661dce9cc02f8d60ec06732a24',
        '0x6da35f8db6166fafdda813c2e31b4e833795d1123359cca38afac872cddc9d1a',
        '0xa8e78c35b8fdaa5a0f307cd1d8b12dfa9d0fd99b528ade7bfcbf2b467e35cb6c',
        '0x7e6e241807eba959c7e886d66fbb24ed7eb9704acfa05c05c31ab7dd5c7d8325',
        '0x839e6099895ad99f1b5195b401d7b131744def11071dfe8e463f6a0ac1d918a0',
        '0x7da7c7f5098b4704e5564d19f6d65bc3f551112e46081cd0b70c8cfab4d0a9b0',
        '0x9a184d9a1744e8e9093ac5e65d7e96c1b609549a75d38c610f538aead2b04c58',
        '0x7bb0854a5a2a180c8416993d26910d3100cd9f9bc389fb8ac6449d3e37c467d7',
        '0x7f818777dfe171b443c8a7d57bd2d50e26850f9bd2640b905e5e0b82d205818c'
      ];

       // Obtener la dirección de la cuenta
      var customSignerAddress = await walllet.getAddress();
      console.log(walllet);
      console.log(owner)
      
      await CuyCollectionNft.connect(walllet).safeMintWhiteList("0xcfd75111058cdA410c698D1b2DB52040999f86Fd", id, proof);

      //await CuyCollectionNft.connect(customSignerAddress).transferFrom( await owner.getAddress(), customSignerAddress, id);

    });*/

    


  });
});