const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe.only("Staking", function () {
  async function deployStakingFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy();

    return { staking, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { staking } = await loadFixture(deployStakingFixture);

      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should stake", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);

      await expect(staking.stake({value: 100})).to.emit(staking, "Staked").withArgs( owner, 100);
      expect(await staking.totalStaked()).to.equal(100);
    })

    it("Should complain because no Ether is staked", async function () {
      const { staking } = await loadFixture(deployStakingFixture);

      // await expect(staking.stake()).to.be.reverted;
      // await expect(staking.stake()).to.be.revertedWith("You need to stake at least some Ether");
      await expect(staking.stake()).to.be.revertedWithCustomError(
        staking,
        "MinimumBalanceNotMet"
      ).withArgs("You need to stake at least some Ether");
    });

    // it("Should check an event error because no eth staked", async )
  });
});


/*
take complexity to next stage
think about how to mark the amounts on a per sender basis
i might stake 100wei, h could stake 200wei
once we've staked our amounts, and then need to withdraw, i should be able to withdraw up to our staked balanced
new concept: manage the state of 

withdrawAll() // start here?
withdrawSpecfic()

withdraw() // 0 means withdraw all, otherwise the specific amount
*/
