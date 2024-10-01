import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers, formatUnits } from 'ethers';

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
  const [token, setToken] = useState(null);
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
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      setAccount(account);

      const { chainId } = await provider.getNetwork();
      const chainIdStr = chainId.toString();

      const networkConfig = config[chainIdStr];
      if (!networkConfig) {
        window.alert(`No configuration for network with chainId: ${chainIdStr}`);
        return;
      }

      const token = new ethers.Contract(
        networkConfig.token.address,
        TOKEN_ABI,
        provider
      );
      setToken(token);

      const crowdsale = new ethers.Contract(
        networkConfig.crowdsale.address,
        CROWDSALE_ABI,
        provider
      );
      setCrowdsale(crowdsale);

      const balanceRaw = await token.balanceOf(account);
      const accountBalance = formatUnits(balanceRaw, 18);
      setAccountBalance(accountBalance);

      const priceRaw = await crowdsale.price();
      const price = formatUnits(priceRaw, 18);
      setPrice(price);

      const maxTokensRaw = await crowdsale.maxTokens();
      const maxTokens = formatUnits(maxTokensRaw, 18);
      setMaxTokens(maxTokens);

      const minTokensRaw = await crowdsale.minTokens();
      const minTokens = formatUnits(minTokensRaw, 18);
      setMinTokens(minTokens);

      const maxPurchaseTokensRaw = await crowdsale.maxPurchaseTokens();
      const maxPurchaseTokens = formatUnits(maxPurchaseTokensRaw, 18);
      setMaxPurchaseTokens(maxPurchaseTokens);

      const tokensSoldRaw = await crowdsale.tokensSold();
      const tokensSold = formatUnits(tokensSoldRaw, 18);
      setTokensSold(tokensSold);

      const isUserWhitelisted = await crowdsale.isWhitelisted(account);
      setIsWhitelisted(isUserWhitelisted);

      const currentSaleState = await crowdsale.getState();
      setSaleState(currentSaleState === 0n ? 'Open' : 'Closed');

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
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
          <p className="text-center"><strong>Sale Status:</strong> {saleState}</p>
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
