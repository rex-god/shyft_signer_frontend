import { useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import React, { useState, useMemo } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { confirmTransactionFromFrontend } from 'shyft-js';
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from "@solana-mobile/wallet-adapter-mobile";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const Home: NextPage = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new SolanaMobileWalletAdapter({
        appIdentity: { name: "Solana Wallet Adapter App" },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
      }),
      new CoinbaseWalletAdapter({ network }),
      new PhantomWalletAdapter({ network }),
      new GlowWalletAdapter({ network }),
      new SlopeWalletAdapter({ network }),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );
  const [response, setResponse] = useState<string | any>();
  const connection = new Connection(clusterApiUrl(network), 'confirmed');

  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();

  const handleSubmit = async (event: any) => {
    try {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();
    const encodedTransaction = event.target.encoded_transaction.value;

    if (wallet !== null && typeof signTransaction !== 'undefined') {
      const shyftWallet = {
        wallet,
        signTransaction,
      }
      const completedTransaction = await confirmTransactionFromFrontend(connection, encodedTransaction, shyftWallet);
      setResponse(completedTransaction);
    } else {
      setResponse('Some error occured');
    }
  } catch(err) {
    setResponse('Some error occured');
  }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className={styles.walletButtons}>
              <WalletMultiButton />
              <WalletDisconnectButton />
            </div>
            {/* Your app's components go here, nested within the context providers. */}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <div>
        <h3>
          Wallet Address: <code>{publicKey?.toBase58()}</code>
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Encoded Transaction</label>
            <textarea
              name="encoded_transaction"
              className="form-control"
              id="encoded_transaction"
              placeholder="Enter transaction"
            />
          </div>
          <button type="submit" className="btn btn-warning">
            Submit
          </button>
        </form>
        <div>{response}</div>
      </div>
      <main className={styles.main}></main>
    </div>
  );
};

export default Home;
