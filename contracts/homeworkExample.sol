// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract A {
  struct S {
    uint128 a;                                      // slot 2
    uint128 b;                                      // slot 2
    uint[2] staticArray;                            // slot 3
    uint[] dynamicArray;                            // slot 4
  }

  uint x;                                           // slot 0
  uint y;                                           // slot 1
  S s;                                              
  address addr;                                     // slot 5
  mapping (uint => mapping(address => bool)) map;   // slot 6
  uint[] array;                                     // slot 7
  string s1;                                        // slot 8
  bytes b1;                                         // slot 9
}




