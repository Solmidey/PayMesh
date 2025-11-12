// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function prank(address) external;
    function prank(address, address) external;
    function deal(address, uint256) external;
    function expectRevert(bytes4) external;
}
