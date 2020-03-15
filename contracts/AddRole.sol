pragma solidity ^0.5.0;

contract AddRole {
  // Events
  event BuildingAdded(string indexed BI);
  event CaseCreated(uint caseCount,
    address  Owner,
    address  Contractor,
    string BuildingId,
    bytes32[] TsetIDs,
    bytes32[] TIDs,
    bytes32[] RHuIDs,
    bytes32[] AQuIDs,
    uint time);

  event diffcalculated(uint diff);

// initial variables
  address payable public contractOwner;
  uint public caseCount = 0;
  uint public measurmentCount = 0;
  //uint public compareCount = 0;
  //uint public diffCount = 0;
  //uint public TxCount = 0;
  //uint public diff = 0;
  //uint public  size0 = 0;
  //uint public amount = 0;
  //uint public xtime = 0;
  uint public FMFCount = 0;
  uint public COFCount = 0;
  uint public AllfineCount = 0;
  uint public FMFaults = 0;
  uint public COFaults = 0;
  uint public NoFault = 0;

  address payable public _to;
  mapping (address => uint) private balances;

//the buildings which should be observed are saved in this struct
  struct CaseItem {
    uint CaseNumber;
    address Owner;
    address payable Contractor;
    string BuildingId;
    bytes32[] TsetIDs;
    bytes32[] TIDs;
    bytes32[] RHuIDs;
    bytes32[] AQuIDs;
    uint time;
  }

  mapping(uint => CaseItem) public cases;

  address public useraddress;
  mapping(address => bool) Users;

//measured value of different buildings are here
  struct TempVals {
    uint measurmentnumber;
    uint caseid;
    bytes32 devids;
    uint[] measures;
  }

  mapping(uint => TempVals) public values;

  // the faults of the facility manager
  struct FMFs {
    uint FMFnumber;
    uint caseid;
    bytes32 devid;
    uint time;
  }
  mapping(uint => FMFs) public FMF;



  //the faults of the contractor
  struct COFs {
    uint COFnumber;
    uint caseid;
    bytes32 devid;
    uint time;
    }
  mapping(uint => COFs) public COF;

  //no ones fault
  struct Allfines {
    uint Allfinenumber;
    uint caseid;
    bytes32 devid;
    uint time;
  }
  mapping(uint => Allfines) public Allfine;

  

  

  struct compareask {
    uint comparenumber;
    uint caseid;
    uint time;
    uint measize;
  }

  mapping(uint => compareask) public asks;

  struct diffcal {
    uint diffcalnumber;
    uint diff;
    uint caseid;
    uint time;
  }
  mapping(uint => diffcal) public diffs;

  struct TxEx {
    uint Txnumber;
    uint caseid;
    address from;
    address to;
    uint amount;
    uint time;
  }
  mapping(uint => TxEx) public Txs;

  

  modifier onlyOwner() {
        require((msg.sender == contractOwner || contractOwner == msg.sender), "caller is not the contract owner");
            _;
    }

  constructor()  public{
        contractOwner = msg.sender;
        //emit contractownerdefined(msg.sender);
    }

  //contract owner adds building owner as a user
  function boAdd(address boAddress) public onlyOwner {
        require((boAddress != address(0) && !Users[boAddress]), "The Building owner address is not correct or is already in the list");
        Users[boAddress] = true;
    }

  function isWhitelisted(address passAddress) public view returns (bool) {
        return Users[passAddress];
    }

  //adding a building and its information to the list to get checked
  function addCase(address account1, address payable account2, string memory BI, bytes32[] memory TsetIDs, bytes32[] memory TIDs, 
  bytes32[] memory RHuIDs, bytes32[] memory AQuIDs, uint depoam) public {
    require (isWhitelisted(account1),"building owner is not a user");
    require (depoam == 80,"not enoug depo");
    caseCount ++;
    uint time = block.timestamp;
    cases[caseCount] = CaseItem(caseCount, account1, account2, BI, TsetIDs, TIDs, RHuIDs, AQuIDs, time);
    emit CaseCreated(caseCount, account1, account2, BI, TsetIDs, TIDs, RHuIDs, AQuIDs, time);
  }

  //adding depo into contract account to be transfered later to the contractor and facility manager
  function addDepo() public payable {
    require (msg.value == 60 ether,"not enoug depo");
    //ContractAdd.transfer(msg.value);
    //Receive(msg.value);
  }

  //adding depo to contract owner account for gas fee of the sensor measurements
  function addDepo2() public payable {
    require (msg.value == 20 ether,"not enoug depo");
    contractOwner.transfer(20 ether);
  }

  function getarray(uint _select) public view returns (bytes32[] memory devids) {
    return cases[_select].TsetIDs;
  }

  function chekRHuid (uint _select, bytes32 _id) public view returns (bool  a) {
    a = false;
    for (uint i = 0; i<(cases[_select].RHuIDs.length); i++){
      if (cases[_select].RHuIDs[i] == _id)
      {
        a = true;
      }
    }
    return a;
  }
  function chekTid (uint _select, bytes32 _id) public view returns (bool  a) {
    a = false;
    for (uint i = 0; i<(cases[_select].TIDs.length); i++){
      if (cases[_select].TIDs[i] == _id)
      {
        a = true;
      }
    }
    return a;
  }
  function chekAQuid (uint _select, bytes32 _id) public view returns (bool  a) {
    a = false;
    for (uint i = 0; i<(cases[_select].AQuIDs.length); i++){
      if (cases[_select].AQuIDs[i] == _id)
      {
        a = true;
      }
    }
    return a;
  }

// adding measurement of sesnors and comparing them to the accepted range
 function addValue (uint  caseNo, bytes32 devid, uint[] memory measures ) public {
    measurmentCount ++;
    values[measurmentCount] = TempVals (measurmentCount, caseNo, devid, measures);
    uint time = block.timestamp;

    //here we check diffrent measures
      if ( measures[0]>225)
      {
        if(measures[1]>=205)
        {
          FMFCount ++;
          FMF[FMFCount] = FMFs(FMFCount, caseNo, devid, time);
        }
        else if(measures[1]<205 && measures[1]!=0)
        {
          COFCount ++;
          COF[COFCount] = COFs(COFCount, caseNo, devid, time);
        }
        else{
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devid, time);
        }
      }
      else if ( measures[0]<210 && measures[0]!=0)
      {
        if(((measures[1]>=185 && measures[1]<=245) || measures[1] == 10000 || measures[1] == 0 ) && ((measures[2]>=400 && measures[2]<=600) || measures[2]==10000 || measures[2]==0 ) && (measures[3] <= 1000 || measures[3] == 10000 || measures[3] == 0))
        {
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devid, time);
        }
        else if(measures[1]<185 )
        {
          FMFCount ++;
          FMF[FMFCount] = FMFs(FMFCount, caseNo, devid, time);
        }
        else
        {
          COFCount ++;
          COF[COFCount] = COFs(COFCount, caseNo, devid, time);
        }
      }
      else if ( measures[0]<=225 && measures[0]>=210)
      {
        if(((measures[1]>=185 && measures[1]<=245) || measures[1] == 10000 || measures[1] == 0 ) && ((measures[2] >= 400 && measures[2]<= 600) || measures[2] == 10000 || measures[2] == 0 ) && (measures[3]<= 1000 || measures[3] == 10000 || measures[3] == 0))
        {
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devid, time);
        }
        else
        {
          COFCount ++;
          COF[FMFCount] = COFs(COFCount, caseNo, devid, time);
        }
      }
      else{
        AllfineCount ++;
        Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devid, time);
      }
  }

    //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);
  
  //***********this add value function id for the case of 3 room measurement 
  // function addValue (uint  caseNo, bytes32[] memory devids, uint[] memory measures ) public {
  //   measurmentCount ++;
  //   values[measurmentCount] = TempVals (measurmentCount, caseNo, devids, measures);
  //   uint time = block.timestamp;

  //   for (uint i=0; i<3; i++){
  //     uint i4 = i*4;
  //     if ( measures[i4]>225)
  //     {
  //       if(measures[i4+1]>=205)
  //       {
  //         FMFCount ++;
  //         FMF[FMFCount] = FMFs(FMFCount, caseNo, devids[i], time);
  //       }
  //       else if(measures[i4+1]<205 && measures[i4+1]!=0)
  //       {
  //         COFCount ++;
  //         COF[COFCount] = COFs(COFCount, caseNo, devids[i], time);
  //       }
  //       else{
  //         AllfineCount ++;
  //         Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devids[i], time);
  //       }
  //     }
  //     else if ( measures[i4]<210 && measures[i4]!=0)
  //     {
  //       if(((measures[i4+1]>=185 && measures[i4+1]<=245) || measures[i4+1] ==10000 || measures[i4+1] ==0 ) && ((measures[i4+2]>=400 && measures[i4+2]<=600) || measures[i4+2]==10000 || measures[i4+2]==0 ) && (measures[i4+3]<= 1000 || measures[i4+3]== 10000 || measures[i4+3]== 0))
  //       {
  //         AllfineCount ++;
  //         Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devids[i], time);
  //       }
  //       else if(measures[i4+1]<185 )
  //       {
  //         FMFCount ++;
  //         FMF[FMFCount] = FMFs(FMFCount, caseNo, devids[i], time);
  //       }
  //       else
  //       {
  //         COFCount ++;
  //         COF[COFCount] = COFs(COFCount, caseNo, devids[i], time);
  //       }
  //     }
  //     else if ( measures[i4]<=225 && measures[i4]>=210)
  //     {
  //       if(((measures[i4+1]>=185 && measures[i4+1]<=245) || measures[i4+1] ==10000 || measures[i4+1] ==0 ) && ((measures[i4+2]>=400 && measures[i4+2]<=600) || measures[i4+2]==10000 || measures[i4+2]==0 ) && (measures[i4+3]<= 1000 || measures[i4+3]== 10000 || measures[i4+3]== 0))
  //       {
  //         AllfineCount ++;
  //         Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devids[i], time);
  //       }
  //       else
  //       {
  //         COFCount ++;
  //         COF[FMFCount] = COFs(COFCount, caseNo, devids[i], time);
  //       }
  //     }
  //     else{
  //       AllfineCount ++;
  //       Allfine[AllfineCount] = Allfines(AllfineCount, caseNo, devids[i], time);
  //     }
  //   }

  //   //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);
  // } *****************/

  function statusQuo (uint _caseid, uint checkstart, uint checkend) public returns (uint FMFaults, uint COFaults, uint NoFaults){
    FMFaults = 0;
    COFaults = 0;
    NoFault = 0;
    for (uint i = 1; i<(FMFCount+1); i++)
    {
      if (FMF[i].caseid == _caseid && FMF[i].time <= checkend && FMF[i].time >= checkstart)
      {
        FMFaults ++;
      }
      
    }
    for (uint i = 1; i<(COFCount+1); i++)
    {
      if (COF[i].caseid == _caseid && COF[i].time <= checkend && COF[i].time >= checkstart)
      {
        COFaults ++;
      }
      
    }
    for (uint i = 1; i<(AllfineCount+1); i++)
    {
      if (Allfine[i].caseid == _caseid && Allfine[i].time <= checkend && Allfine[i].time >= checkstart)
      {
        NoFault ++;
      }
    }

    
    return (FMFaults, COFaults, NoFault);
  }
}
// function checkstruct (uint _caseid) public returns (uint differences){
//     for (uint i=1; i<(compareCount+1); i++)
//     {
//       if ( asks[uint(i)].caseid == _caseid && asks[uint(i)].measize > size0)
//       {
//         size0 = asks[uint(i)].measize;
//       }
//     }
//     uint checktime = block.timestamp;
//     compareCount ++;
//     uint meassize = measurmentCount;
//     asks[compareCount] = compareask (compareCount, _caseid, checktime,meassize);

