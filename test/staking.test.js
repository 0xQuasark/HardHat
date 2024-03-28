const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Staking", function () {
  async function deployStakingFixture() {
    // Contracts are deployed using the first signer/account by default
    const signers = await ethers.getSigners();
    // const [owner, otherAccount] = await ethers.getSigners();
    const [owner, otherAccount ] = signers; // owner is sometimes called deployer

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy();

    return { staking, owner, otherAccount, signers };
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

    it.only("Should have all my funds withdrawn", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      await staking.stake({value: 100});
      const WAITING_PERIOD = await staking.WAITING_PERIOD();
      await time.increase(WAITING_PERIOD); 

      const balanceBefore = staking.getUserStake(owner);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner);
      console.log("ownerBalanceBefore", ownerBalanceBefore);
      const tx = await staking.withdraw(99); // find out gas 
      console.log("balance:", await ethers.provider.getBalance(await staking.getAddress()));

      expect(await ethers.provider.getBalance(owner)).to.equal(ownerBalanceBefore + 100n); // minus the gas cost
// bigint
      // expect(await ethers.provider.getBalance(owner)).to./
      // const balanceAfter = staking.getUserStake(owner);
      // expect(await staking.getUserStake(owner)).to.equal(0);
    });

    it("Should have SOME my funds withdrawn", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      await staking.stake({value: 100});
      const WAITING_PERIOD = await staking.WAITING_PERIOD();
      await time.increase(WAITING_PERIOD); 

      await expect(staking.withdraw(50)).to.emit(
        staking,
        "Withdrawn"
      ).withArgs(owner, 50);

      await expect(staking.withdraw(20)).to.emit(
        staking,
        "Withdrawn"
      ).withArgs(owner, 20);
      expect(await staking.getUserStake(owner)).to.equal(30);

    });

    it("Should support multiple stakers", async function () {
      const { staking, owner, signers } = await loadFixture(deployStakingFixture);

      await staking.connect(signers[1]).stake({ value: 30 });
      await staking.connect(signers[2]).stake({ value: 40 });

      expect(await staking.getUserStake(signers[1])).to.equal(30);
      expect(await staking.getUserStake(signers[2])).to.equal(40);
    });

    it("Should not allow to withdraw before the waiting period", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture); 
      // Stake some Ether 
      const WAITING_PERIOD = await staking.WAITING_PERIOD();
      // console.log("WAITING_PERIOD: ", WAITING_PERIOD)
      // Attempt to withdraw immediately (should fail) 
      await staking.stake({ value: 10 }); 
      // Increase time by the waiting period 
      await expect(staking.withdraw(10)).to.be.revertedWithCustomError(
        staking,
        "WithdrawalLocked"
        ); 
      // Attempt to withdraw after the waiting period (should succeed) 
      await time.increase(WAITING_PERIOD); 
      await expect(staking.withdraw(10)).not.to.be.reverted;
    });


  });
});


/*
Homework
read about connect in the docs
play with locking and oly withdrawing after a certain time

*/
