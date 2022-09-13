const { assert } = require("chai");

const DaiToken = artifacts.require("DaiToken");
const CowCoin = artifacts.require("CowCoin");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("TokenFarm", ([owner, investor]) => {
  let daiToken, cowCoin, tokenFarm;

  before(async () => {
    // Load Contracts
    daiToken = await DaiToken.new();
    cowCoin = await CowCoin.new();
    tokenFarm = await TokenFarm.new(cowCoin.address, daiToken.address);

    // Transfer all Cow Coins to farm (1 million)
    await cowCoin.transfer(tokenFarm.address, tokens("1000000"));

    // Send tokens to investor
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  describe("Mock DAI deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  describe("Cow Coin deployment", async () => {
    it("has a name", async () => {
      const name = await cowCoin.name();
      assert.equal(name, "Cow Coin");
    });
  });

  describe("Token Farm deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Cow Coin Farm");
    });

    it("contract has tokens", async () => {
      let balance = await cowCoin.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });
  describe("Farming tokens", async () => {
    it("rewards investors for staking mDai tokens", async () => {
      let result;
      //check investor balance before staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Mock DAI wallet balance correct before staking"
      );

      // stake mock dai tokens
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      // check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor Mock DAI wallet balance correct after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Token Farm Mock DAI balance correct after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "true",
        "investor stakking status correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor staking balance correct after staking"
      );

      // issue tokens
      await tokenFarm.issueTokens({ from: owner });

      // check balances after issue
      result = await cowCoin.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor Cow Coin wallet balance correct after issuance"
      );

      // ensure that only owner can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      //unstake tokens
      await tokenFarm.unstakeTokens({ from: investor });

      // check results after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor mock dai wallet balance correct after staking"
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens("0"),
        "Token farm mock dai balance correct after staking"
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("0"),
        "investor staking balance correct after staking"
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "false",
        "investor staking status correct after staking"
      );
    });
  });
});
