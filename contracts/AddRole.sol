pragma solidity ^0.5.0;

// Import 'Roles' from OpenZeppelin:
import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";

// Define a contract 'ArchitectRole' to manage this role - add, remove, check
contract AddRole {
  using Roles for Roles.Role;

  // Events, one for Adding, and other for Removing
  event ArchitectAdded(address indexed account);
  event ArchitectRemoved(address indexed account);
  event ContractorAdded(address indexed account);
  event BuildingAdded(string indexed BI);
  event CaseCreated(uint caseCount,
    address  Owner,
    address  Contractor,
    string BuildingId,
    bytes32[] devices,
    uint time);

  event diffcalculated(uint diff);

  // Defining a struct 'architects' by inheriting from 'Roles' library, struct Role
  // Roles.Role private architects;
  // Roles.Role private contractors;
  address payable private contractOwner;
  uint public caseCount = 0;
  uint public measurmentCount = 0;
  uint public compareCount = 0;
  uint public diffCount = 0;
  uint public TxCount = 0;
  uint public diff = 0;
  uint public  size0 = 0;
  uint public amount = 0;
  uint public xtime = 0;
  address payable public _to;
  mapping (address => uint) private balances;
  //address payable ContractAdd = payable address(this);

  struct CaseItem {
    uint CaseNumber;
    address Owner;
    address payable Contractor;
    string BuildingId;
    bytes32[] devices;
    uint time;
  }

  mapping(uint => CaseItem) public cases;

  address public useraddress;
  mapping(address => bool) Users;

  struct TempVals {
    uint measurmentnumber;
    uint caseid;
    uint temp;
  }

  mapping(uint => TempVals) public values;

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
        require((msg.sender == contractOwner ||  contractOwner == msg.sender), "caller is not the contract owner");
            _;
    }

  constructor()  public{
        contractOwner = msg.sender;
        //emit contractownerdefined(msg.sender);
    }
  function boAdd(address boAddress) public onlyOwner {
        require((boAddress != address(0) && !Users[boAddress]), "The Building owner address is not correct or is already in the list");
        Users[boAddress] = true;
    }
  function isWhitelisted(address passAddress) public view returns (bool) {
        return Users[passAddress];
    }
  // function enoughDepo(uint depo) public view returns (bool) {
  //       bool a = false;
  //       if (depo>19990000000000000000
  //                200000000000000000000)
  //       {
  //         bool a = true;
  //       }
  //       return a;
  //   }

  function addCase(address account1, address payable account2, string memory BI, bytes32[] memory DeIDs, uint depoam) public {
    require (isWhitelisted(account1),"building owner is not a user");
    require (depoam == 80,"not enoug depo");
    caseCount ++;
    uint time = block.timestamp;
    cases[caseCount] = CaseItem(caseCount, account1, account2, BI, DeIDs, time);
    emit CaseCreated(caseCount, account1, account2, BI, DeIDs, time);
  }

  function addDepo() public payable {
    require (msg.value == 80 ether,"not enoug depo");
    //ContractAdd.transfer(msg.value);
    //Receive(msg.value);
  }

  function getarray(uint _select) public view returns (bytes32[] memory devids) {
    return cases[_select].devices;
  }

  // function addValue (uint  caseNo, uint  temp) public {
  //   measurmentCount ++;
  //   values[measurmentCount] = TempVals (measurmentCount, caseNo, temp);
  //   //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);

  // }

  function addValue (uint  caseNo, uint  temp) public {
    measurmentCount ++;
    values[measurmentCount] = TempVals (measurmentCount, caseNo, temp);
    //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);
  }



function checkstruct (uint _caseid) public returns (uint differences){
    for (uint i=1; i<(compareCount+1); i++)
    {
      if ( asks[uint(i)].caseid == _caseid && asks[uint(i)].measize > size0)
      {
        size0 = asks[uint(i)].measize;
      }
    }
    uint checktime = block.timestamp;
    compareCount ++;
    uint meassize = measurmentCount;
    asks[compareCount] = compareask (compareCount, _caseid, checktime,meassize);

    diff = 0;

    for (uint i = size0+1; i<(meassize+1); i++)
    {
      if (values[i].caseid == _caseid && values[i].temp < 15)
      {
        diff += (15-values[i].temp);
      }
      if (values[i].caseid == _caseid && values[i].temp > 25)
      {
        diff += (values[i].temp-25);
      }
    }

    //uint checktime = block.timestamp;
    diffCount ++;
    diffs[diffCount] = diffcal (diffCount, diff, _caseid, checktime);
    //return diff;

    //uint diff = checkdata (meassize, _caseid, size0);
    emit diffcalculated (diff);
    return diff;
  }

  function makeTx (uint  caseNo, uint  duedate) public {
    xtime = cases[caseNo].time;

    for (uint i=1; i<(TxCount+1); i++)
    {
      if ( Txs[uint(i)].caseid == caseNo && Txs[uint(i)].time > xtime)
      {
        xtime = Txs[uint(i)].time;
      }
    }


    for (uint i=1; i<(caseCount+1); i++)
    {
      if ( cases[uint(i)].CaseNumber == caseNo)
      {
        _to = cases[uint(i)].Contractor;
      }
    }
    uint totdiff = 0;
    //uint totamount = 80;
    uint maxamount = (80*(duedate-xtime)/63072000)*1000000000000000000;

    for (uint i=1; i<(diffCount+1); i++)
    {
      if ( diffs[uint(i)].caseid == caseNo && diffs[uint(i)].time > (xtime-1) && diffs[uint(i)].time < (duedate+1))
      {
        totdiff += diffs[uint(i)].diff;
      }
    }

    amount = maxamount-(totdiff*1000000000000000000/2);
    //amount = 2*1000000000000000000;


    TxCount ++;
    Txs[TxCount] = TxEx (TxCount, caseNo, contractOwner, _to, amount, duedate);

    _to.transfer(amount);
    //emit CaseCreated(caseCount, account1, account2, BI, DeIDs);

  }

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

  // // Define an internal function '_addArchitect' to add this role, called by 'addArchitect'
  // function _addArchitect(address account) internal {
  //   architects.add(account);
  //   emit ArchitectAdded(account);
  // }

  // // Define an internal function '_removeArchitect' to remove this role, called by 'removeArchitect
  // function _removeArchitect(address account) internal {
  //   architects.remove(account);
  //   emit ArchitectRemoved(account);
  // }

  //////////////////////////////////////////////////
  // function addContractor(address account) public onlyArchitect {
  //   _addContractor(account);
  // }

  // function _addContractor(string memory BI) internal {
  //   buildingid.add(BI);
  //   emit BuildingAdded(BI);
  // }
}

