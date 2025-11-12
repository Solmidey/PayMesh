// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow private escrow;

    function setUp() public {
        escrow = new Escrow();
    }

    function testFundSubmitReleaseFlow() public {
        address buyer = address(0xA11CE);
        address provider = address(0xB0B);

        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        uint256 jobId = escrow.fund{value: 0.5 ether}(provider);
        assertEq(jobId, 1);

        vm.prank(provider);
        escrow.submit(jobId, keccak256("artifact"));

        uint256 providerBalanceBefore = provider.balance;
        vm.prank(buyer);
        escrow.release(jobId);
        assertEq(provider.balance - providerBalanceBefore, 0.5 ether);
    }

    function testRefundByProvider() public {
        address buyer = address(0xA11CE);
        address provider = address(0xB0B);
        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        uint256 jobId = escrow.fund{value: 0.5 ether}(provider);

        uint256 buyerBalanceBefore = buyer.balance;
        vm.prank(provider);
        escrow.refund(jobId);
        assertEq(buyer.balance - buyerBalanceBefore, 0.5 ether);
    }

    function testReleaseRequiresSubmission() public {
        address buyer = address(0xA11CE);
        address provider = address(0xB0B);
        vm.deal(buyer, 1 ether);

        vm.prank(buyer);
        uint256 jobId = escrow.fund{value: 0.5 ether}(provider);

        vm.prank(buyer);
        vm.expectRevert(Escrow.NotSubmitted.selector);
        escrow.release(jobId);
    }
}
