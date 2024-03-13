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

      // expect(await staking.totalStaked()).to.equal(100);
      // the below replicates the above
      let result = await staking.totalStaked();
      expect(result).to.equal(100);

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

    // it("Should complain because no Ether is staked", async function () {
    // });

    it("Should return staked balance by user once off", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);

      await staking.stake({value: 100});
      expect(await staking.getUserStake(owner)).to.equal(100);
    });

    it("Should return staked balance after upping it", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);

      await staking.stake({value: 100});
      await staking.stake({value: 200});
      expect(await staking.getUserStake(owner)).to.equal(300);
      // console.log(await staking.getContractBalance());
    });

    it("Should fail because there's not enough balance to withdraw", async function () {
      const { staking } = await loadFixture(deployStakingFixture);
      await staking.stake({value: 100});
      
      await expect(staking.withdraw(1000)).to.be.revertedWithCustomError(
        staking,
        "InsufficientFundsToWithdraw"
        );    
    });

    it("Should have all my funds withdrawn", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      await staking.stake({value: 100});

      await staking.withdraw(0);
      expect(await staking.getUserStake(owner)).to.equal(0);
    });

    it("Should have SOME my funds withdrawn", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      await staking.stake({value: 100});

      await staking.withdraw(50);
      await staking.withdraw(20);
      expect(await staking.getUserStake(owner)).to.equal(30);
    });


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
