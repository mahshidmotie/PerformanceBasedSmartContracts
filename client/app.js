var Web3 = require('web3');
var TruffleContract = require('@truffle/contract');
var fs = require('fs')
App = {
    //Initialize variables (TODO: needed?)

    web3Provider: null,
    contracts: {},
    currentAccount:{},
    init: async function () {
        //App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    initWeb3 : async function (){
        if (process.env.MODE == 'development' || typeof window.web3 === 'undefined'){
            App.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else{
             App.web3Provider = web3.currentProvider;
        }
        web3 = new Web3(App.web3Provider);

        App.getMetaskAccountID();

        return  await App.initContractAddRole();
    },

    // fetches field entries
    readForm: function () {
        App.ContAdd = $("#contractor-add").val();
        App.OwnerAdd = $("#owner-add").val();
        App.buildingId = $("#Building-Id").val();
        var a= $("#Device").val();
        var Device = JSON.parse( a) ;
        var length = Object.keys(Device.DeviceIds).length;
        console.log(Device.DeviceIds);
        console.log("length:",  Object.keys(Device.DeviceIds).length);
        var ar = new Array;
        var ar32 = new Array;
        for (i=0; i<length; i++)
        {
            ar[i]= Device.DeviceIds[i].key;

        }
        console.log("array:", ar);
        for (i=0; i<length; i++)
        {
            ar32[i]= web3.utils.asciiToHex(Device.DeviceIds[i].key);

        }
        console.log("array32:", ar32);
        App.devices= ar32;


        //console.log(App.devices);
        // fs.writeFile(App.buildingId + ".json", App.devices, 'utf8', function (err) {
        //     if (err) {
        //         console.log("An error occured while writing JSON Object to File.");
        //         return console.log(err);
        //     }

        //     console.log("JSON file has been saved.");
        // });
        //console.log("json device:", App.devices);
        //console.log("json length:"App.devices["DeviceIds"].si );
    },


    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },


    initContractAddRole : async function (){

        await $.getJSON('AddRole.json',function(data){
            var AddRoleArtifact = data;
            App.contracts.AddRole = TruffleContract(AddRoleArtifact);
            App.contracts.AddRole.setProvider(App.web3Provider);
            //TODO: what does this do?
            //App.makewhitelist();

        });
        App.fetchEvents();
        App.AddRole = await App.contracts.AddRole.deployed();
        setInterval(() => {
            App.randcreat()
        }, 30000);
        return App.bindEvents();
    },

    // makewhitelist: async function (){
    //     //App.getMetaskAccountID();
    //     await App.contracts.AddRole.Whitelist().call();
    // },

    // loadMessage : function (){
    //     App.contracts.AddRole.deployed().then(async function(instance){
    //         let message;
    //         if(App.currentAccount.length){
    //             message = await instance.getMessage.call({from:App.currentAccount});
    //         }
    //         else{
    //             message = await instance.getMessage.call();
    //         }
    //         App.showMessage(message);
    //     }).catch((err) =>{
    //         App.showError(err);
    //     })
    // },

    bindEvents: function() {


            $('#button1').click(App.handleButtonClick);
            $('#button2').click(App.adduser);
            //$('#buttonMessage').click(App.loadMessage);

    },

    randcreat: function() {
        var randomnumber=Math.random();
        console.log(' ' + randomnumber);
        App.decide(randomnumber);

    },

    decide: async function (randomnumber) {
        const caseCount = await App.AddRole.caseCount();
        console.log(' ' + randomnumber);
        if (randomnumber<caseCount*1200/(2*60*24)){
            console.log("select1:");
            const select = Math.floor(randomnumber*(2*60*24)/1200)+1;
            console.log(select);
            const item = await App.AddRole.cases(select);
            let bs = await App.AddRole.getarray(select);
            const buildingId = item[3];
            console.log("buildingId:",buildingId);
            //const devlength = item[4].length;
            console.log("devices:",bs);
            var randomnumber2=(Math.random())*bs.length;
            const select2 = Math.floor(randomnumber2);
            console.log("select2",select2);
            var devid = bs[select2];
            console.log("devid:",devid);
            var devidstr = web3.utils.toAscii(devid);
            console.log("devidstr:",devidstr);
        }
    },



    handleButtonClick: async function(event) {
        console.log("click kard2");
        event.preventDefault();

        App.getMetaskAccountID();
        //Update values with field-entries before calling functions
        App.readForm();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.createObject(event);
                break;
            case 2:
                return await App.fillItem(event);
                break;
            case 3:
                return await App.checkObject(event);
                break;
            case 4:
                return await App.executeLogic(event);
                break;
            case 5:
                return await App.fetchItem(event);
                break;
            case 6:
                return await App.addCase(event);
                break;
            case 7:
                return await App.adduser(event);
                break;
            }
    },

    // createObject: function(event) {
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "/ architectName:", App.architectName,
    //         "/ engineerID:", App.engineerID,
    //         "/ engineerName:", App.engineerName,
    //         "/ caller:", App.metamaskAccountID
    //     );

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.createObject(
    //             App.architectName,
    //             App.engineerID,
    //             App.engineerName,
    //             {from: App.metamaskAccountID}
    //         );
    //     }).then(function(result) {
    //         $("#ftc-item").text(result);
    //         console.log('createObject',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

    // fillItem: function (event) {
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "upc:", App.upc2,
    //         "/ data:", App.data,
    //         "/ caller:", App.metamaskAccountID
    //     );

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.fillItem(
    //             App.upc2,
    //             App.data,
    //             {from: App.metamaskAccountID}
    //         );
    //     }).then(function(result) {
    //         $("#ftc-item").text(result);
    //         console.log('fillItem',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

    // checkObject: function (event) {
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "upc:", App.upc3,
    //         "/ check:", App.check,
    //         "/ caller:", App.metamaskAccountID
    //     );

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.checkObject(
    //             App.upc3,
    //             App.check,
    //             {from: App.metamaskAccountID}
    //         );
    //     }).then(function(result) {
    //         $("#ftc-item").text(result);
    //         console.log('checkObject',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

    // executeLogic: function (event) {
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "upc:", App.upc4,
    //         "/ caller:", App.metamaskAccountID
    //     );

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.executeLogic(
    //             App.upc4,
    //             {from: App.metamaskAccountID}
    //         );
    //     }).then(function(result) {
    //         $("#ftc-item").text(result);
    //         console.log('executeLogic',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },


    // fetchItem: function () {
    // ///   event.preventDefault();
    // ///   var processId = parseInt($(event.target).data('id'));
    //     //App.upc = $('#upc').val();
    //     console.log('upc',App.upc);

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //       return instance.fetchItemBufferOne(App.upc);
    //     }).then(function(result) {
    //       $("#ftc-fetchData1").text(result);
    //       console.log('fetchItemBufferOne', result);
    //     }).catch(function(err) {
    //       console.log(err.message);
    //     });
    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.fetchItemBufferTwo.call(App.upc);
    //       }).then(function(result) {
    //         $("#ftc-fetchData2").text(result);
    //         console.log('fetchItemBufferTwo', result);
    //       }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

    addCase: function (event) {
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "Owner address:", App.OwnerAdd,
            "Contractor address:", App.ContAdd,

        );

        App.contracts.AddRole.deployed().then(function(instance) {
            return instance.addCase(
                App.OwnerAdd,
                App.ContAdd,
                App.buildingId,
                App.devices,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('addOwner',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },

    adduser: function (event) {
        console.log("click kard1");
        event.preventDefault();

        App.getMetaskAccountID();
        //Update values with field-entries before calling functions
        App.UserAdd = $("#user-add").val();
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "User address:", App.UserAdd,


        );

        App.contracts.AddRole.deployed().then(function(instance) {
            return instance.boAdd(
                App.UserAdd,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('addUser',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },

    // addEngineer: function (event) {
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "address:", App.address,
    //     );

    //     App.contracts.SupplyChain.deployed().then(function(instance) {
    //         return instance.addEngineer(
    //             App.address,
    //             {from: App.metamaskAccountID}
    //         );
    //     }).then(function(result) {
    //         $("#ftc-item").text(result);
    //         console.log('addEngineer',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });
    // },

    fetchEvents: function () {
        if (typeof App.contracts.AddRole.currentProvider.sendAsync !== "function") {
            App.contracts.AddRole.currentProvider.sendAsync = function () {
                return App.contracts.AddRole.currentProvider.send.apply(
                App.contracts.AddRole.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.AddRole.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });

    },
    init : async function (){
        await App.initWeb3();
        //App.loadMessage();
    }


};

// calls App.init()
$(function() {
    $(window).load(function() {
        $('#errorHolder').hide();
        $('#output').hide();

      App.init();
    });
  });