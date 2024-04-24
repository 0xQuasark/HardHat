const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("PDBToken", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("PDBToken");
    const initialSupply = ethers.parseUnits("1000", 18);
    const token = await Token.deploy(initialSupply);

    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });
});
