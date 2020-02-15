require('dotenv').config();
var Web3 = require('web3');
var TruffleContract = require('@truffle/contract');
var fs = require('fs');
//var Gettoken = require('../server/main');
//var cors = require('cors');
var request = require('request');
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    console.log(results);
  };
async function gettoken() {
return getUrlParameter("token");
        // console.log(process.env.TOKEN_ENDPOINT);
        // let payload = {
        //     "client_id": process.env.CLIENT_ID,
        //     "client_secret": process.env.CLIENT_SECRET,
        //     "audience": process.env.TOKEN_AUDIENCE,
        //     "grant_type": "client_credentials"
        // };

        // request.post({
        //     headers: { 'content-type': 'application/json' },
        //     url: process.env.TOKEN_ENDPOINT,
        //     body: JSON.stringify(payload)
        // }, function (err, response, body) {
        //     if (err) {
        //         console.error(err);
        //         process.exit(1);
        //     }

        //     let res = JSON.parse(body);
        //     res.setHeader('Access-Control-Allow-Origin', '*');
        //     console.log(res.access_token);
            //return res.access_token;
       // });
    };

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
        //console.log(Device.DeviceIds);
        //console.log("length:",  Object.keys(Device.DeviceIds).length);
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
        //console.log("array32:", ar32);
        App.devices= ar32;

        //App.casecheck = $("#case-check").val();


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
            $('#button3').click(App.comparedata);
            $('#button4').click(App.getCompList);
            $('#button5').click(App.makeTx);
            //$('#buttonMessage').click(App.loadMessage);

    },

    randcreat: function() {
        var randomnumber=Math.random();
        console.log(' ' + randomnumber);
        App.decide(randomnumber);

    },

    decide: async function (randomnumber) {
        //var token =await gettoken();
        //console.log(token);
        const caseCount = await App.AddRole.caseCount();
        if (randomnumber<caseCount*1200/(2*60*24)){
            //console.log("select1:");
            const select = Math.floor(randomnumber*(2*60*24)/1200)+1;
            console.log(select);
            const item = await App.AddRole.cases(select);
            let bs = await App.AddRole.getarray(select);
            const buildingId = item[3];
            console.log("buildingId:",buildingId);
            //console.log("structs:",item);
            //const devlength = item[4].length;
            //console.log("devices:",bs);
            var randomnumber2=(Math.random())*bs.length;
            const select2 = Math.floor(randomnumber2);
            //console.log("select2",select2);
            var devid = bs[select2];
            //console.log("devid:",devid);
            var devidstr = web3.utils.toAscii(devid);
            console.log("device id:",devidstr);
            App.readmeasured(select, select2);
        }
    },

    readmeasured: async function (select, select2) {
        var selstr = select.toString();
        var sel2str = (select2+1).toString();
        var base = "measured";
        var measadd = base.concat(selstr.concat(sel2str));
        //console.log(measadd);
        //var jsf = $.getJSON(`./data/${measadd}.json`);
        //var jsf = $.getJSON(`./data/measured11.json`);
        //var jsf2 = JSON.parse(jsf);
        // var jsf2 = jsf.responseJSON();
        // console.log(jsf2);
        $.getJSON(`./data/${measadd}.json`, function(json) {
            var jsf = json;
            console.log(jsf); // this will show the info it in firebug console
            var jsf2 = Math.floor(parseFloat (jsf["data"][0]["attributes"]["value"]));
            console.log("Measured Temperature:" , jsf2);
            App.addval(select, jsf2);


        });
        //console.log(jsf);

        //console.log(token);



    },

    addval: async function (select, jsf2) {

        App.getMetaskAccountID();
        App.val = jsf2;


        App.contracts.AddRole.deployed().then(function(instance) {
            return instance.addValue(
                select,

                App.val,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('Temperature added',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },





    handleButtonClick: async function(event) {
        //console.log("click kard2");
        event.preventDefault();

        App.getMetaskAccountID();
        //Update values with field-entries before calling functions
        App.readForm();

        var processId = parseInt($(event.target).data('id'));
        //console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.createObject(event);
                break;
            case 2:
                return await App.fillItem(event);
                break;
            case 3:
                return await App.makeTx(event);
                break;
            case 4:
                return await App.getCompList(event);
                break;
            case 5:
                return await App.comparedata(event);
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
    getCompList: async function (event) {
        //App.getMetaskAccountID();
        //console.log("list khast");
        App.casecheck = parseInt($("#case-check").val());
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "case-id:", App.casecheck,
        );
        const CC = (await App.AddRole.compareCount()).toNumber(10);
        const diffcount = (await App.AddRole.diffCount()).toNumber(10);
        for (i=1; i<(diffcount+1); i++)
        {
            const diffadded = await App.AddRole.diffs(i);
            const diff = diffadded[1].toNumber(10);
            const CId = diffadded[2].toNumber(10);
            const time = diffadded[3].toNumber(10);
            dateObj = new Date(time * 1000);
            utcString = dateObj.toUTCString();
            if (CId == App.casecheck)
            {
                var node = document.createElement("li");
                var textnode = document.createTextNode("CaseId:" + CId + "  start time:"+ utcString + "  Tem.Diff:" + diff);
                node.appendChild(textnode);
                document.getElementById("myList").appendChild(node);
            }

        }

    },

    makeTx: async function (event) {
        //App.getMetaskAccountID();
        //console.log("Tx khast");
        App.casecheck2 = parseInt($("#case-check2").val());
        var date = new Date($("#date").val());
        App.unixTimeStamp = (Math.floor(date.getTime() / 1000));
        //App.unixTimeStamp = Date.parse($("#date").val());
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "Tx case-id:", App.casecheck2,
            "due time:", App.unixTimeStamp
        );

        await App.contracts.AddRole.deployed().then(function(instance) {
            return instance.makeTx(
                App.casecheck2,
                App.unixTimeStamp,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('execute tx',result);
        }).catch(function(err) {
            console.log(err.message);
        });
        const CC = (await App.AddRole.amount()).toString(10);
        console.log("amount:", CC);
        const CC2 = (await App.AddRole._to());
        console.log("to address:", CC2);
        const xtime = (await App.AddRole.amount()).toString(10);
        console.log("amount paid:", xtime);
    },

    comparedata: async function (event) {
        //App.getMetaskAccountID();
        //console.log("compare khast");
        App.casecheck = parseInt($("#case-check").val());
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "case-id:", App.casecheck,
        );

        // let bs = await App.AddRole.checkstruct(App.casecheck);
        // console.log(bs);
        await App.contracts.AddRole.deployed().then(function(instance) {
            return instance.checkstruct(
                App.casecheck,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('casecheck:',result);
        }).catch(function(err) {
            console.log(err.message);
        });
        const diffcount = await App.AddRole.diffCount();
        const diffadded = await App.AddRole.diffs(diffcount);
        const diff = diffadded[1].toString(10);
        //console.log("diff",diff);
        const size0 = (await App.AddRole.size0()).toString(10);
        //console.log("size0", size0);
        const CC = (await App.AddRole.compareCount()).toNumber(10);
        //console.log("compare count", CC);
        const measi = await App.AddRole.asks(CC);
        const measi2 = measi[3].toString(10);
        //console.log("measi", measi2);


        const time = ((await App.AddRole.asks(CC))[2]).toNumber(10);
        dateObj = new Date(time * 1000);
        utcString = dateObj.toUTCString();

        var node = document.createElement("li");
        var textnode = document.createTextNode("CaseId:" + App.casecheck + "  start time:"+ utcString + "    Temp.Diff:" + diff);
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
    },

    addCase: async function (event) {
        event.preventDefault();
        //var processId = parseInt($(event.target).data('id'));
        console.log(
            "Owner address:", App.OwnerAdd,
            "Contractor address:", App.ContAdd,

        );
           App.amount = parseInt($("#depo-amount").val());
           App.depoAmount = App.amount * 1000000000000000000;
        App.contracts.AddRole.deployed().then(function(instance) {
            return instance.addCase(
                App.OwnerAdd,
                App.ContAdd,
                App.buildingId,
                App.devices,
                App.amount,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('addOwner:',result);
            console.log('amount',App.depoAmount);
            //console.log('MetaID',App.metamaskAccountID);
            App.contracts.AddRole.deployed().then(function(instance) {
                return instance.addDepo(
                    {from : App.OwnerAdd,
                    value : App.depoAmount}
                );
            }).then(function(result) {
                // $("#ftc-item").text(result[tx]);
                console.log('addDepo:',result);
            }).catch(function(err) {
                console.log(err.message);
            });
        }).catch(function(err) {
            console.log(err.message);
        });

            // console.log('amount',App.depoAmount);
            // //console.log('MetaID',App.metamaskAccountID);
            // App.contracts.AddRole.deployed().then(function(instance) {
            //     return instance.addDepo(
            //         {from : App.OwnerAdd,
            //         value : App.depoAmount}
            //     );
            // }).then(function(result) {
            //     // $("#ftc-item").text(result[tx]);
            //     console.log('addDepo:',result);
            // }).catch(function(err) {
            //     console.log(err.message);
            // });


    },

    adduser: function (event) {
        //console.log("click kard1");
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
            console.log('addUser:',result);
        }).catch(function(err) {
            console.log(err.message);
        });


    },
    // addDepo: async function(event) {
    //     event.preventDefault();
    //     App.getMetaskAccountID();
    //     const amount = parseInt($("#depo-amount").val());
    //     App.depoAmount = amount * 1000000000000000000;
    //     console.log('amount',App.depoAmount);
    //     console.log('MetaID',App.metamaskAccountID);
    //     await App.contracts.AddRole.deployed().then(function(instance) {
    //         return instance.addDepo(
    //             {from : "0xC26aE747CB33B9F91E36eB1DF6fA11f615738C01",
    //             value : App.depoAmount}
    //         );
    //     }).then(function(result) {
    //         // $("#ftc-item").text(result[tx]);
    //         console.log('addDepo',result);
    //     }).catch(function(err) {
    //         console.log(err.message);
    //     });


    // },




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