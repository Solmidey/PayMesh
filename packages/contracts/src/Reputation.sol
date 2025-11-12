// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Reputation {
    mapping(address => uint256) private _scores;

    event ReputationBumped(address indexed account, uint256 newScore);

    function bump(address account) external {
        _scores[account] += 1;
        emit ReputationBumped(account, _scores[account]);
    }

    function getScore(address account) external view returns (uint256) {
        return _scores[account];
    }
}
