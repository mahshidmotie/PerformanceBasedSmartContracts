pragma solidity ^0.5.0;

contract PerformanceCheck {
  // Events
  event BuildingAdded(string indexed BI);
  event CaseCreated(uint caseCount,
    address  Owner,
    address  Contractor,
    address FM,
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
  uint public EmeasurmentCount = 0;
  //uint public compareCount = 0;
  //uint public diffCount = 0;
  uint public TxCount = 0;
  //uint public diff = 0;
  //uint public  size0 = 0;
  uint public amountCO = 0;
  uint public amountFM = 0;
  uint public xtime = 0;
  uint public FMFCount = 0;
  uint public COFCount = 0;
  uint public AllfineCount = 0;
  uint public FMFaults = 0;
  uint public COFaults = 0;
  uint public NoFault = 0;
  uint public state = 0;
  uint public stime = 0;
  bool public b = false;

  address payable public _toCo;
  address payable public _toFM;
  mapping (address => uint) private balances;

//the buildings which should be observed are saved in this struct
  struct CaseItem {
    uint CaseNumber;
    address Owner;
    address payable Contractor;
    address payable FM;
    string BuildingId;
    bytes32[] TsetIDs;
    bytes32[] TIDs;
    bytes32[] RHuIDs;
    bytes32[] AQuIDs;
    uint time;
    uint Erate;
  }

  mapping(uint => CaseItem) public cases;

  address public useraddress;
  mapping(address => bool) Users;



//measured value of different buildings are here
  struct TempVals {
    uint measurmentnumber;
    bytes32 devids;
    uint[] measures;
    string buid;
  }

  mapping(uint => TempVals) public values;

  struct EVals {
    uint measurmentnumber;
    uint measures;
    string buid;
    uint time;
  }

  mapping(uint => EVals) public Evalues;

  // the faults of the facility manager
  struct FMFs {
    uint FMFnumber;
    bytes32 devid;
    uint time;
    string buid;
  }
  mapping(uint => FMFs) public FMF;



  //the faults of the contractor
  struct COFs {
    uint COFnumber;
    bytes32 devid;
    uint time;
    string buid;
    }
  mapping(uint => COFs) public COF;

  //no ones fault
  struct Allfines {
    uint Allfinenumber;
    bytes32 devid;
    uint time;
    string buid;
  }
  mapping(uint => Allfines) public Allfine;

  struct TxEx {
    uint Txnumber;
    string buid;
    address from;
    address toCo;
    uint amCO;
    address toFM;
    uint amFM;
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
  function addCase(address account1, address payable account2, address payable account3, string memory BI, bytes32[] memory TsetIDs,
   bytes32[] memory TIDs, bytes32[] memory RHuIDs, bytes32[] memory AQuIDs, uint depoam, uint Erate) public {
    require (isWhitelisted(account1),"building owner is not a user");
    //require (isWhitelisted(account2),"building owner is not a user");
    //require (isWhitelisted(account3),"building owner is not a user");
    require (depoam == 11,"not enoug depo");
    caseCount ++;
    uint time = block.timestamp;
    cases[caseCount] = CaseItem(caseCount, account1, account2, account3, BI, TsetIDs, TIDs, RHuIDs, AQuIDs, time, Erate);
    emit CaseCreated(caseCount, account1, account2, account3, BI, TsetIDs, TIDs, RHuIDs, AQuIDs, time);
  }

  //adding depo into contract account to be transfered later to the contractor and facility manager
  function addDepo() public payable {
    require (msg.value == 11 ether,"not enoug depo");
    //ContractAdd.transfer(msg.value);
    //Receive(msg.value);
  }

  //adding depo to contract owner account for gas fee of the sensor measurements
  // function addDepo2() public payable {
  //   require (msg.value == 20 ether,"not enoug depo");
  //   contractOwner.transfer(20 ether);
  // }

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
 function addValue (bytes32 devid, uint[] memory measures, string memory buid ) public {
    measurmentCount ++;
    values[measurmentCount] = TempVals (measurmentCount, devid, measures, buid);
    uint time = block.timestamp;

    //here we check diffrent measures
      if ( measures[0]>220)
      {
        if(measures[1]>=200)
        {
          FMFCount ++;
          FMF[FMFCount] = FMFs(FMFCount, devid, time, buid);
        }
        else if(measures[1]<200 && measures[1]!=0)
        {
          COFCount ++;
          COF[COFCount] = COFs(COFCount, devid, time, buid);
        }
        else{
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, devid, time, buid);
        }
      }
      else if ( measures[0]<200 && measures[0]!=0)
      {
        if(((measures[1]>=180 && measures[1]<=250) || measures[1] == 10000 || measures[1] == 0 ) && ((measures[2]>=200 && measures[2]<=600) || measures[2]==10000 || measures[2]==0 ) && (measures[3] <= 1000 || measures[3] == 10000 || measures[3] == 0))
        {
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, devid, time, buid);
        }
        else if(measures[1]<180 )
        {
          FMFCount ++;
          FMF[FMFCount] = FMFs(FMFCount, devid, time, buid);
        }
        else
        {
          COFCount ++;
          COF[COFCount] = COFs(COFCount, devid, time, buid);
        }
      }
      else if ( measures[0]<=220 && measures[0]>=200)
      {
        if(((measures[1]>=180 && measures[1]<=255) || measures[1] == 10000 || measures[1] == 0 ) && ((measures[2] >= 200 && measures[2]<= 600) || measures[2] == 10000 || measures[2] == 0 ) && (measures[3]<= 1000 || measures[3] == 10000 || measures[3] == 0))
        {
          AllfineCount ++;
          Allfine[AllfineCount] = Allfines(AllfineCount, devid, time, buid);
        }
        else
        {
          COFCount ++;
          COF[FMFCount] = COFs(COFCount, devid, time, buid);
        }
      }
      else{
        AllfineCount ++;
        Allfine[AllfineCount] = Allfines(AllfineCount, devid, time, buid);
      }
  }
  function addEValue ( uint measures, string memory buid ) public {
    EmeasurmentCount ++;
    uint time = block.timestamp;
    Evalues[measurmentCount] = EVals (EmeasurmentCount, measures, buid, time);
  }
  function statusQuoFM (string memory _buid, uint checkstart, uint checkend) public {
    FMFaults = 0;
    for (uint i = 1; i<(FMFCount+1); i++)
    {
      if (keccak256(abi.encodePacked((FMF[i].buid))) == keccak256(abi.encodePacked((_buid))) &&
      FMF[i].time <= checkend && FMF[i].time >= checkstart)
      {
        FMFaults ++;
      }
    }
  }
   function statusQuoCO (string memory _buid, uint checkstart, uint checkend) public {
    COFaults = 0;

    for (uint i = 1; i<(COFCount+1); i++)
    {
      if (keccak256(abi.encodePacked((COF[i].buid))) == keccak256(abi.encodePacked((_buid))) &&
      COF[i].time <= checkend && COF[i].time >= checkstart)
      {
        COFaults ++;
      }
    }
  }
   function statusQuoAll (string memory _buid, uint checkstart, uint checkend) public {
    NoFault = 0;
    for (uint i = 1; i<(AllfineCount+1); i++)
    {
      if (keccak256(abi.encodePacked((Allfine[i].buid))) == keccak256(abi.encodePacked((_buid))) &&
      Allfine[i].time <= checkend && Allfine[i].time >= checkstart)
      {
        NoFault ++;
      }
    }
  }



  function makeTx (string memory _buid, address payable COreceiver, address payable FMreceiver) public {
    require (isWhitelisted(msg.sender),"msg sender is not a user");
    b = false;
    uint Cid = 0;
    uint Erate = 0;
    for (uint i=1; i<(caseCount+1); i++)
    {
      if ( keccak256(abi.encodePacked(( cases[uint(i)].BuildingId))) == keccak256(abi.encodePacked((_buid))) &&
      cases[uint(i)].Contractor == COreceiver && cases[uint(i)].FM == FMreceiver)
      {
        Cid = i;
        _toCo = cases[uint(i)].Contractor;
        _toFM = cases[uint(i)].FM;
        Erate = cases[uint(i)].Erate;
        xtime = cases[uint(i)].time;
        stime = xtime;
        b = true;
        state = 1;
      }
    }
    require (b == true, "Wrong building Id");
    state = 2;
    uint time = block.timestamp;

    
    state = 3;
    for (uint i = 1; i<(TxCount+1); i++)
    {
      if ( keccak256(abi.encodePacked(( Txs[uint(i)].buid))) == keccak256(abi.encodePacked((_buid))) && Txs[uint(i)].time > xtime)
      {
        xtime = Txs[uint(i)].time;

      }

    }
    require ((time-xtime)>=43200, "You should wait at least four minute after your previous transaction");
    uint totdiff1 = 0;
    uint Esum = 0;
    uint EsumCount = 0;
    uint totdiff2 = 0;
    uint maxamount = 0;
    //uint maxamount = (80*(duedate-xtime)/63072000)*1000000000000000000;
    uint sixmonthamount = (5)*1000000000000000000;
    if ((time - stime) <= 6*43200){
      state = 4;
      if ((time-xtime) >= 43200 && (time-xtime) < 2*43200)
      {
      maxamount = sixmonthamount * 1;
      time = xtime + 43200;
      }
      else if ((time-xtime) >= 2*43200 && (time-xtime) < 3*43200 )
      {
      maxamount = sixmonthamount * 2;
      time = xtime + 2*43200;
      }
      else if ((time-xtime) >= 3*43200 && (time-xtime) < 4*43200 )
      {
      maxamount = sixmonthamount * 3;
      time = xtime + 3*43200;
      }
      else if ((time-xtime) >= 4*43200 && (time-xtime) < 5*43200 )
      {
      maxamount = sixmonthamount * 4;
      time = xtime + 4*43200;
      }
      else if ((time-xtime) >= 5*43200 && (time-xtime) < 6*43200)
      {
      maxamount = sixmonthamount * 5;
      time = xtime + 5*43200;
      }
      else {
      maxamount = 0;
      state = 5;
      }
    }
    else  {
      state = 6;
      if (xtime == stime){
        maxamount = sixmonthamount * 6;
      }
      else if ((xtime-stime) == 43200){
        maxamount = sixmonthamount * 5;
      }
      else if ((xtime-stime) == 2*43200){
        maxamount = sixmonthamount * 4;
      }
      else if ((xtime-stime) == 3*43200){
        maxamount = sixmonthamount * 3;
      }
      else if ((xtime-stime) == 4*43200){
        maxamount = sixmonthamount * 2;
      }
      else if ((xtime-stime) == 5*43200){
        maxamount = sixmonthamount * 1;
      }
      else{
        maxamount = 0;
        state = 7;
      }

      time = stime+6*43200;
      //cases.remove(Cid);
      for (uint i = Cid; i<(caseCount); i++)
      {
        cases[i+1].CaseNumber = i;
        cases[i] = cases[i+1];
      }
      caseCount = caseCount-1;
    }
    for (uint i = 1; i<(EmeasurmentCount+1); i++)
    {
      // if ( FMF[uint(i)].caseid == caseNo && FMF[uint(i)].time > (xtime-1) && FMF[uint(i)].time < (time+1))
      if ( keccak256(abi.encodePacked(( Evalues[uint(i)].buid))) == keccak256(abi.encodePacked((_buid))) && Evalues[uint(i)].time < time &&
      Evalues[uint(i)].time >= xtime )
      {
        EsumCount ++;
        Esum += Evalues[uint(i)].measures;
      }
    }
    for (uint i = 1; i<(COFCount+1); i++)
    {
      // if ( FMF[uint(i)].caseid == caseNo && FMF[uint(i)].time > (xtime-1) && FMF[uint(i)].time < (time+1))
      if ( keccak256(abi.encodePacked(( COF[uint(i)].buid))) == keccak256(abi.encodePacked((_buid))) && COF[uint(i)].time < time &&
      COF[uint(i)].time >= xtime )
      {
        totdiff1 ++;
      }
    }

    for (uint i = 1; i<(FMFCount+1); i++)
    {
      // if ( FMF[uint(i)].caseid == caseNo && FMF[uint(i)].time > (xtime-1) && FMF[uint(i)].time < (time+1))
      if ( keccak256(abi.encodePacked(( FMF[uint(i)].buid))) == keccak256(abi.encodePacked((_buid))) &&
      FMF[uint(i)].time < time && FMF[uint(i)].time >= xtime )
      {
        totdiff2 ++;
      }
    }


    if (EsumCount>0){
      if ((Esum*100/(EsumCount*Erate))>150){
      if ((maxamount/sixmonthamount*250)>totdiff1 && (maxamount/sixmonthamount*150)<totdiff1 ){
        totdiff2 += 200;
      }
      else if ((maxamount/sixmonthamount*150)>=totdiff1 && (maxamount/sixmonthamount*50)<totdiff1 ){
        totdiff2 += 350;
      }
      else {
        totdiff2 += 500;
      }
    }

    else if ((Esum*100/(EsumCount*Erate))<=150 && (Esum*100/(EsumCount*Erate))>120){
      if ((maxamount/sixmonthamount*250)>totdiff1 && (maxamount/sixmonthamount*150)<totdiff1 ){
        totdiff2 += 100;
      }
      if ((maxamount/sixmonthamount*150)>=totdiff1 && (maxamount/sixmonthamount*50)<totdiff1 ){
        totdiff2 += 200;
      }
      if ((maxamount/sixmonthamount*50)>=totdiff1){
        totdiff2 += 300;
      }
    }
    }
 


    amountCO = maxamount-(totdiff1*1000000000000000000/100);
    amountFM = maxamount-(totdiff2*1000000000000000000/100);
    //amount = 2*1000000000000000000;


    TxCount ++;
    Txs[TxCount] = TxEx (TxCount, _buid, contractOwner, _toCo, amountCO, _toFM, amountFM, time);

    _toCo.transfer(amountCO);
    _toFM.transfer(amountFM);
    //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);

  }
 }

