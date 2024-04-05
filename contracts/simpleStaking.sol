// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

  constructor() {
    totalStaked = 0;
  }

  // Function to accept stakes
  function stake() external payable {
    if (msg.value == 0 ) {
      revert MinimumBalanceNotMet("You need to stake at least some Ether");
    }
    
    totalStaked += msg.value;
    stakedDetails[msg.sender].userStakes += msg.value; // apparently 0.8.0 and above it's safe to add like this
    stakedDetails[msg.sender].stakeTimestamps = block.timestamp;

    emit Staked(msg.sender, msg.value);
  }

  // Function to check the contract's balance
  // This is equal to the total staked amount if no other Ether transactions occur
  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getUserStake(address user) public view returns (uint256) {
    return stakedDetails[user].userStakes;
  }

  function withdraw(uint256 amount) external nonReentrant {
    if (stakedDetails[msg.sender].userStakes < amount) {  // check
      revert InsufficientFundsToWithdraw("You do not have enough funds to withdraw");
    }

    // Check if the waiting period has passed
    // this could be a function determineTimeEligibility()
    if (block.timestamp < stakedDetails[msg.sender].stakeTimestamps + WAITING_PERIOD) {
      revert WithdrawalLocked("Withdrawal is locked. Please wait until the waiting period has passed.");
    }

    if (amount == 0) {                                 // check
      amount = stakedDetails[msg.sender].userStakes;   // setting amount to the entire balance
    }
    stakedDetails[msg.sender].userStakes -= amount;   // effect
    totalStaked -= amount;                            // effect
    // console.log("Amount to withdraw, totalStaked:", amount, totalStaked);
    // i'd need to add checks and balances (a boolean to show i've already paid, etc..)
    payable(msg.sender).transfer(amount + calculateRewards()); // interaction

    emit Withdrawn(msg.sender, amount);
  }

  function calculateRewards() public pure returns (uint256) {
    return 1;
  }

}