//     diff = 0;

//     for (uint i = size0+1; i<(meassize+1); i++)
//     {
//       if (values[i].caseid == _caseid && values[i].temp < 15)
//       {
//         diff += (15-values[i].temp);
//       }
//       if (values[i].caseid == _caseid && values[i].temp > 25)
//       {
//         diff += (values[i].temp-25);
//       }
//     }

//     //uint checktime = block.timestamp;
//     diffCount ++;
//     diffs[diffCount] = diffcal (diffCount, diff, _caseid, checktime);
//     //return diff;

//     //uint diff = checkdata (meassize, _caseid, size0);
//     emit diffcalculated (diff);
//     return diff;
//   }

//   function makeTx (uint  caseNo, uint  duedate) public {


//     xtime = cases[caseNo].time;

//     for (uint i=1; i<(TxCount+1); i++)
//     {
//       if ( Txs[uint(i)].caseid == caseNo && Txs[uint(i)].time > xtime)
//       {
//         xtime = Txs[uint(i)].time;
//       }
//     }

// require((duedate-xtime)>60, "You should wait at least one minute after your previous transaction");
//     for (uint i=1; i<(caseCount+1); i++)
//     {
//       if ( cases[uint(i)].CaseNumber == caseNo)
//       {
//         _to = cases[uint(i)].Contractor;
//       }
//     }
//     uint totdiff = 0;
//     //uint totamount = 80;
//     //uint maxamount = (80*(duedate-xtime)/63072000)*1000000000000000000;
//     uint maxamount = (80*(duedate-xtime)/3600)*1000000000000000000;

