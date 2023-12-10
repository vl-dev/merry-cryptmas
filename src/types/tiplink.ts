import {
  AddressLookupTableAccount, Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { Currency } from "@/types/currencies";
import { TipLink } from "@tiplink/api";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createJupiterApiClient } from "@jup-ag/api";
import { Voucher } from "@/types/result";

export class TiplinkHandler {
  payer: PublicKey;
  link: string;
  owner: PublicKey;
  lamports: number;
  currency: Currency;

  private constructor(
    payer: PublicKey,
    link: string,
    owner: PublicKey,
    lamports: number,
    currency: Currency,
  ) {
    this.payer = payer;
    this.lamports = Math.floor(lamports);
    this.currency = currency;
    this.link = link;
    this.owner = owner;
  }

  static async initialize(
    payer: PublicKey,
    lamports: number,
    currency: Currency,
  ): Promise<TiplinkHandler> {
    const tiplink = await TipLink.create()
    const pubkey = tiplink.keypair.publicKey
    const link = tiplink.url.toString()
    return new TiplinkHandler(payer, link, pubkey, lamports, currency)
  }

  private getPrepIxs() {
    if (this.currency.name === 'SOL') {
      return null;
    }
    const ataIx = createAssociatedTokenAccountInstruction(
      this.payer,
      getAssociatedTokenAddressSync(this.currency.mintAddress, this.owner),
      this.owner,
      this.currency.mintAddress,
    )
    const transferIx = SystemProgram.transfer({
      fromPubkey: this.payer,
      toPubkey: this.owner,
      lamports: 1_100_000,
    })
    return [ataIx, transferIx];
  }

  async getTx(connection:Connection, recentBlockhash: string): Promise<VersionedTransaction> {
    if (this.currency.name === 'SOL') {
      const ix = SystemProgram.transfer({
        fromPubkey: this.payer,
        toPubkey: this.owner,
        lamports: this.lamports,
      })
      const messageV0 = new TransactionMessage({
        payerKey: this.payer,
        recentBlockhash,
        instructions: [ix],
      }).compileToV0Message();
      return new VersionedTransaction(messageV0);
    }
    const swapTx = await this.getSwapTx()
    const prepIxs = this.getPrepIxs()
    if (!prepIxs) {
      return swapTx;
    }

    // get address lookup table accounts
    const addressLookupTableAccounts = await Promise.all(
      swapTx.message.addressTableLookups.map(async (lookup) => {
        let data = (await connection.getAccountInfo(lookup.accountKey))?.data
        if (!data) {
          throw new Error(`Account ${lookup.accountKey.toBase58()} does not exist`)
        }
        return new AddressLookupTableAccount({
          key: lookup.accountKey,
          state: AddressLookupTableAccount.deserialize(data),
        })
      }))

    // decompile transaction message and add transfer instruction
    const message = TransactionMessage.decompile(swapTx.message,{addressLookupTableAccounts: addressLookupTableAccounts})
    message.instructions = [...prepIxs, ...message.instructions]

    // compile the message and update the transaction
    swapTx.message = message.compileToV0Message(addressLookupTableAccounts)

    return swapTx;
  }

  getVoucher(error?: string): Voucher {
    if (error) {
      return {
        amount: this.lamports,
        error
      }
    }
    return {
      amount: this.lamports,
      link: this.link
    }
  }

  private async getSwapTx(): Promise<VersionedTransaction> {
    try {
      const jupiterQuoteApi = createJupiterApiClient()
      const quote = await jupiterQuoteApi.quoteGet({
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: this.currency.mintAddress.toBase58(),
        onlyDirectRoutes: false,
        slippageBps: 1000,
        // to make sure that we have enough for slippage (in most cases)
        amount: Math.floor(this.lamports * 0.95)
      })
      if (!quote) {
        throw new Error('No quote')
      }

      const destinationTokenAccount = getAssociatedTokenAddressSync(this.currency.mintAddress, this.owner);

      // get serialized transaction
      const swapResult = await jupiterQuoteApi.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: this.payer.toBase58(),
          wrapAndUnwrapSol: true,
          destinationTokenAccount: destinationTokenAccount.toBase58(),
        },
      });

      // deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const vtx = VersionedTransaction.deserialize(swapTransactionBuf)
      console.log(vtx)
      return vtx;
    } catch (e) {
      console.log(e)
      throw e;
    }
  }
}