// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "forge-std/Script.sol";
import "../src/Registry.sol";
import "../src/Escrow.sol";
import "../src/Reputation.sol";
contract Deploy is Script {
  function run() external {
    vm.startBroadcast();
    Registry reg = new Registry();
    Escrow esc = new Escrow();
    Reputation rep = new Reputation();
    vm.stopBroadcast();
    console2.log(string(abi.encodePacked('{"registry":"', vm.toString(address(reg)),
      '","escrow":"', vm.toString(address(esc)), '","reputation":"', vm.toString(address(rep)),'"}')));
  }
}
