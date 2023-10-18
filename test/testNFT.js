const { expect } = require("chai");

//npx hardhat test test/testNFT.js

describe("Upgradeable CuyCollectionNft", () => {
  var CuyCollectionNft;

  describe("Set Up", () => {
    it("Publicando el contarto inteligentes", async () => {
        CuyCollectionNft = await hre.ethers.getContractFactory("CuyCollectionNft");
        CuyCollectionNft = await hre.upgrades.deployProxy(CuyCollectionNft, {kind: "uups",});

        var implementationAddress =
        await hre.upgrades.erc1967.getImplementationAddress(
            CuyCollectionNft.target
        );

        console.log(`El address del Proxy es ${CuyCollectionNft.target}`);
        console.log(`El address de Implementation es ${implementationAddress}`);
      

    });
  });
});