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
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
        console.log(App.web3Provider);

        App.getMetaskAccountID();

        return  await App.initContractAddRole();
    },

    // fetches field entries
    readForm: function () {
        App.ContAdd = $("#contractor-add").val();
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
        { //////////in case for readinf dlt ids
            // var splittedid = (Device.data[i].id).split("-")
            // ar[i]= splittedid[0];
            // ar[i+length]= splittedid[1];
            // ar[i+length+length]= splittedid[2];
            // ar[i+length+length+length]= splittedid[3];
            // ar[i+length+length+length+length]= splittedid[4];
            ar[i]= Device.data[i].attributes.source.id;
        }
        
        for (i=0; i<length; i++)
        {//////////in case for readinf dlt ids
            // ar32[i]= web3.utils.asciiToHex((ar[i]).concat("-",(ar[i+length]).concat("-",(ar[i+length+length]))));
            // ar32[i+length]= web3.utils.asciiToHex((ar[i+length+length+length]).concat("-",(ar[i+length+length+length+length])));
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



    initContractAddRole : async function (){

        await $.getJSON('AddRole.json',function(data){
            var AddRoleArtifact = data;
            App.contracts.AddRole = TruffleContract(AddRoleArtifact);
            App.contracts.AddRole.setProvider(App.web3Provider);
            console.log ("App.contracts.AddRole", App.contracts.AddRole);

        });

        App.fetchEvents();
        App.AddRole = await App.contracts.AddRole.deployed();
        console.log ("App.AddRole", App.AddRole);
        return App.bindEvents();
    },

    bindEvents: function() {


            $('#button1').click(App.handleButtonClick);
            $('#button2').click(App.adduser);
            $('#button3').click(App.statusquo);
            $('#button4').click(App.getCompList);
            $('#button5').click(App.makeTx);
            //$('#buttonMessage').click(App.loadMessage);

    },


    addval: async function (select, jsf2) {

        App.getMetaskAccountID();
        App.val = jsf2;
        const contractowner = await App.AddRole.contractOwner();


        App.contracts.AddRole.deployed().then(function(instance) {
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
                return await App.statusquo(event);
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
    

    statusquo: async function (event) {
        
        App.casecheck = parseInt($("#case-check").val());
        var chs = new Date($("#check-start").val());
        App.checkstart = (Math.floor(chs.getTime() / 1000));
        var che = new Date($("#check-end").val());
        App.checkend = (Math.floor(che.getTime() / 1000));
        
        event.preventDefault();
        console.log(
            "case-id:", App.casecheck,
        );

 
        await App.contracts.AddRole.deployed().then(function(instance) {
            return instance.statusQuo(
                App.casecheck,
                App.checkstart,
                App.checkend,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('casecheck:',result);
        }).catch(function(err) {
            console.log(err.message);
        });
        const FMF = (await App.AddRole.FMFaults()).toString(10);
        const COF = (await App.AddRole.COFaults()).toString(10);
        const NoF = (await App.AddRole.NoFault()).toString(10);
        console.log("For Case 1 the minus points for Facility Manager are: ",FMF, ", for Contratcor are: ", COF,", and for non are:" , NoF);

        var node = document.createElement("li");
        var textnode = document.createTextNode("CaseId: " + App.casecheck +"  the minus points for Facility Manager are: "+FMF+ ", for Contratcor are: "+ COF+", and for non are:" +NoF);
        node.appendChild(textnode);
        document.getElementById("myList").appendChild(node);
      
    },

    addCase: async function (event) {
        event.preventDefault();
        
        console.log(
            "Owner address:", App.OwnerAdd,
            "Contractor address:", App.ContAdd,

        );
           App.amount = parseInt($("#depo-amount").val());
           if (App.amount == 80){
            App.depoAmount1 = 60 * 1000000000000000000;
            App.depoAmount2 = 20 * 1000000000000000000;

           }
           

           App.contracts.AddRole.deployed().then(function(instance) {
            return instance.addDepo(
                {from : App.OwnerAdd,
                value : (App.depoAmount1)}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('addDepo1:',result);

            App.contracts.AddRole.deployed().then(function(instance) {
                return instance.addDepo2(
                    {from : App.OwnerAdd,
                    value : (App.depoAmount2)
                    }
                );
            }).then(function(result) {
                // $("#ftc-item").text(result[tx]);
                console.log('addDepo2:',result);

                App.contracts.AddRole.deployed().then(function(instance) {
                    return instance.addCase(
                        App.OwnerAdd,
                        App.ContAdd,
                        App.buildingId,
                        App.TSetPdevices,
                        App.Tdevices,
                        App.RHudevices,
                        App.AQudevices,
                        App.amount,
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

            



        }).catch(function(err) {
            console.log(err.message);
        });
        /////////////should we first add case or depo?/////////////////////////////////
        // App.contracts.AddRole.deployed().then(function(instance) {
        //     return instance.addCase(
        //         App.OwnerAdd,
        //         App.ContAdd,
        //         App.buildingId,
        //         App.devices,
        //         App.amount,
        //         {from: App.metamaskAccountID}
        //     );
        // }).then(function(result) {
        //     // $("#ftc-item").text(result[tx]);
        //     console.log('addOwner:',result);
        //     console.log('amount',App.depoAmount);
        //     //console.log('MetaID',App.metamaskAccountID);
        //     App.contracts.AddRole.deployed().then(function(instance) {
        //         return instance.addDepo(
        //             {from : App.OwnerAdd,
        //             value : (App.depoAmount-20)}
        //         );
        //     }).then(function(result) {
        //         // $("#ftc-item").text(result[tx]);
        //         console.log('addDepo1:',result);
        //     }).catch(function(err) {
        //         console.log(err.message);
        //     });

        //     App.contracts.AddRole.deployed().then(function(instance) {
        //         return instance.addDepo2(
        //             {from : App.OwnerAdd
        //             }
        //         );
        //     }).then(function(result) {
        //         // $("#ftc-item").text(result[tx]);
        //         console.log('addDepo2:',result);
        //     }).catch(function(err) {
        //         console.log(err.message);
        //     });

        // }).catch(function(err) {
        //     console.log(err.message);
        // });

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

    /////not inuse, was in use when rand was in front end ***********************************

    // randcreat: function() {
    //     var randomnumber=Math.random();
    //     console.log(' ' + randomnumber);
    //     App.decide(randomnumber);

    // },

    // decide: async function (randomnumber) {
    //     //var token =await gettoken();
    //     //console.log(token);
    //     const caseCount = await App.AddRole.caseCount();
    //     //console.log(caseCount);
    //     if (randomnumber<caseCount*1200/(2*60*24)){
    //         //console.log("select1:");
    //         const select = Math.floor(randomnumber*(2*60*24)/1200)+1;
    //         console.log(select);
    //         const item = await App.AddRole.cases(select);
    //         let bs = await App.AddRole.getarray(select);
    //         const buildingId = item[3];
    //         console.log("buildingId:",buildingId);
    //         //console.log("structs:",item);
    //         //const devlength = item[4].length;
    //         //console.log("devices:",bs);
    //         var randomnumber2=(Math.random())*bs.length;
    //         const select2 = Math.floor(randomnumber2);
    //         //console.log("select2",select2);
    //         var devid = bs[select2];
    //         //console.log("devid:",devid);
    //         var devidstr = web3.utils.hexToUtf8(devid);
    //         console.log("device id:",devidstr);

    //         let iddata = {
    //             "device_id": devidstr,
    //             "building_id": buildingId
    //         };

    //         var jsf = await httpRequest("post", 'http://localhost:3000/id', JSON.stringify(iddata));
    //         console.log(jsf); // this will show the info it in firebug console
    //         var jsf2 = Math.floor(jsf.body);
    //         console.log("Measured Temperature:" , jsf2);
    //         App.addval(select, jsf2);
    //         //App.readmeasured(select, select2);
    //     }
    // },

//****************************************************************************** */
///***************************************not in use
    // getCompList: async function (event) { 
    //     //App.getMetaskAccountID();
    //     //console.log("list khast");
    //     App.casecheck = parseInt($("#case-check").val());
    //     event.preventDefault();
    //     //var processId = parseInt($(event.target).data('id'));
    //     console.log(
    //         "case-id:", App.casecheck,
    //     );
    //     const CC = (await App.AddRole.compareCount()).toNumber(10);
    //     const diffcount = (await App.AddRole.diffCount()).toNumber(10);
    //     for (i=1; i<(diffcount+1); i++)
    //     {
    //         const diffadded = await App.AddRole.diffs(i);
    //         const diff = diffadded[1].toNumber(10);
    //         const CId = diffadded[2].toNumber(10);
    //         const time = diffadded[3].toNumber(10);
    //         dateObj = new Date(time * 1000);
    //         utcString = dateObj.toUTCString();
    //         if (CId == App.casecheck)
    //         {
    //             var node = document.createElement("li");
    //             var textnode = document.createTextNode("CaseId:" + CId + "  start time:"+ utcString + "  Tem.Diff:" + diff);
    //             node.appendChild(textnode);
    //             document.getElementById("myList").appendChild(node);
    //         }

    //     }

    // },
    //************************************************************************** */


};

// calls App.init()
$(function() {
    $(window).load(function() {
        $('#errorHolder').hide();
        $('#output').hide();

      App.init();
    });
  });


  // not in use, was in use when we had random in front end *************************************
  function httpRequest(method, url, body = null) {
    if (!['get', 'post', 'head'].includes(method)) {
        throw new Error(`Invalid method: ${method}`);
    }

    let urlObject;

    try {
        urlObject = new URL(url);
    } catch (error) {
        throw new Error(`Invalid url ${url}`);
    }

    if (body && method !== 'post') {
        throw new Error(`Invalid use of the body parameter while using the ${method.toUpperCase()} method.`);
    }

    let options = {
        method: method.toUpperCase(),
        hostname: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.pathname,
        headers : {"Content-Type": "application/json"}
    };

    if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    return new Promise((resolve, reject) => {

        const clientRequest = http.request(options, incomingMessage => {

            // Response object.
            let response = {
                statusCode: incomingMessage.statusCode,
                headers: incomingMessage.headers,
                body: []
            };

            // Collect response body data.
            incomingMessage.on('data', chunk => {
                response.body.push(chunk);
            });

            // Resolve on end.
            incomingMessage.on('end', () => {
                if (response.body.length) {

                    response.body = response.body.join();

                    try {
                        response.body = JSON.parse(response.body);
                    } catch (error) {
                        // Silently fail if response is not JSON.
                    }
                }

                resolve(response);
            });
        });

        // Reject on request error.
        clientRequest.on('error', error => {
            reject(error);
        });

        // Write request body if present.
        if (body) {
            clientRequest.write(body);
        }

        // Close HTTP connection.
        clientRequest.end();
    });
};
//******************************************************************************* */