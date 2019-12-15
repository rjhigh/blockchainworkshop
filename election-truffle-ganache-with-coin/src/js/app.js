App = {
  web3Provider: null,
  contracts: {},
  account: '', //0xB06fbfC5A0Bc2Bc58C87a784d34B2D8E0E9cCCE8
  owner: '0x4FF62582C8482B12d9Dfe44F7695D5BB587D81FB',
  voter: '0x19D3aa6279d977AdcaED76E291C699Fa8b4e58cB',
  hasVoted: false,
  voteEventCount: 0,
  tokenEventCount: 0,
  init: () => {
    return App.initWeb3();
  },

  initWeb3: () => {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", (election) => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      $.getJSON("VotingCoin.json", (coin) => {
        App.contracts.VotingCoin = TruffleContract(coin);
        App.contracts.VotingCoin.setProvider(App.web3Provider);
        App.listenForEvents();
        App.getTokenDetails();
        return App.render();
      })
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: () => {
    App.contracts.Election.deployed().then((electionInstance) => {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      electionInstance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.voteEventCount++;
        if (App.voteEventCount <= 1) {
          App.render();
         // App.getTokenDetails();
        }
      });
      App.contracts.VotingCoin.deployed().then((coinInstance) => {
        coinInstance.Transfer({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(async (error, event) => {
          console.log("event triggered", event)
          let tokenRows = $('#tokenStats');
          //tokenRows.empty();
          console.log('emptycalled--->', tokenRows)
          //await App.getTokenDetails();
          //tokenRows.empty()
        });
      })
    });
  },

  getTokenDetails: () => {
    return new Promise(resolve => {
      let tokenRows = $('#tokenStats');
      tokenRows.empty();
      App.contracts.VotingCoin.deployed().then(async (coinInstance) => {
        tokenRows.append("<tr><th>" + 1 + "</th><td>" + 'Total Supply' + "</td><td>" + await coinInstance.totalAmount() + "</td></tr>");
        tokenRows.append("<tr><th>" + 2 + "</th><td>" + 'Available Supply' + "</td><td>" + await coinInstance.balanceOf(App.owner, { from: App.owner }) + "</td></tr>");
        tokenRows.append("<tr><th>" + 3 + "</th><td>" + 'Your Balance' + "</td><td>" + await coinInstance.balanceOf(App.voter, { from: App.owner }) + "</td></tr>");
        // Reload when balance has changed
        //App.render();
        resolve(true);
      })
    })
  },

  buyTokens: () => {
    let status = $('#status');
    status.empty();
    App.contracts.VotingCoin.deployed().then((coinInstance) => {
      coinInstance.buy({ from: App.voter, value: web3.toWei(1, "ether") }).then(() => {
        status.append('<h4 class="text-center">Tokens credited</h4>')
        App.getTokenDetails();
      }).catch((error) => {
        status.append('<h4 class="text-center">Tokens could not be credited</h4>');
        console.warn(error);
      });
    })
  },

  authorizeOwner: () => {
    let status = $('#status');
    status.empty();
    App.contracts.VotingCoin.deployed().then(async (coinInstance) => {
      const voterBalance = await coinInstance.balanceOf(App.voter, { from: App.voter });
      console.log('aparams--->', App.owner, await coinInstance.balanceOf(App.voter, { from: App.voter }), voterBalance.c[0])
      coinInstance.authorize(App.owner, voterBalance.c[0], { from: App.voter }).then((success) => {
        console.log('auth--->', success)
        if (success) {
          status.append('<h4 class="text-center">Authorization successful</h4>')
        } else {
          status.append('<h4 class="text-center">Authorization failed</h4>');
        }
      }).catch((error) => {
        status.append('<h4 class="text-center">Authorization failed</h4>');
        console.warn(error);
      });
    })
  },

  render: () => {
    let status = $('#status');
    status.empty();
    let electionInstance;
    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase((err, startaccount) => {
      if (err === null) {
        // console.log('acc details--->', App.account)
        App.account = (App.voter) ? App.voter : startaccount;
        $("#accountAddress").html("Your Account: " + App.account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then((instance) => {
      electionInstance = instance;
      return electionInstance.proposalsCount();
    }).then((proposalsCount) => {
      let candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      let candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (let i = 1; i <= proposalsCount; i++) {
        electionInstance.proposals(i).then((candidate) => {
          let id = candidate[0];
          let name = candidate[1];
          let voteCount = candidate[2];

          // Render candidate Result
          let candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          let candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.voter);
    }).then((hasVoted) => {
      // Do not allow a user to vote
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch((error) => {
      console.warn(error);
    });
  },

  castVote: () => {
    let candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then((instance) => {
      console.log('selected--->', candidateId)
      return instance.vote(candidateId, { from: App.voter });
    }).then((result) => {
      console.log('vote-->', result)
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      location.reload();
    }).catch((err) => {
      console.error(err);
    });
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
