App = {
  web3Provider: null,
  contract: null,
  account: '0xba11adbf0dad5d780a0a9973526e0a470b7b2f6c',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  //Connection with geth node (can be full or light client or can be wallet app like metamask)
  initWeb3: function() {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();

  },

  //Initialize contract instance by reading ABI from build files (compiled code)
  initContract: function() {
    $.getJSON('build/contracts/Election.json', function(election) {
      const ownerAddress = '0x8b63feaa5e731100ed2f9338f309652fe9893028';
      App.contract = new web3.eth.Contract(election.abi, '0x87dcb796f6abc336e91da18969830d7fdb39e85b', {
        from: ownerAddress,
        gasPrice: '0x0'
      })
      App.contract.defaultCommon = {customChain: {name: 'custom', chainId: 11122019, networkid: 11122019}, baseChain: 'mainnet', hardfork:'petersburg'};
    App.listenForEvents();
    return App.render();
  })
   
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contract.events.votedEvent({}, {
      fromBlock: 0,
      toblock: 'latest'
    }, (error, result) => {
      console.log('result-->');
    })
    .on('connected', function (subscription) {
      console.log('subscribed', subscription);
    })
    .on('data', function(event) {
      console.log('events listened--->', event);
    })
    .on('changed', function(event) {
      App.render()
    })
    .on('error', console.error)
  },

  render: function() {
    console.log('Render called------->');
    let loader = $("#loader");
    let content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase((err, startaccount) => {
      if (err === null) {
        console.log('acc details--->', App.account, startaccount)
        App.account = (App.account) ? App.account : startaccount;
        $("#accountAddress").html("Your Account: " + App.account);
      }
    });

    // Load contract data
    App.contract.methods.candidatesCount().call({},(error, candidatesCount) => {
      if(error) { console.log('Oops failed to get candidate count', error)}
      let candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      let candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (let i = 1; i <= candidatesCount; i++) {
        App.contract.methods.candidates(i).call({}, (error, candidate) => {
          console.log('Failed to get candidate details', i, candidate, candidatesCount)
          if(error) { console.log('Failed to get candidate details', i, candidate)}
          let id = candidate[0];
          let name = candidate[1];
          let voteCount = candidate[2];

          // Render candidate Result
          let candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          let candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        })
      }
      //return electionInstance.voters(App.account);
      App.contract.methods.voters(App.account).call({}, (error, hasVoted) => {
        if(error) { console.log('Oops failed to get voting', error)}
        if(hasVoted) {
          $('form').hide();
        }
        loader.hide();
        content.show();
      })
    })
    // .catch(function(error) {
    //   console.warn(error);
    // });
  },

  castVote: function() {
    let candidateId = $('#candidatesSelect').val();
      const password = "manifest";
      web3.eth.personal.unlockAccount(App.account, password, 1000000, (error, data) => {
        if(error) { console.log('Error while unlocking account-->', error);}
        App.contract.methods.vote(candidateId).send({from: App.account}, (error, result) => {
          if(error) { console.log('Oops could not vote!', error); }
          // Wait for votes to update
          console.log('voting result--->', result)
          //App.listenForEvents();
        $("#content").hide();
        $("#loader").show();
        })  
      })
    // .catch(function(err) {
    //   console.error(err);
    // });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