//     for (uint i=1; i<(diffCount+1); i++)
//     {
//       if ( diffs[uint(i)].caseid == caseNo && diffs[uint(i)].time > (xtime-1) && diffs[uint(i)].time < (duedate+1))
//       {
//         totdiff += diffs[uint(i)].diff;
//       }
//     }

//     amount = maxamount-(totdiff*1000000000000000000/8);
//     //amount = 2*1000000000000000000;


//     TxCount ++;
//     Txs[TxCount] = TxEx (TxCount, caseNo, contractOwner, _to, amount, duedate);

//     _to.transfer(amount);
//     //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);

//   }

  // function checkdata (uint meassize, string memory _caseid, uint size0) public returns (uint diff) {
  //   diff = 0;

  //   for (uint i = size0; i< meassize ; i++)
  //   {
  //     if (keccak256(abi.encodePacked((values[i].caseid)))  == keccak256(abi.encodePacked((_caseid)))  && values[i].temp < 15)
  //     {
  //       diff = diff + (15-values[i].temp);
  //     }
  //     if (keccak256(abi.encodePacked((values[i].caseid)))  == keccak256(abi.encodePacked((_caseid))) && values[i].temp > 25)
  //     {
  //       diff = diff + (values[i].temp-25);
  //     }
  //   }
  //   uint checktime = block.timestamp;
  //   diffCount ++;
  //   diffs[diffCount] = diffcal (diffCount, diff, _caseid, checktime);
  //   return diff;

  // }

  // // Define a function 'renounceArchitect' to renounce this role
  // function renounceArchitect() public {
  //   _removeArchitect(msg.sender);
  // }
