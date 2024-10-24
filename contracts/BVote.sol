// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BVote {
    address public admin;
    address public currentAdmin;
    mapping(uint256 => address) public relayers; // constituency => relayer

    struct Party {
        uint256 partyNumber;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bytes32 hashedPassword;
        bool hasVoted;
        uint256 constituency;
        uint256 partyVoted;
    }

    mapping(bytes32 => Voter) public voters;
    mapping(uint256 => Party) public partyList;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCount; // constituency => party => count
    mapping(uint256 => bool) public partyNumbers; // Track used party numbers
    mapping(string => bool) public partyNames; // Track used party names
    mapping(bytes32 => bool) public loggedInVoters; // Track logged-in voters

    uint256 public numParties; // Track the number of parties

    constructor() {
        admin = msg.sender;
        currentAdmin = msg.sender;
        numParties = 0;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyRelayer(uint256 _constituency) {
        require(msg.sender == relayers[_constituency], "Only relayer for the constituency can call this function");
        _;
    }

    modifier onlyLoggedIn(bytes32 _voterIdHash) {
        require(loggedInVoters[_voterIdHash], "Voter not logged in");
        _;
    }

    function setAdmin(address _newAdmin) public onlyAdmin {
        currentAdmin = _newAdmin;
    }

    function setRelayer(uint256 _constituency, address _relayer) public onlyAdmin {
        relayers[_constituency] = _relayer;
    }

    function registerParty(uint256 _partyNumber, string memory _name) public onlyAdmin {
    require(!partyNumbers[_partyNumber], "Party number already used");
    require(!partyNames[_name], "Party name already used");

    partyList[_partyNumber] = Party(_partyNumber, _name, 0);
    partyNumbers[_partyNumber] = true;
    partyNames[_name] = true;
    numParties++;
}

    function registerVoter(bytes32 _voterIdHash, bytes32 _passwordHash, uint256 _constituency) public onlyRelayer(_constituency) {
        require(!voters[_voterIdHash].isRegistered, "Voter already registered");

        voters[_voterIdHash].isRegistered = true;
        voters[_voterIdHash].hashedPassword = keccak256(abi.encodePacked(_voterIdHash, _passwordHash));
        voters[_voterIdHash].hasVoted = false;
        voters[_voterIdHash].constituency = _constituency;
    }

    function login(bytes32 _voterIdHash, bytes32 _passwordHash) public {
     require(voters[_voterIdHash].isRegistered, "Voter is not registered");
     require(voters[_voterIdHash].hashedPassword == keccak256(abi.encodePacked(_voterIdHash, _passwordHash)), "Incorrect Password");
        loggedInVoters[_voterIdHash] = true;
    
}


    function logout(bytes32 _voterIdHash) public onlyRelayer(voters[_voterIdHash].constituency) onlyLoggedIn(_voterIdHash) {

        loggedInVoters[_voterIdHash] = false;
    }

    function vote(uint256 _partyNumber, bytes32 _voterIdHash) public onlyRelayer(voters[_voterIdHash].constituency) onlyLoggedIn(_voterIdHash) {
        require(voters[_voterIdHash].isRegistered, "Voter not registered");
        require(!voters[_voterIdHash].hasVoted, "Voter already voted");
        //require(partyList[_partyNumber].voteCount >= 0, "Party does not exist");

        uint256 constituency = voters[_voterIdHash].constituency;

        voters[_voterIdHash].hasVoted = true;
        voters[_voterIdHash].partyVoted = _partyNumber;

        voteCount[constituency][_partyNumber]++;
        partyList[_partyNumber].voteCount++;
    }

    // ... (the rest of the functions remain the same) ...
    function getPartyVoteCountByConstituency(uint256 _constituency, uint256 _partyNumber) public view returns (uint256) {
        return voteCount[_constituency][_partyNumber];
    }

    function getPartyVoteCountByParty(uint256 _partyNumber) public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 1; i <= numParties; i++) {
            totalVotes += voteCount[i][_partyNumber];
        }
        return totalVotes;
    }

    function getTotalVotes(/*uint256 _partyNumber*/) public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 1; i <= numParties; i++) {
            totalVotes += partyList[i].voteCount;
        }
        return totalVotes;
    }

    function getCurrentAdmin() public view returns (address) {
        return currentAdmin;
    }
}