// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";

error MinimumBalanceNotMet(string errorMessage);
error InsufficientFundsToWithdraw(string errorMessage);
bool private locked;

contract Staking {
  uint256 public totalStaked;
  mapping(address => uint256) public userStakes; // mapping to keep trace of who sends what
 
  // This line of code is an event declaration. In Solidity, events are used to log transactions on the Ethereum blockchain.
  // They are inheritable members of contracts. When you call them, they cause the arguments to be stored in the transaction’s log,
  // a special data structure in the blockchain. These logs are associated with the address of the contract and are incorporated into
  // the blockchain, allowing the use of either the contract’s address or the transaction’s hash to retrieve them later.
  // This specific event, `Staked`, is used to log the details whenever a user stakes some amount in this contract.
  // It is indexed by the user's address, which allows for easier searching and filtering for specific transactions involving staking by a user.
  // The `amount` parameter records the quantity of tokens or cryptocurrency that was staked.
  event Staked(address indexed user, uint256 amount);   // event to log the staking
  event Withdrawn (address indexed user, uint256);      // event for the withdrawal

  // This is a constructor function. It is a special function that is executed only once when the contract is created.
  // It is used to initialize the contract's state, and is often used to set the initial values of the contract's variables.
  // In this case, the constructor sets the `totalStaked` variable to 0 when the contract is created.
  constructor() {
    totalStaked = 0;
  }

  // Function to accept stakes
  function stake() external payable {
    // require(msg.value > 0, "You need to stake at least some Ether");
    if (msg.value == 0 ) {
      revert MinimumBalanceNotMet("You need to stake at least some Ether");
    }
    
    totalStaked += msg.value;
    userStakes[msg.sender] += msg.value; // apparently 0.8.0 and above it's safe to add like this
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


  //To do: return status messages

  function withdraw(uint256 amount) external  {
    require(!locked, "No re-entrancy");
    locked = true;

    if (userStakes[msg.sender] < amount) {
      revert InsufficientFundsToWithdraw("You do not have enough funds to withdraw");
    }
    if (amount == 0) {
      amount = userStakes[msg.sender];  // setting amount to the entire balance
    }
    payable(msg.sender).transfer(amount);
    userStakes[msg.sender] -= amount;
    totalStaked -= amount;
    emit Withdrawn(msg.sender, amount)

    locked = false;
  }
}

