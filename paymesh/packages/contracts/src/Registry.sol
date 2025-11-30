// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract Registry {
    struct Service { address provider; string metadataURI; bool active; }
    uint256 public lastId; mapping(uint256=>Service) public services;
    event Registered(uint256 indexed id, address indexed provider, string metadataURI);
    event Activated(uint256 indexed id, bool active);
    modifier onlyProvider(uint256 id){ require(services[id].provider==msg.sender,"not provider"); _; }
    function register(string calldata metadataURI) external returns(uint256 id){
        id=++lastId; services[id]=Service(msg.sender,metadataURI,true);
        emit Registered(id,msg.sender,metadataURI);
    }
    function setActive(uint256 id,bool active) external onlyProvider(id){
        services[id].active=active; emit Activated(id,active);
    }
}
