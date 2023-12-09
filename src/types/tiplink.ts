import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
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
    this.lamports = lamports;
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

   getPrepIx() {
    if (this.currency.name === 'SOL') {
      return null;
    }
    const ataIx = createAssociatedTokenAccountInstruction(
      this.payer,
      getAssociatedTokenAddressSync(this.currency.mintAddress, this.owner),
      this.owner,
      this.currency.mintAddress,
    )
    return ataIx;
  }

  async getTx(blockhash: string) {
    if (this.currency.name === 'SOL') {
      const ix = SystemProgram.transfer({
        fromPubkey: this.payer,
        toPubkey: this.owner,
        lamports: Math.floor(this.lamports),
      })
      const messageV0 = new TransactionMessage({
        payerKey: this.payer,
        recentBlockhash: blockhash,
        instructions: [ix],
      }).compileToV0Message();
      return new VersionedTransaction(messageV0);
    }
    return await this.getSwapIxs()
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
  
  private async getSwapIxs(): Promise<VersionedTransaction> {
    const jupiterQuoteApi = createJupiterApiClient()
    const quote = await jupiterQuoteApi.quoteGet({
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: this.currency.mintAddress.toBase58(),
      onlyDirectRoutes: false,
      amount: this.lamports
    })
    if (!quote) {
      throw new Error('No quote') // todo check that the handling is OK
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
  }
}