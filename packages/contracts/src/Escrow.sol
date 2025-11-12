// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    struct Job {
        address buyer;
        address provider;
        uint256 amount;
        bool funded;
        bool submitted;
        bool released;
        bool refunded;
        bytes32 deliverableHash;
    }

    uint256 private _counter;
    mapping(uint256 => Job) private _jobs;
    bool private _locked;

    event JobFunded(uint256 indexed jobId, address indexed buyer, address indexed provider, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobReleased(uint256 indexed jobId, address indexed provider, uint256 amount);
    event JobRefunded(uint256 indexed jobId, address indexed buyer, uint256 amount);

    error InvalidAmount();
    error NotBuyer();
    error NotProvider();
    error NotFunded();
    error AlreadySubmitted();
    error NotSubmitted();
    error AlreadySettled();

    modifier nonReentrant() {
        require(!_locked, "REENTRANCY");
        _locked = true;
        _;
        _locked = false;
    }

    function fund(address provider) external payable nonReentrant returns (uint256) {
        if (msg.value == 0) {
            revert InvalidAmount();
        }

        _counter += 1;
        uint256 jobId = _counter;
        _jobs[jobId] = Job({
            buyer: msg.sender,
            provider: provider,
            amount: msg.value,
            funded: true,
            submitted: false,
            released: false,
            refunded: false,
            deliverableHash: bytes32(0)
        });

        emit JobFunded(jobId, msg.sender, provider, msg.value);
        return jobId;
    }

    function submit(uint256 jobId, bytes32 deliverableHash) external {
        Job storage job = _jobs[jobId];
        if (!job.funded) {
            revert NotFunded();
        }
        if (job.provider != msg.sender) {
            revert NotProvider();
        }
        if (job.submitted) {
            revert AlreadySubmitted();
        }

        job.deliverableHash = deliverableHash;
        job.submitted = true;
        emit JobSubmitted(jobId, deliverableHash);
    }

    function release(uint256 jobId) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (!job.funded) {
            revert NotFunded();
        }
        if (job.buyer != msg.sender) {
            revert NotBuyer();
        }
        if (!job.submitted) {
            revert NotSubmitted();
        }
        if (job.released || job.refunded) {
            revert AlreadySettled();
        }

        job.released = true;
        payable(job.provider).transfer(job.amount);
        emit JobReleased(jobId, job.provider, job.amount);
    }

    function refund(uint256 jobId) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (!job.funded) {
            revert NotFunded();
        }
        if (job.provider != msg.sender) {
            revert NotProvider();
        }
        if (job.released || job.refunded) {
            revert AlreadySettled();
        }

        job.refunded = true;
        payable(job.buyer).transfer(job.amount);
        emit JobRefunded(jobId, job.buyer, job.amount);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return _jobs[jobId];
    }
}
