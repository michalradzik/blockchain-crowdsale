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
      console.log('Provider:', provider);

      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      setAccount(account);
      console.log('Połączone konto:', account);

      const { chainId } = await provider.getNetwork();
      const chainIdStr = chainId.toString(); // Konwersja BigInt na string
      console.log('Chain ID:', chainIdStr);

      const networkConfig = config[chainIdStr];
      if (!networkConfig) {
        window.alert(`Brak konfiguracji dla sieci o chainId: ${chainIdStr}`);
        return;
      }

      console.log('Konfiguracja sieci:', networkConfig);

      // Inicjalizacja kontraktu tokena z logowaniem
      console.log('Inicjalizacja kontraktu tokena...');
      console.log('Adres tokena:', networkConfig.token.address);
      console.log('ABI tokena:', TOKEN_ABI);

      const token = new ethers.Contract(
        networkConfig.token.address,
        TOKEN_ABI,
        provider
      );
      setToken(token);
      console.log('Kontrakt tokena zainicjalizowany:', token);

      // Inicjalizacja kontraktu crowdsale z logowaniem
      console.log('Inicjalizacja kontraktu crowdsale...');
      console.log('Adres crowdsale:', networkConfig.crowdsale.address);
      console.log('ABI crowdsale:', CROWDSALE_ABI);

      const crowdsale = new ethers.Contract(
        networkConfig.crowdsale.address,
        CROWDSALE_ABI,
        provider
      );
      setCrowdsale(crowdsale);
      console.log('Kontrakt crowdsale zainicjalizowany:', crowdsale);

      // Pobieranie salda konta
      console.log(`Pobieranie salda dla konta: ${account}`);
      const balanceRaw = await token.balanceOf(account);
      console.log('Saldo surowe (w wei):', balanceRaw.toString());

      const accountBalance = formatUnits(balanceRaw, 18);
      setAccountBalance(accountBalance);
      console.log('Sformatowane saldo konta:', accountBalance);

      // Pobieranie całkowitej podaży tokena
      const totalSupplyRaw = await token.totalSupply();
      console.log('Całkowita podaż tokena (surowa):', totalSupplyRaw.toString());

      const totalSupply = formatUnits(totalSupplyRaw, 18);
      console.log('Całkowita podaż tokena (sformatowana):', totalSupply);

      // Pobieranie nazwy tokena
      const tokenName = await token.name();
      console.log('Nazwa tokena:', tokenName);

      // Pobieranie symbolu tokena
      const tokenSymbol = await token.symbol();
      console.log('Symbol tokena:', tokenSymbol);

      // Pobieranie liczby miejsc dziesiętnych tokena
      const tokenDecimals = await token.decimals();
      console.log('Liczba miejsc dziesiętnych tokena:', tokenDecimals);

      // Pobieranie właściciela tokena (jeśli dotyczy)
      if (token.owner) {
        const tokenOwner = await token.owner();
        console.log('Właściciel tokena:', tokenOwner);
      }

      // Pobieranie ceny tokena
      const priceRaw = await crowdsale.price();
      console.log('Cena surowa (w wei):', priceRaw.toString());

      const price = formatUnits(priceRaw, 18);
      setPrice(price);
      console.log('Sformatowana cena:', price);

      // Pobieranie maksymalnej liczby tokenów
      const maxTokensRaw = await crowdsale.maxTokens();
      console.log('Maksymalna liczba tokenów (surowa):', maxTokensRaw.toString());

      const maxTokens = formatUnits(maxTokensRaw, 18);
      setMaxTokens(maxTokens);
      console.log('Sformatowana maksymalna liczba tokenów:', maxTokens);

      // Pobieranie minimalnej liczby tokenów
      const minTokensRaw = await crowdsale.minTokens();
      console.log('Minimalna liczba tokenów (surowa):', minTokensRaw.toString());

      const minTokens = formatUnits(minTokensRaw, 18);
      setMinTokens(minTokens);
      console.log('Sformatowana minimalna liczba tokenów:', minTokens);

      // Pobieranie maksymalnej liczby tokenów do zakupu
      const maxPurchaseTokensRaw = await crowdsale.maxPurchaseTokens();
      console.log('Maksymalna liczba tokenów do zakupu (surowa):', maxPurchaseTokensRaw.toString());

      const maxPurchaseTokens = formatUnits(maxPurchaseTokensRaw, 18);
      setMaxPurchaseTokens(maxPurchaseTokens);
      console.log('Sformatowana maksymalna liczba tokenów do zakupu:', maxPurchaseTokens);

      // Pobieranie liczby sprzedanych tokenów
      const tokensSoldRaw = await crowdsale.tokensSold();
      console.log('Sprzedane tokeny (surowe):', tokensSoldRaw.toString());

      const tokensSold = formatUnits(tokensSoldRaw, 18);
      setTokensSold(tokensSold);
      console.log('Sformatowana liczba sprzedanych tokenów:', tokensSold);

      // Sprawdzanie, czy użytkownik jest na białej liście
      const isUserWhitelisted = await crowdsale.isWhitelisted(account);
      setIsWhitelisted(isUserWhitelisted);
      console.log(`Czy użytkownik jest na białej liście: ${isUserWhitelisted}`);

      // Pobieranie stanu sprzedaży
      const currentSaleState = await crowdsale.getState();
      console.log('Aktualny stan sprzedaży (surowy):', currentSaleState.toString());
      setSaleState(currentSaleState === 0n ? 'Open' : 'Closed');
      console.log('Aktualny stan sprzedaży:', saleState);

      // Dodatkowe dane tokena (opcjonalnie)

      // Pobieranie uprawnienia (allowance) (jeśli dotyczy)
      const allowanceRaw = await token.allowance(account, crowdsale.address);
      console.log('Uprawnienie od konta do crowdsale (surowe):', allowanceRaw.toString());

      const allowance = formatUnits(allowanceRaw, 18);
      console.log('Sformatowane uprawnienie od konta do crowdsale:', allowance);

      // Pobieranie salda tokenów kontraktu crowdsale
      const crowdsaleTokenBalanceRaw = await token.balanceOf(crowdsale.address);
      console.log('Saldo tokenów kontraktu crowdsale (surowe):', crowdsaleTokenBalanceRaw.toString());

      const crowdsaleTokenBalance = formatUnits(crowdsaleTokenBalanceRaw, 18);
      console.log('Sformatowane saldo tokenów kontraktu crowdsale:', crowdsaleTokenBalance);

      setIsLoading(false);
    } catch (error) {
      console.error('Wystąpił błąd podczas ładowania danych blockchain:', error);
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

      <h1 className="my-4 text-center">Przedstawiamy <span className="text-highlight">DApp Token!</span></h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <CountdownTimer saleEnd={saleEnd} />
          <p className="text-center"><strong>Aktualna cena:</strong> {price} ETH</p>
          <p className="text-center"><strong>Stan sprzedaży:</strong> {saleState}</p>
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
