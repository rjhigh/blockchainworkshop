pragma solidity ^0.5.12;

import './VotingCoin.sol';

contract Election {
    // Model a Proposal
    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store proposals
    // Fetch Proposal
    mapping(uint => Proposal) public proposals;
    // Store proposals Count
    uint public proposalsCount;
    address votingCoinAddr;

    // voted event
    event votedEvent (
        uint indexed _voterId
    );

    constructor(address coinContractAddress) public {
        votingCoinAddr = coinContractAddress;
        addProposal("Proposal 1");
        addProposal("Proposal 2");
    }

    function addProposal (string memory _name) private {
        proposalsCount ++;
        proposals[proposalsCount] = Proposal(proposalsCount, _name, 0);
    }

    function vote (uint _voterId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);
        uint tokenBalance = VotingCoin(votingCoinAddr).balanceOf(msg.sender);
        require(tokenBalance > 0);
        address ownerAddress = VotingCoin(votingCoinAddr).owner();
        // require a valid Proposal
        require(_voterId > 0 && _voterId <= proposalsCount);
        VotingCoin(votingCoinAddr).transferFrom(msg.sender, ownerAddress, tokenBalance);
        // record that voter has voted
        voters[msg.sender] = true;

        // update Proposal vote Count
        proposals[_voterId].voteCount ++;

        // trigger voted event
        emit votedEvent(_voterId);
    }
}
