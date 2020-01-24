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
    bytes32[] devices);

  //event contractownerdefined(address contractOwner);

  // Defining a struct 'architects' by inheriting from 'Roles' library, struct Role
  // Roles.Role private architects;
  // Roles.Role private contractors;
  address private contractOwner;
  uint public caseCount = 0;
  struct CaseItem {
    uint CaseNumber;
    address  Owner;
    address  Contractor;
    string BuildingId;
    bytes32[] devices;
  }

  mapping(uint => CaseItem) public cases;

  address public useraddress;
  mapping(address => bool) Users;

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
  // In the constructor make the address that deploys this contract the 1st Architect
  // constructor() public {
  //   _addArchitect(msg.sender);
  // }

  // Defining a modifier that checks to see if msg.sender has the appropriate role
  // modifier onlyArchitect() {
  //   require(isArchitect(msg.sender), "sender is not an architect");
  //   _;
  // }

  // // Define a function 'isArchitect' to check this role
  // function isArchitect(address account) public view returns (bool) {
  //   return architects.has(account);
  // }

  // Define a function 'addArchitect' that adds this role
  function addCase(address account1, address account2, string memory BI, bytes32[] memory DeIDs) public {
    require (isWhitelisted(account1),"building owner is not a user" );
    caseCount ++;
    cases[caseCount] = CaseItem(caseCount, account1, account2, BI, DeIDs);
    emit CaseCreated(caseCount, account1, account2, BI, DeIDs);

  }

  function getarray(uint _select) public view returns (bytes32[] memory devids) {
    return cases[_select].devices;
  }

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

