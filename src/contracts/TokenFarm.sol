pragma solidity ^0.5.0;

import "./CowCoin.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Cow Coin Farm";
    CowCoin public cowCoin;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(CowCoin _cowCoin, DaiToken _daiToken) public {
        cowCoin = _cowCoin;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // stake tokens (deposit)
    function stakeTokens(uint _amount) public{
        // code goes here

        // require amount greaater than 0
        require(_amount > 0, "amount cannot be 0");

        // transfer mock dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // add user to stakers array only if they havent already staked
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        // update staking status
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;

    }

    // Unstaking tokens (withdraw)
    function unstakeTokens() public {
        // fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // transfer mock dai tokens to user from contract
        daiToken.transfer(msg.sender, balance);

        // reset staking balance
        stakingBalance[msg.sender] = 0;

        // update staking status
        isStaking[msg.sender] = false;
    }

    // Issuing tokens (interest)
    function issueTokens() public {
        // only owner can call the function
        require(msg.sender == owner, "caller must be the owner");

        // issue tokens to stakers
        for (uint i = 0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                cowCoin.transfer(recipient, balance); 
            } 

        }
    }


}
