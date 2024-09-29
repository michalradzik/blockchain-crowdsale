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
      console.log(`Provider:`, provider);

      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts[0];
      setAccount(account);
      console.log(`Connected account: ${account}`);

      const { chainId } = await provider.getNetwork();
      console.log(`Chain ID: ${chainId}`);

      const networkConfig = config[chainId];
      if (!networkConfig) {
        window.alert(`Brak konfiguracji dla sieci o chainId: ${chainId}`);
        return;
      }

      console.log("Network Configuration:", networkConfig);

      // Inicjalizacja kontraktu tokena z logowaniem
      console.log("Initializing token contract...");
      console.log("Token address:", networkConfig.token.address);
      console.log("Token ABI:", TOKEN_ABI);

      const token = new ethers.Contract(
        networkConfig.token.address,
        TOKEN_ABI,
        provider
      );
      console.log("Token contract initialized:", token);

      // Inicjalizacja kontraktu crowdsale z logowaniem
      console.log("Initializing crowdsale contract...");
      console.log("Crowdsale address:", networkConfig.crowdsale.address);
      console.log("Crowdsale ABI:", CROWDSALE_ABI);

      const crowdsale = new ethers.Contract(
        networkConfig.crowdsale.address,
        CROWDSALE_ABI,
        provider
      );
      setCrowdsale(crowdsale);
      console.log("Crowdsale contract initialized:", crowdsale);

      // Pobieranie salda konta
      console.log(`Fetching balance for account: ${account}`);
      const balanceRaw = await token.balanceOf(account);
      console.log("Raw balance (in wei):", balanceRaw.toString());

      const accountBalance = formatUnits(balanceRaw, 18);
      setAccountBalance(accountBalance);
      console.log("Formatted account balance:", accountBalance);

      // Pobieranie ceny tokena
      const priceRaw = await crowdsale.price();
      console.log("Raw price (in wei):", priceRaw.toString());

      const price = formatUnits(priceRaw, 18);
      setPrice(price);
      console.log("Formatted price:", price);

      // Pobieranie maksymalnej liczby tokenów
      const maxTokensRaw = await crowdsale.maxTokens();
      console.log("Raw max tokens:", maxTokensRaw.toString());

      const maxTokens = formatUnits(maxTokensRaw, 18);
      setMaxTokens(maxTokens);
      console.log("Formatted max tokens:", maxTokens);

      // Pobieranie minimalnej liczby tokenów do zakupu
      const minTokensRaw = await crowdsale.minTokens();
      console.log("Raw min tokens:", minTokensRaw.toString());

      const minTokens = formatUnits(minTokensRaw, 18);
      setMinTokens(minTokens);
      console.log("Formatted min tokens:", minTokens);

      // Pobieranie maksymalnej liczby tokenów do zakupu
      const maxPurchaseTokensRaw = await crowdsale.maxTokens();
      console.log("Raw max purchase tokens:", maxPurchaseTokensRaw.toString());

      const maxPurchaseTokens = formatUnits(maxPurchaseTokensRaw, 18);
      setMaxPurchaseTokens(maxPurchaseTokens);
      console.log("Formatted max purchase tokens:", maxPurchaseTokens);

      // Pobieranie liczby sprzedanych tokenów
      const tokensSoldRaw = await crowdsale.tokensSold();
      console.log("Raw tokens sold:", tokensSoldRaw.toString());

      const tokensSold = formatUnits(tokensSoldRaw, 18);
      setTokensSold(tokensSold);
      console.log("Formatted tokens sold:", tokensSold);

      // Sprawdzanie, czy użytkownik jest na białej liście
      const isUserWhitelisted = await crowdsale.isWhitelisted(account);
      setIsWhitelisted(isUserWhitelisted);
      console.log(`Is user whitelisted: ${isUserWhitelisted}`);

      // Pobieranie stanu sprzedaży
      const currentSaleState = await crowdsale.getState();
      setSaleState(currentSaleState === 0n ? 'Open' : 'Closed');
      console.log("Current sale state:", saleState);

      setIsLoading(false);
    } catch (error) {
      console.error("Wystąpił błąd podczas ładowania danych blockchain:", error);
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
