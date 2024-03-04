// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

error MinimumBalanceNotMet(string errorMessage);

contract Staking {
  uint256 public totalStaked;

  // This line of code is an event declaration. In Solidity, events are used to log transactions on the Ethereum blockchain.
  // They are inheritable members of contracts. When you call them, they cause the arguments to be stored in the transaction’s log,
  // a special data structure in the blockchain. These logs are associated with the address of the contract and are incorporated into
  // the blockchain, allowing the use of either the contract’s address or the transaction’s hash to retrieve them later.
  // This specific event, `Staked`, is used to log the details whenever a user stakes some amount in this contract.
  // It is indexed by the user's address, which allows for easier searching and filtering for specific transactions involving staking by a user.
  // The `amount` parameter records the quantity of tokens or cryptocurrency that was staked.
  event Staked(address indexed user, uint256 amount); // event to log the staking

  // This is a constructor function. It is a special function that is executed only once when the contract is created.
  // It is used to initialize the contract's state, and is often used to set the initial values of the contract's variables.
  // In this case, the constructor sets the `totalStaked` variable to 0 when the contract is created.
  constructor() {
    totalStaked = 0;
  }

  // Function to accept stakes
  function stake() public payable {
    // require(msg.value > 0, "You need to stake at least some Ether");
    if (msg.value == 0 ) {
      revert MinimumBalanceNotMet("You need to stake at least some Ether");
    }
    
    totalStaked += msg.value;
    emit Staked(msg.sender, msg.value);
  }

  // Function to check the contract's balance
  // This is equal to the total staked amount if no other Ether transactions occur
  function getContractBalance() public view returns (uint256) {
    return address(this).balance;
  }

}

