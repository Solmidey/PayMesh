// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract Escrow {
    enum State { Funded, Submitted, Released, Refunded }
    struct Job { address payer; address provider; uint256 amount; uint8 nextMilestone; State state; }
    uint256 public lastJobId; mapping(uint256=>Job) public jobs;
    event Funded(uint256 indexed jobId,address indexed payer,address indexed provider,uint256 amount);
    event Submitted(uint256 indexed jobId,uint8 milestone,string cid);
    event Released(uint256 indexed jobId,uint8 milestone,address to,uint256 amount);
    event Refunded(uint256 indexed jobId,address to,uint256 amount);
    modifier onlyPayer(uint256 jobId){ require(jobs[jobId].payer==msg.sender,"not payer"); _; }
    modifier onlyProvider(uint256 jobId){ require(jobs[jobId].provider==msg.sender,"not provider"); _; }
    function fund(address provider) external payable returns(uint256 jobId){
        require(msg.value>0,"no funds"); jobId=++lastJobId;
        jobs[jobId]=Job(msg.sender,provider,msg.value,0,State.Funded);
        emit Funded(jobId,msg.sender,provider,msg.value);
    }
    function submit(uint256 jobId,string calldata cid) external onlyProvider(jobId){
        Job storage j=jobs[jobId]; require(j.state==State.Funded||j.state==State.Submitted,"bad state");
        j.state=State.Submitted; emit Submitted(jobId,j.nextMilestone,cid); j.nextMilestone+=1;
    }
    function release(uint256 jobId,uint256 amount) external onlyPayer(jobId){
        Job storage j=jobs[jobId]; require(j.state==State.Submitted,"not submitted");
        j.state=State.Released; (bool ok,)=j.provider.call{value:amount}(""); require(ok,"pay fail");
        emit Released(jobId,j.nextMilestone-1,j.provider,amount);
    }
    function refund(uint256 jobId) external onlyPayer(jobId){
        Job storage j=jobs[jobId]; require(j.state==State.Funded,"cannot refund");
        j.state=State.Refunded; (bool ok,)=j.payer.call{value:j.amount}(""); require(ok,"refund fail");
        emit Refunded(jobId,j.payer,j.amount);
    }
}
