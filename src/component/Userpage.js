import logo from '../logo.svg';
import '../App.css';
import Web3 from 'web3'
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const contract_address='0x34Ec01531188B4dd61bafc18794910E9bC283083'
function Userpage() {
  // use state
  const [account, setAccount] = React.useState('')
  //fetch blockchain account data and display it
  const loadBlockchainData = async () => {
    window.ethereum.enable()
    //after enabling the account, we can get the account
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }
  // useEffect(() => {
  // loadBlockchainData()
  // }, [])
  // handle login
  const naviagate = useNavigate();
  const handle_login = async () => {
    //check if metamask is installed
    if (window.ethereum) {
      try {
        //request account access if metamask is installed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        //set account state
        setAccount(accounts[0])
        //call loadBlockchainData
        loadBlockchainData()
        //naviage to dashboard
        naviagate('/dashboard', {state : { user: account }})
      } catch (err) {
        console.log(err)
      }
    }
    //if metamask is not installed, ask user to install it
    else {
      alert('Please install metamask')
    }
  }
  return (
    <div>
      {/* <Router>
        <div>
          <Routes>
            <Route path="/dashboard" element={<Userpage />} />
          </Routes>
        </div>
      </Router> */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome to Game Account Exchanger
        </p>
        {/* // a button to sign in with metamask */}
        <button onClick={handle_login}>Enter Main Page</button>
        <p>{account}</p>
      </header>

    </div>
  );
};
export default Userpage;