// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Registry {
    struct Provider {
        address owner;
        string metadataCid;
        bool active;
    }

    uint256 private _counter;
    mapping(uint256 => Provider) private _providers;
    mapping(address => uint256) private _ownerToId;

    event ProviderRegistered(uint256 indexed id, address indexed owner, string metadataCid);
    event ProviderStatusChanged(uint256 indexed id, bool active);

    error AlreadyRegistered();
    error NotRegistered();
    error NotOwner();

    function register(string calldata metadataCid) external returns (uint256) {
        if (_ownerToId[msg.sender] != 0) {
            revert AlreadyRegistered();
        }

        _counter += 1;
        uint256 id = _counter;
        _providers[id] = Provider({owner: msg.sender, metadataCid: metadataCid, active: true});
        _ownerToId[msg.sender] = id;

        emit ProviderRegistered(id, msg.sender, metadataCid);
        return id;
    }

    modifier onlyProviderOwner(uint256 id) {
        Provider storage provider = _providers[id];
        if (provider.owner == address(0)) {
            revert NotRegistered();
        }
        if (provider.owner != msg.sender) {
            revert NotOwner();
        }
        _;
    }

    function setActive(uint256 id, bool active) external onlyProviderOwner(id) {
        Provider storage provider = _providers[id];
        provider.active = active;
        emit ProviderStatusChanged(id, active);
    }

    function getProvider(uint256 id) external view returns (Provider memory) {
        Provider memory provider = _providers[id];
        if (provider.owner == address(0)) {
            revert NotRegistered();
        }
        return provider;
    }
}
