// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Registry} from "../src/Registry.sol";
import {Escrow} from "../src/Escrow.sol";
import {Reputation} from "../src/Reputation.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        Registry registry = new Registry();
        Escrow escrow = new Escrow();
        Reputation reputation = new Reputation();
        vm.stopBroadcast();

        string memory json = string(
            abi.encodePacked(
                '{"registry":"',
                vm.toString(address(registry)),
                '","escrow":"',
                vm.toString(address(escrow)),
                '","reputation":"',
                vm.toString(address(reputation)),
                '"}'
            )
        );
        console2.log(json);
    }
}
