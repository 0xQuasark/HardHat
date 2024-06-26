const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { ethers } = require("hardhat");


async function deployStakingFixture() {
  // Contracts are deployed using the first signer/account by default
  const signers = await ethers.getSigners();
  // const [owner, otherAccount] = await ethers.getSigners();
  const [owner, otherAccount ] = signers; // owner is sometimes called deployer
  
  const Staking = await ethers.getContractFactory("Staking");
  const PDBToken = await ethers.getContractFactory("PDBToken");
  const pdbToken = await PDBToken.deploy(ethers.parseUnits("1000000", 18));
  const newAddress = await pdbToken.getAddress();
  console.log("new address: ", newAddress);
  const staking = await Staking.deploy(newAddress);

  return { staking, owner, otherAccount, signers, pdbToken };
}

describe("Staking", function () {
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

    it("Should have all my funds withdrawn", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      const result = await staking.stake({value: 100});
      // console.log('Staking result:', result); // no gas used 

      const WAITING_PERIOD = await staking.WAITING_PERIOD();
      await time.increase(WAITING_PERIOD); 

      const stakingBalanceBefore = await staking.getUserStake(owner);
      const ownerBalanceBefore = await ethers.provider.getBalance(owner);
      // console.log('stakingBalanceBefore: ', stakingBalanceBefore);
      // console.log('ownerBalanceBefore: ', ownerBalanceBefore);

      const tx = await staking.withdraw(99); // find out gas 
      // const stakingBalanceAfter = await staking.getUserStake(owner);
      // console.log('stakingBalanceAfter: ', stakingBalanceAfter);

      const receipt = await tx.wait();
      // console.log('receipt: ', receipt);
      const totalCostInWei = receipt.gasUsed * receipt.gasPrice;
      // console.log('totalCostInWei', totalCostInWei);

      
      // console.log('tx result:', tx);
      // console.log("balance:", await ethers.provider.getBalance(await staking.getAddress()));

      const ownerBalanceAfter = await ethers.provider.getBalance(owner);
      // console.log('ownerBalanceAfter: ', ownerBalanceAfter);
      // console.log('totalCostInWei: ', totalCostInWei);
      // console.log(`ownerBalanceAfter = ownerBalanceBefore + 99n + totalCostInWei`);
      // console.log(`${ownerBalanceAfter} = ${ownerBalanceBefore} + 99000000000000000000 + ${totalCostInWei}`);
      
      const rewardAmount = await staking.calculateRewards();

      const finalAnswer = ownerBalanceBefore + 99n - totalCostInWei + rewardAmount; // the 1n is the calculateRewards() in the contract
      // console.log(`${ownerBalanceAfter} = ${finalAnswer}`);
      // console.log('diff: ', ownerBalanceAfter - finalAnswer);
      expect(ownerBalanceAfter).to.equal(finalAnswer); // minus the gas cost
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

    it.skip("Should not allow to withdraw before the waiting period", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture); 
      // Stake some Ether 
      const WAITING_PERIOD = await staking.WAITING_PERIOD();
      // console.log("WAITING_PERIOD: ", WAITING_PERIOD)
      
      // Attempt to withdraw immediately (should fail) 
      await staking.stake({ value: 10 }); 
      const tx = await staking.withdraw(10)
      // Increase time by the waiting period 

      await expect(tx).to.be.revertedWithCustomError(
        staking,
        "WithdrawalLocked"
        ); 
      // Attempt to withdraw after the waiting period (should succeed) 
      await time.increase(WAITING_PERIOD); 
      await expect(staking.withdraw(10)).not.to.be.reverted;
    });

  });
});

describe.only("PDB Token", function () {
  it("Should stake PDB tokens successfully", async function () {
    const { staking, owner, pdbToken } = await loadFixture(deployStakingFixture);
    const stakeAmount = ethers.parseUnits("100", 18);

    // Owner approves the staking contract to spend tokens
    // check out how _approve works on ERC20.sol (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L280)

    await pdbToken.connect(owner).approve(await staking.getAddress(), stakeAmount);

    // Perform the stake operation
    await expect(staking.connect(owner).stake(stakeAmount))
        .to.emit(staking, "Staked")
        .withArgs(await owner.getAddress(), stakeAmount);

    // Check the staked balance
    expect(await staking.getUserStake(owner.address)).to.equal(stakeAmount);
  });
});

