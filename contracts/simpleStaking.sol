// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./myToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error MinimumBalanceNotMet(string errorMessage);
error InsufficientFundsToWithdraw(string errorMessage);
error WithdrawalLocked(string errorMessage);

contract Staking is ReentrancyGuard {
  // bool private locked;

  uint256 public totalStaked;
  uint256 public constant WAITING_PERIOD = 10 minutes;

  struct userDetails {
    uint256 userStakes;
    uint256 stakeTimestamps;
  }

  mapping(address => userDetails) public stakedDetails;      // mapping to keep trace of who sends what


  event Staked(address indexed user, uint256 amount);   // event to log the staking
  event Withdrawn (address indexed user, uint256);      // event for the withdrawal

  IERC20 pdbToken;

  constructor(address pdbTokenAddress) {
    pdbToken = IERC20(pdbTokenAddress);
    totalStaked = 0;
  }

  // Function to accept stakes
  function stake(uint256 amount) external {
    require(amount > 0, "You need to stake at least some tokens");
    require(pdbToken.allowance(msg.sender, address(this)) >= amount, "Stake request exceeds allowance");
    pdbToken.transferFrom(msg.sender, address(this), amount);

    totalStaked += amount;    // i could also use balanceOf in future, so this might not be super useful
    stakedDetails[msg.sender].userStakes += amount;
    stakedDetails[msg.sender].stakeTimestamps = block.timestamp;

    emit Staked(msg.sender, amount);
  }

  // Function to check the contract's balance
  // This is equal to the total staked amount if no other Ether transactions occur
  function getContractBalance() public view returns (uint256) {
    return address(this).balance; // use OZ's 
  }

  function getUserStake(address user) public view returns (uint256) {
    return stakedDetails[user].userStakes;
  }

  function withdraw(uint256 amount) external nonReentrant {
    require(stakedDetails[msg.sender].userStakes >= amount, "Insufficient funds to withdraw");
    require(block.timestamp >= stakedDetails[msg.sender].stakeTimestamps + WAITING_PERIOD, "Withdrawal is locked. Please wait until the waiting period has passed.");

    stakedDetails[msg.sender].userStakes -= amount;
    totalStaked -= amount;
    pdbToken.transfer(msg.sender, amount);

    emit Withdrawn(msg.sender, amount);
  }

  function calculateRewards() public pure returns (uint256) {
    return 1;
  }

}
