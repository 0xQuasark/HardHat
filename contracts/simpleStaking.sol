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

  mapping(address => uint256) public userStakes;      // mapping to keep trace of who sends what
  mapping(address => uint256) public stakeTimestamps; // mapping to track time stamps

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
    userStakes[msg.sender] += msg.value; // apparently 0.8.0 and above it's safe to add like this
    stakeTimestamps[msg.sender] = block.timestamp;

    emit Staked(msg.sender, msg.value);
  }

  // Function to check the contract's balance
  // This is equal to the total staked amount if no other Ether transactions occur
  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function getUserStake(address user) public view returns (uint256) {
    return userStakes[user];
  }

  function withdraw(uint256 amount) external nonReentrant {
    if (userStakes[msg.sender] < amount) {  // check
      revert InsufficientFundsToWithdraw("You do not have enough funds to withdraw");
    }

    // Check if the waiting period has passed
    if (block.timestamp < stakeTimestamps[msg.sender] + WAITING_PERIOD) {
      revert WithdrawalLocked("Withdrawal is locked. Please wait until the waiting period has passed.");
    }

    if (amount == 0) {                      // check
    amount = userStakes[msg.sender];        // setting amount to the entire balance
    }
    userStakes[msg.sender] -= amount;       // effect
    totalStaked -= amount;                  // effect

    payable(msg.sender).transfer(amount); // interaction

    emit Withdrawn(msg.sender, amount);
  }
}

