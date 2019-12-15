let Election = artifacts.require("./Election.sol");
let VotingCoin = artifacts.require("./VotingCoin");

contract("VotingCoin", () => {
  let votingCoinInstance;

  contract("Election", (accounts) => {
    let electionInstance;

    it("initializes with two proposals", () => {
      return Election.deployed().then((instance) => {
        return instance.proposalsCount();
      }).then((count) => {
        assert.equal(count, 2);
      });
    });

    it("it initializes the proposals with the correct values", () => {
      return Election.deployed().then((instance) => {
        electionInstance = instance;
        return electionInstance.proposals(1);
      }).then((proposal) => {
        assert.equal(proposal[0], 1, "contains the correct id");
        assert.equal(proposal[1], "Proposal 1", "contains the correct name");
        assert.equal(proposal[2], 0, "contains the correct votes count");
        return electionInstance.proposals(2);
      }).then((proposal) => {
        assert.equal(proposal[0], 2, "contains the correct id");
        assert.equal(proposal[1], "Proposal 2", "contains the correct name");
        assert.equal(proposal[2], 0, "contains the correct votes count");
      });
    });

    it("allows a voter to cast a vote", () => {
      return VotingCoin.deployed().then((votinginstance) => {
        votingCoinInstance = votinginstance;
        return votinginstance.buy({ from: accounts[1], value: web3.utils.toWei("1") }).then((receipt) => {
          // console.log('buy logs', receipt.logs)
        }).catch((error) => {
          // console.log('buy error-->', error)
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
          return votinginstance.authorize(accounts[0], votinginstance.coinBalance[accounts[1]]).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert1");
            return Election.deployed().then((instance) => {
              electionInstance = instance;
              ProposalId = 1;
              return electionInstance.vote(ProposalId, { from: accounts[1] });
            }).then((receipt) => {
              assert.equal(receipt.logs.length, 1, "an event was triggered");
              assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
              assert.equal(receipt.logs[0].args._ProposalId.toNumber(), ProposalId, "the proposal id is correct");
              return electionInstance.voters(accounts[0]);
            }).then((voted) => {
              assert(voted, "the voter was marked as voted");
              return electionInstance.proposals(ProposalId);
            }).then((proposal) => {
              let voteCount = proposal[2];
              assert.equal(voteCount, 1, "increments the proposal's vote count");
            })
          })
        })
      })
    });

    it("throws an exception for invalid proposals", () => {
      return VotingCoin.deployed().then((votinginstance) => {
        votingCoinInstance = votinginstance;
        return votinginstance.buy({ from: accounts[1], value: web3.utils.toWei("1") }).then((receipt) => {
          console.log('buy logs', receipt.logs)
        }).catch((error) => {
          console.log('buy error-->', error)
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
          return votinginstance.authorize(accounts[0], votinginstance.coinBalance[accounts[1]]).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert1");
            return Election.deployed().then((instance) => {
              electionInstance = instance;
              return electionInstance.vote(99, { from: accounts[1] })
            }).then(assert.fail).catch((error) => {
              assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
              return electionInstance.proposals(1);
            }).then((Proposal1) => {
              let voteCount = Proposal1[2];
              assert.equal(voteCount, 1, "proposal 1 did not receive any votes");
              return electionInstance.proposals(2);
            }).then((Proposal2) => {
              let voteCount = Proposal2[2];
              assert.equal(voteCount, 0, "proposal 2 did not receive any votes");
            });
          })
        });
      });
    });

    it("throws an exception for double voting", () => {
      return VotingCoin.deployed().then((votinginstance) => {
        votingCoinInstance = votinginstance;
        return votinginstance.buy({ from: accounts[1], value: web3.utils.toWei("1") }).then((receipt) => {
          console.log('buy logs', receipt.logs)
        }).catch((error) => {
          console.log('buy error-->', error)
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
          return votinginstance.authorize(accounts[0], votinginstance.coinBalance[accounts[1]]).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert1");
            return Election.deployed().then((instance) => {
              electionInstance = instance;
              ProposalId = 2;
              electionInstance.vote(ProposalId, { from: accounts[1] });
              return electionInstance.proposals(ProposalId);
            }).then((proposal) => {
              let voteCount = proposal[2];
              assert.equal(voteCount, 1, "accepts first vote");
              // Try to vote again
              return electionInstance.vote(ProposalId, { from: accounts[1] });
            }).then(assert.fail).catch((error) => {
              assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
              return electionInstance.proposals(1);
            }).then((Proposal1) => {
              let voteCount = Proposal1[2];
              assert.equal(voteCount, 1, "proposal 1 did not receive any votes");
              return electionInstance.proposals(2);
            }).then((Proposal2) => {
              let voteCount = Proposal2[2];
              assert.equal(voteCount, 1, "proposal 2 did not receive any votes");
            });
          });
        });
      });
    });
  });
});

