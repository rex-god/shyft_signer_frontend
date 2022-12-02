import { Wallet } from "@solana/wallet-adapter-react";
import { Connection, Signer, Transaction, VersionedTransaction } from "@solana/web3.js";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
export interface ShyftWallet {
  wallet: Wallet;
  signTransaction: SignerWalletAdapterProps['signTransaction'];
  signAllTransactions: SignerWalletAdapterProps['signAllTransactions'];
}

const TransactionCompileError = 'Versioned messages must be deserialized with VersionedMessage.deserialize()';

export async function confirmTransactionFromFrontend(connection: Connection, encodedTransaction: string, wallet: ShyftWallet): Promise<string> {
  console.log('ola');
  let signedTx: Transaction | VersionedTransaction;
  let txId: string;
  try {
    const recoveredTransaction = Transaction.from(
      Buffer.from(encodedTransaction, 'base64')
    );
    signedTx = await wallet.signTransaction(recoveredTransaction);
    txId = await connection.sendRawTransaction(
      signedTx.serialize({ requireAllSignatures: false }), { maxRetries: 2 }
    );
    return txId;
  } catch (error: any) {
   if (error.message === TransactionCompileError) {
      const recoveredTransaction = VersionedTransaction.deserialize(Buffer.from(encodedTransaction, 'base64'));
      signedTx = await wallet.signTransaction(recoveredTransaction);
      const txId = await connection.sendTransaction(signedTx);
      return txId;
    } else {
      throw error;
    }
  }
}

export async function signTransactionFromFrontend(encodedTransaction: string, signer: Signer[]): Promise<string> {
  try {
    const recoveredTransaction = Transaction.from(
      Buffer.from(encodedTransaction, 'base64')
    );
    recoveredTransaction.partialSign(...signer);
    const serializedTransaction = recoveredTransaction.serialize({ requireAllSignatures: false });
    const transactionBase64 = serializedTransaction.toString('base64');
    return transactionBase64;
  } catch (error: any) {
    if (error.message === TransactionCompileError) {
      const recoveredTransaction = VersionedTransaction.deserialize(Buffer.from(encodedTransaction, 'base64'));
      recoveredTransaction.sign(signer);
      const serializedTransaction = recoveredTransaction.serialize();
      const transactionBase64 = Buffer.from(serializedTransaction).toString('base64');
      return transactionBase64;
    } else {
      throw error;
    }
  }
}