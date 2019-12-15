let Election = artifacts.require('./Election.sol');
let VotingCoin = artifacts.require('./VotingCoin.sol');
module.exports = (deployer) => {
  deployer.deploy(VotingCoin, 500000).then(() => {
    return deployer.deploy(Election, VotingCoin.address);
  })
};
