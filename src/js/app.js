var priceStorage = [];
const weiConverter = 1000000000000000000;
const contractID = "0xD8B5f6dc828e3aD0A27fC73a6409f1468Ea24911"
var currentEmblemOwner = [];

App = {
  web3Provider: null,
    contracts: {},

   

  init: function() {

    $.getJSON('../hunters.json', function(data) {
      var hunters = $('#hunterRow');
      var hunterTemplate = $('#hunterTemplate');

        
      for (i = 0; i < 8; i ++) {
        hunterTemplate.find('.panel-title').text(data[i].name);
        hunterTemplate.find('img').attr('src', data[i].picture);
          hunterTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          hunterTemplate.find('.owned-by').attr('data-id', data[i].id);
          hunterTemplate.find('.price').attr('data-id', data[i].id);

          hunters.append(hunterTemplate.html());
      }

        $.getJSON("https://api-ropsten.etherscan.io/api?module=account&action=balance&address=" + contractID + "&tag=latest&apikey=QT5E8PE5M7RPCUHVH2D6258C1PZQEVUXEQ", function(data) {
            //console.log(data.result / weiConverter );
            $('.bounty').text("Current Bounty: " + (data.result / weiConverter) + " ETH");
        });  

        $.getJSON('../emblem.json', function(meme) {
          var emblemRow = $('#emblemRow');
          var emblemTemplate = $('#emblemTemplate');
          i = 0;
            emblemTemplate.find('.panel-title').text(meme[i].name);
            emblemTemplate.find('img').attr('src', meme[i].picture);
            emblemTemplate.find('.btn-emblem').attr('data-id', meme[i].id);
            emblemTemplate.find('.owned-by').attr('data-id', meme[i].id);
            emblemTemplate.find('.price').attr('data-id', meme[i].id);

            emblemRow.append(emblemTemplate.html());
          
        })  

        
    });

    return App.initWeb3();
  },

  initWeb3: function() {

    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {

      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BountyHunter.json', function(data) {
      // Get the artifact
      var BountyhunterArtifact = data;
      App.contracts.BountyHunter = TruffleContract(BountyhunterArtifact);

      // Set the provider for our contract
        App.contracts.BountyHunter.setProvider(App.web3Provider);

        App.killFeeder();
        App.getEmblemOwner();

      // Use our contract to identify the currently hired killers
      return App.setOwner();
    });

    return App.bindEvents();

  
 
  },

  bindEvents: function() {
      $(document).on('click', '.btn-adopt', App.handleAdopt);
      $(document).on('click', '.buy-emblem', App.buyStatue);
  },


    
    setOwner: function () {
        
        return App.contracts.BountyHunter.deployed().then(function(instance) {
            adoptionInstance = instance;

            return adoptionInstance.getUsers.call()
                .then(adopters => {
                    const [ users, hunterPrices ] = adopters;
                    for (let i = 0; i < 8; i++) {
                        //console.log(`owner=${owners[i]}, price=${prices[i].valueOf()}`);
                        var initialPrice = hunterPrices[i].valueOf();
                        var currentPrice = (initialPrice * 2);
                        
 
                        //console.log(currentPrice / weiConverter);
                        priceStorage.push(currentPrice);
                        ownerAddress = $('p[data-id=' + i + ']');
                        if( users[i].substring(0,10) === " 0xc0c8dc6" )
                            ownerAddress.text("0x00000000");
                        else
                            ownerAddress.text(users[i].substring(0,9));
                            
                        priceDisplayed = $('button[data-id=' + i + ']');
                        priceDisplayed.text(("HIRE - " + currentPrice / weiConverter + " ETH"));
                        // priceStorage.push(currentPrice);

                        $.getJSON('https://api-ropsten.etherscan.io/api?module=account&action=balance&address='+ contractID + '&tag=latest&apikey=QT5E8PE5M7RPCUHVH2D6258C1PZQEVUXEQ', function(data) {
                            //console.log(data.result / weiConverter );
                            $('.bounty').text("Current Bounty: " + (data.result / weiConverter) + " ETH");
                        });    
                        App.killFeeder();
                        
                             
                    }
                });
        });
    
    },

        killFeeder: function () {
        
        return App.contracts.BountyHunter.deployed().then(function(instance) {
            adoptionInstance = instance;

            return adoptionInstance.killFeed.call()
                .then(adopters => {
                    var [killer, killed] = adopters;
                    //console.log(adopters);
                    $('.merked').text("Killfeed: " + adopters[0].substring(0,10) +  " -> " + adopters[1].substring(0,10));
                });
        });
    
    },

        getEmblemOwner: function () {
        
        return App.contracts.BountyHunter.deployed().then(function(instance) {
            adoptionInstance = instance;

            return adoptionInstance.getEmblemOwner.call()
                .then(adopters => {
                    var emblemOwner = adopters;
                    console.log(adopters);
                    parsedAddress = adopters.substring(0, 9);
                    currentEmblemOwner[0] = parsedAddress;
                    priceDisplayed = $('a[data-id=0' + ']');
                    priceDisplayed.text(("BUY EMBLEM - .01"));
                    ownerAddress = $('h4[data-id=0' + ']');
                    ownerAddress.text(parsedAddress);
                    
                });
        });
    
    },



    buyStatue: function (event) {
      var emblemID = parseInt($(event.target).data('id'))

        emblemPrice = 10000000000000000 / weiConverter;

      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }


      var account = accounts[0];
      App.contracts.BountyHunter.deployed().then(function(instance){
        adoptionInstance = instance
        return adoptionInstance.purchaseMysteriousEmblem({value: web3.toWei(emblemPrice, 'ether'), from: account, gas: 60000, gasPrice: 10000000000 });
      }).then(function(result) {
        return App.getEmblemOwner()
      }).catch(function(err) {
        console.log(err.message);
      })
      })
    },


   
  handleAdopt: function(event) {
    event.preventDefault();

    var hunterID = parseInt($(event.target).data('id'));

    var adoptionInstance;


    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BountyHunter.deployed().then(function(instance) {
        adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          sellPrice = (priceStorage[hunterID]) / weiConverter;
        return adoptionInstance.hireBountyHunter(hunterID, {value: web3.toWei(sellPrice, 'ether'), from: account, gas: 600000, gasPrice: 10000000000});
      }).then(function(result) {
        return App.setOwner();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
