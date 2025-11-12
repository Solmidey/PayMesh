// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Reputation} from "../src/Reputation.sol";

contract ReputationTest is Test {
    Reputation private reputation;

    function setUp() public {
        reputation = new Reputation();
    }

    function testBump() public {
        address provider = address(0xABC);
        reputation.bump(provider);
        reputation.bump(provider);
        assertEq(reputation.getScore(provider), 2);
    }
}
