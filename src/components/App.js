import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

import Navigation from './Navigation';
import Buy from './Buy';
import Progress from './Progress';
import Info from './Info';
import Loading from './Loading';
import Whitelist from './Whitelist';  
import CountdownTimer from './CountdownTimer';
import './App.css';

import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';

import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [crowdsale, setCrowdsale] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [minTokens, setMinTokens] = useState(0);
  const [maxPurchaseTokens, setMaxPurchaseTokens] = useState(0);
  const [saleState, setSaleState] = useState('Closed');
  const [isLoading, setIsLoading] = useState(true);
  const [saleEnd, setSaleEnd] = useState(new Date('2024-12-31T23:59:59'));

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const accounts = await provider.send("eth_requestAccounts", []);
    const account = accounts[0];
    setAccount(account);
    console.log(provider)
    const { chainId } = await provider.getNetwork();
    console.log(chainId)
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
    setCrowdsale(crowdsale);

    const accountBalance = ethers.formatUnits(await token.balanceOf(account), 18);
    setAccountBalance(accountBalance);

    const price = ethers.formatUnits(await crowdsale.price(), 18);
    setPrice(price);

    const maxTokens = ethers.formatUnits(await crowdsale.maxTokens(), 18);
    setMaxTokens(maxTokens);

    const minTokens = ethers.formatUnits(await crowdsale.minTokens(), 18);
    setMinTokens(minTokens);

    const maxPurchaseTokens = ethers.formatUnits(await crowdsale.maxTokens(), 18);
    setMaxPurchaseTokens(maxPurchaseTokens);

    const tokensSold = ethers.formatUnits(await crowdsale.tokensSold(), 18);
    setTokensSold(tokensSold);

    const isUserWhitelisted = await crowdsale.isWhitelisted(account);
    setIsWhitelisted(isUserWhitelisted);

    const currentSaleState = await crowdsale.getState();
    setSaleState(currentSaleState === 0n ? 'Open' : 'Closed');

    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Container className="text-light">
      <Navigation />

      <h1 className="my-4 text-center">Introducing <span className="text-highlight">DApp Token!</span></h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <CountdownTimer saleEnd={saleEnd} />
          <p className="text-center"><strong>Current Price:</strong> {price} ETH</p>
          <p className="text-center"><strong>Sale State:</strong> {saleState}</p>
          <Buy
            provider={provider}
            price={price}
            crowdsale={crowdsale}
            setIsLoading={setIsLoading}
            isWhitelisted={isWhitelisted}
            saleState={saleState}
            minTokens={minTokens}
            maxTokens={maxPurchaseTokens}
          />
          <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
          <Whitelist provider={provider} crowdsale={crowdsale} />
        </>
      )}

      <hr />

      {account && <Info account={account} accountBalance={accountBalance} />}
    </Container>
  );
}

export default App;
