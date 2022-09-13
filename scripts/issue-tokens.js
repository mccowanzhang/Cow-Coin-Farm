const TokenFarm = artifacts.require('TokenFarm')


// truffle exec scripts/issue-tokens.js
module.exports = async function(callback) {
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()
    
    //code goes here
    console.log("Tokens Issued!")

    callback()
  }
  