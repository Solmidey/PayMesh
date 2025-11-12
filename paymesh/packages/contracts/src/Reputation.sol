// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract Reputation {
    mapping(address=>uint256) public score;
    event Bumped(address indexed who,uint256 newScore);
    function bump(address who) external { score[who]+=1; emit Bumped(who,score[who]); }
}
