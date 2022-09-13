import React, { Component } from "react";
import Navbar from "./Navbar";
import Main from "./Main";
import "./App.css";
import Web3 from "web3";
import DaiToken from "../abis/DaiToken.json";
import CowCoin from "../abis/CowCoin.json";
import TokenFarm from "../abis/TokenFarm.json";

class App extends Component {
  // life cycle function
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    // connect to metamask
    const web3 = window.web3;

    // set up account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // want ganache network 5777
    const networkId = await web3.eth.net.getId();
    //console.log(networkId)

    // load dai token
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      this.setState({ daiToken });
      let daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ daiTokenBalance: daiTokenBalance.toString() });
      //console.log({ balance: daiTokenBalance })
    } else {
      window.alert("DaiToken contract not deployed to detected network.");
    }

    // load cow coin
    const cowCoinData = cowCoin.networks[networkId];
    if (cowCoinData) {
      const cowCoin = new web3.eth.Contract(CowCoin.abi, cowCoinData.address);
      this.setState({ cowCoin });
      let cowCoinBalance = await cowCoin.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ cowCoinBalance: cowCoinBalance.toString() });
      console.log({ balance: cowCoinBalance });
    } else {
      window.alert("CowCoin contract not deployed to detected network.");
    }

    // load token farm
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      this.setState({ tokenFarm });
      let stakingBalance = await tokenFarm.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({ stakingBalance: stakingBalance.toString() });
    } else {
      window.alert("TokenFarm contract not deployed to detected network.");
    }

    // everything loaded
    this.setState({ loading: false });
  }

  // standard way to load up web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Etheruem browser detected. You should consider trying MetaMask!"
      );
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.daiToken.methods
      .approve(this.state.tokenFarm._address, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.tokenFarm.methods
      .unstakeTokens()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  // react contrusctor
  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      daiToken: {},
      cowCoin: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      cowCoinBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance}
          cowCoinBalance={this.state.cowCoinBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstakeTokens={this.unstakeTokens}
        />
      );
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.linkedin.com/in/mccowanzhang"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>

                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
