// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

// Minimal contracts; replace with your real ones if different
contract Registry { }
contract Escrow { }
contract Reputation { }

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        Registry registry = new Registry();
        Escrow escrow = new Escrow();
        Reputation reputation = new Reputation();

        vm.stopBroadcast();

        // Print a single-line JSON that our Node tool can parse
        // console2.log is available via forge-std
        console2.log(
            string.concat(
                "{",
                    '"registry":"', vm.toString(address(registry)), '",',
                    '"escrow":"', vm.toString(address(escrow)), '",',
                    '"reputation":"', vm.toString(address(reputation)), '"',
                "}"
            )
        );
    }
}
