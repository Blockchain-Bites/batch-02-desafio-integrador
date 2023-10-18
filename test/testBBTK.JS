const { expect } = require("chai");

describe("Upgradeable BBitesToken", () => {
  var BBitesToken, Upgradeabletoken2, upgradeabletoken, upgradeabletoken2;

  describe("Set Up", () => {
    it("Publicando el contarto inteligentes", async () => {
        BBitesToken = await hre.ethers.getContractFactory(
        "BBitesToken"
      );
      BBitesToken = await hre.upgrades.deployProxy(BBitesToken, {
        kind: "uups",
      });

      var implementationAddress =
        await hre.upgrades.erc1967.getImplementationAddress(
            BBitesToken.target
        );

      console.log(`El address del Proxy es ${BBitesToken.target}`);
      console.log(`El address de Implementation es ${implementationAddress}`);

      
      var [owner, alice] = await ethers.getSigners();
      await BBitesToken.mint(alice.address, 1000000000);
      var balanceAlice = await BBitesToken.balanceOf(alice.address);
      console.log(balanceAlice);
    });
  });
});

//npx hardhat test test/testBBTK.js