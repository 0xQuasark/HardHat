const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Staking", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function initStaking() {
    const ONE_GWEI = 1_000_000_000;
    const lockedAmount = ONE_GWEI;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    // console.log("Owner details: ", owner);
    // console.log("otherAccount details: ", otherAccount);

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy();

    return staking;
  }

  describe("Test begins", function () {
    it("Placholder for now", async function () {
      const staking = await loadFixture(initStaking);
      console.log(staking);
    });
  });
});
