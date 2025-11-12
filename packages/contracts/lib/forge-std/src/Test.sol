// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Vm.sol";
import "./console2.sol";

contract Test {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256('hevm cheat code')))));

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, 'assertEq(uint256,uint256)');
    }

    function assertEq(address a, address b) internal pure {
        require(a == b, 'assertEq(address,address)');
    }

    function assertTrue(bool condition) internal pure {
        require(condition, 'assertTrue');
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, 'assertFalse');
    }
}
