require('dotenv').config();
var Web3 = require('web3');
var TruffleContract = require('@truffle/contract');
var fs = require('fs');
const http = require('http');
const https = require('https');

App = {


    web3Provider: null,
    contracts: {},
    currentAccount:{},
    init: async function () {

        return await App.initWeb3();
    },

    initWeb3 : async function (){

       if (window.ethereum) {
           console.log("if 1");
        App.web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.error("User denied account access")
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        console.log("if 2");
        App.web3Provider = window.web3.currentProvider;
    }

    else {
        console.log("if 3");
        //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        App.web3Provider = new Web3.providers.HttpProvider(process.env.Infura_API_Key);
    }
        console.log(App.web3Provider);

        App.getMetaskAccountID();

        return  await App.initContractPerformanceCheck();
    },

    // fetches field entries
    readForm: function () {
        App.ContAdd = $("#contractor-add").val();
        App.FMAdd = $("#FM-add").val();
        App.OwnerAdd = $("#owner-add").val();
        App.buildingId = $("#Building-Id").val();
        /// T SetPoint
        var a= $("#Device1").val();
        var Device = JSON.parse( a) ;

        //console.log(Device.data);
        var length = Object.keys(Device.data).length;
        console.log("length:",  Object.keys(Device.data).length);
        var ar = new Array;
        var ar32 = new Array;
        for (i=0; i<length; i++)
        {
            ar[i]= Device.data[i].attributes.source.id;
        }

        for (i=0; i<length; i++)
        {
            ar32[i]= web3.utils.asciiToHex((ar[i]));

        }

        App.TSetPdevices= ar32;
        // Room T
        var a= $("#Device2").val();
        var Device = JSON.parse( a) ;

        console.log(Device.data);
        var length = Object.keys(Device.data).length;
        console.log("length:",  Object.keys(Device.data).length);
        var ar = new Array;
        var ar32 = new Array;
        for (i=0; i<length; i++)
        {
            ar[i]= Device.data[i].attributes.source.id;
        }

        for (i=0; i<length; i++)
        {
            ar32[i]= web3.utils.asciiToHex((ar[i]));
        }
        App.Tdevices= ar32;

        // Rlative Humidity
        var a= $("#Device3").val();
        var Device = JSON.parse( a) ;
        var length = Object.keys(Device.data).length;
        console.log(Device.data);
        console.log("length:",  Object.keys(Device.data).length);

        var ar = new Array;
        var ar32 = new Array;
        for (i=0; i<length; i++)
        {
            ar[i]= Device.data[i].attributes.source.id;
        }

        for (i=0; i<length; i++)
        {
            ar32[i]= web3.utils.asciiToHex((ar[i]));

        }
        console.log("array32:", ar32);
        App.RHudevices= ar32;

        // Air Quality
        var a= $("#Device4").val();
        var Device = JSON.parse( a) ;
        var length = Object.keys(Device.data).length;
        console.log(Device.data);

        console.log("length:",  Object.keys(Device.data).length);
        var ar = new Array;
        var ar32 = new Array;
        for (i=0; i<length; i++)
        {
            ar[i]= Device.data[i].attributes.source.id;
        }
        for (i=0; i<length; i++)
        {
            ar32[i]= web3.utils.asciiToHex((ar[i]));

        }
        App.AQudevices= ar32;



    },


    getMetaskAccountID: async function () {

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



    initContractPerformanceCheck : async function (){

        await $.getJSON('PerformanceCheck.json',function(data){
            var PerformanceCheckArtifact = data;
            App.contracts.PerformanceCheck = TruffleContract(PerformanceCheckArtifact);
            App.contracts.PerformanceCheck.setProvider(App.web3Provider);
            console.log ("App.contracts.PerformanceCheck", App.contracts.PerformanceCheck);

        });

        App.fetchEvents();
        App.PerformanceCheck = await App.contracts.PerformanceCheck.deployed();
        console.log ("App.PerformanceCheck", App.PerformanceCheck);

    const FMFCount = (await App.PerformanceCheck.FMFCount()).toString(10);
    const COFCount = (await App.PerformanceCheck.COFCount()).toString(10);
    const AllfineCount = (await App.PerformanceCheck.AllfineCount()).toString();
    console.log("FMFCount:", FMFCount);
    console.log("COFCount:", COFCount);
    console.log("AllfineCount:", AllfineCount);
        return App.bindEvents();
    },

    bindEvents: function() {


            $('#button1').click(App.handleButtonClick);
            $('#button2').click(App.adduser);
            $('#button3').click(App.statusquoFM);
            $('#button4').click(App.statusquoCO);
            $('#button6').click(App.statusquoAll);
            $('#button5').click(App.makeTx);
            //$('#buttonMessage').click(App.loadMessage);

    },


    addval: async function (select, jsf2) {

        App.getMetaskAccountID();
        App.val = jsf2;
        const contractowner = await App.PerformanceCheck.contractOwner();


        App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.addValue(
                select,
                App.val,
                {from: contractowner}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('Temperature added',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },





    handleButtonClick: async function(event) {
        
        event.preventDefault();

        App.getMetaskAccountID();
      
        App.readForm();

        var processId = parseInt($(event.target).data('id'));
        

        switch(processId) {
            case 1:
                return await App.statusquoAll(event);
                break;
            case 2:
                return await App.fillItem(event);
                break;
            case 3:
                return await App.makeTx(event);
                break;
            case 4:
                return await App.statusquoCO(event);
                break;
            case 5:
                return await App.statusquoFM(event);
                break;
            case 6:
                return await App.addCase(event);
                break;
            case 7:
                return await App.adduser(event);
                break;
            }
    },



    makeTx: async function (event) {
        App.getMetaskAccountID();
        App.casecheck2 = $("#case-check2").val();
        App.COreceiver = $("#receiver1").val();
        App.FMreceiver = $("#receiver2").val();
        event.preventDefault();
        console.log(
            "Tx case-id:", App.casecheck2,
        );

        await App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.makeTx(
                App.casecheck2,
                App.COreceiver,
                App.FMreceiver,
                {from: App.metamaskAccountID}
            );
        }).then( async function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('execute tx',result);
            const paid = (await App.PerformanceCheck.amountCO()).toString(10);
        console.log("amount paid CO:", paid);
        const paid2 = (await App.PerformanceCheck.amountFM()).toString(10);
        console.log("amount paid FM:", paid2);
        const state = (await App.PerformanceCheck.state()).toString(10);
        console.log("state:", state);
        const stime = (await App.PerformanceCheck.stime()).toString(10);
        console.log("stime:", stime);
        const xtime = (await App.PerformanceCheck.xtime()).toString(10);
        console.log("xtime:", xtime);
        const txnu = await App.PerformanceCheck.TxCount();
        const Txtime = ((await App.PerformanceCheck.Txs(txnu))[7]).toString(10);
        console.log("Tx time", Txtime);
        const boo = ((await App.PerformanceCheck.b())).toString(10);
        console.log("boolean", boo);
        }).catch(function(err) {
            console.log(err.message);
        });

        
        
        const paid = (await App.PerformanceCheck.amountCO()).toString(10);
        console.log("amount paid CO:", paid);
        const paid2 = (await App.PerformanceCheck.amountFM()).toString(10);
        console.log("amount paid FM:", paid2);
        const state = (await App.PerformanceCheck.state()).toString(10);
        console.log("state:", state);
        const stime = (await App.PerformanceCheck.stime()).toString(10);
        console.log("stime:", stime);
        const xtime = (await App.PerformanceCheck.xtime()).toString(10);
        console.log("xtime:", xtime);
        const txnu = await App.PerformanceCheck.TxCount();
        const Txtime = ((await App.PerformanceCheck.Txs(txnu))[7]).toString(10);
        console.log("Tx time", Txtime);
        const boo = ((await App.PerformanceCheck.b())).toString(10);
        console.log("boolean", boo);
    },

    statusquoFM: async function (event) {

        App.casecheck = $("#case-check").val();
        var chs = new Date($("#check-start").val());
        App.checkstart = (Math.floor(chs.getTime() / 1000));
        var che = new Date($("#check-end").val());
        App.checkend = (Math.floor(che.getTime() / 1000));

        event.preventDefault();
        console.log(
            "case-id:", App.casecheck,
        );


        App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.statusQuoFM(
                App.casecheck,
                App.checkstart,
                App.checkend,
                {from: App.metamaskAccountID}
            );
        }).then(async function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('casecheck:',result);
                    var FMF = (await App.PerformanceCheck.FMFaults()).toNumber(10);

        console.log("For Case 1 the minus points for Facility Manager are: ",FMF, " .");

        var node = document.createElement("li");
        var textnode = document.createTextNode("CaseId: " + App.casecheck +"  the minus points for Facility Manager are: "+FMF+ " .");
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    statusquoCO: async function (event) {

        App.casecheck = $("#case-check").val();
        var chs = new Date($("#check-start").val());
        App.checkstart = (Math.floor(chs.getTime() / 1000));
        var che = new Date($("#check-end").val());
        App.checkend = (Math.floor(che.getTime() / 1000));

        event.preventDefault();
        console.log(
            "case-id:", App.casecheck,
        );


        App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.statusQuoCO(
                App.casecheck,
                App.checkstart,
                App.checkend,
                {from: App.metamaskAccountID}
            );
        }).then(async function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('casecheck:',result);

        const COF = (await App.PerformanceCheck.COFaults()).toString(10);

        console.log("For Case 1 the minus points Contratcor are: ", COF," .");

        var node = document.createElement("li");
        var textnode = document.createTextNode("CaseId: " + App.casecheck +"  the minus points for Contratcor are: "+ COF+" ." );
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
        }).catch(function(err) {
            console.log(err.message);
        });

    },

    statusquoAll: async function (event) {

        App.casecheck = $("#case-check").val();
        var chs = new Date($("#check-start").val());
        App.checkstart = (Math.floor(chs.getTime() / 1000));
        var che = new Date($("#check-end").val());
        App.checkend = (Math.floor(che.getTime() / 1000));

        event.preventDefault();
        console.log(
            "case-id:", App.casecheck,
        );


        App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.statusQuoAll(
                App.casecheck,
                App.checkstart,
                App.checkend,
                {from: App.metamaskAccountID}
            );
        }).then(async function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('casecheck:',result);

        const NoF = (await App.PerformanceCheck.NoFault()).toString(10);
        console.log("For Case 1 the minus points non are:" , NoF, " .");

        var node = document.createElement("li");
        var textnode = document.createTextNode("CaseId: " + App.casecheck +"  the minus points for non are:" +NoF+" .");
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
        }).catch(function(err) {
            console.log(err.message);
        });
    },


    addCase: async function (event) {
        event.preventDefault();

        console.log(
            "Owner address:", App.OwnerAdd,
            "Contractor address:", App.ContAdd,

        );
           App.amount = parseInt($("#depo-amount").val());
           if (App.amount == 80){
            App.depoAmount1 = 11 * 1000000000000000000;
            App.depoAmount2 = 20 * 1000000000000000000;

           }
           App.Erate = parseInt($("#Erate").val());


           App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.addDepo(
                {from : App.OwnerAdd,
                value : (App.depoAmount1)}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('addDepo1:',result);

                App.contracts.PerformanceCheck.deployed().then(function(instance) {
                    return instance.addCase(
                        App.OwnerAdd,
                        App.ContAdd,
                        App.FMAdd,
                        App.buildingId,
                        App.TSetPdevices,
                        App.Tdevices,
                        App.RHudevices,
                        App.AQudevices,
                        App.depoAmount1/1000000000000000000,
                        App.Erate,
                        {from: App.metamaskAccountID}
                    );
                }).then(function(result) {
                    // $("#ftc-item").text(result[tx]);
                    console.log('addOwner:',result);
                }).catch(function(err) {
                    console.log(err.message);
                });




        }).catch(function(err) {
            console.log(err.message);
        });

    },

    adduser: function (event) {
        event.preventDefault();

        App.getMetaskAccountID();
        
        App.UserAdd = $("#user-add").val();
        event.preventDefault();
        
        console.log(
            "User address:", App.UserAdd,


        );

        App.contracts.PerformanceCheck.deployed().then(function(instance) {
            return instance.boAdd(
                App.UserAdd,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            console.log('addUser:',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },


    fetchEvents: function () {
        if (typeof App.contracts.PerformanceCheck.currentProvider.sendAsync !== "function") {
            App.contracts.PerformanceCheck.currentProvider.sendAsync = function () {
                return App.contracts.PerformanceCheck.currentProvider.send.apply(
                App.contracts.PerformanceCheck.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.PerformanceCheck.deployed().then(function(instance) {
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


 