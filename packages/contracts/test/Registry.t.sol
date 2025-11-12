// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Registry} from "../src/Registry.sol";

contract RegistryTest is Test {
    Registry private registry;

    function setUp() public {
        registry = new Registry();
    }

    function testRegisterAndSetActive() public {
        vm.prank(address(0xBEEF));
        uint256 id = registry.register("cid://metadata");
        assertEq(id, 1);

        (address owner,, bool active) = registry.getProvider(id);
        assertEq(owner, address(0xBEEF));
        assertTrue(active);

        vm.prank(address(0xBEEF));
        registry.setActive(id, false);
        (, , bool activeAfter) = registry.getProvider(id);
        assertFalse(activeAfter);
    }

    function testSetActiveRevertsWhenNotOwner() public {
        vm.prank(address(0xBEEF));
        uint256 id = registry.register("cid://metadata");

        vm.prank(address(0xFEED));
        vm.expectRevert(Registry.NotOwner.selector);
        registry.setActive(id, false);
    }
}
