import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { TipLink } from "@tiplink/api";
import { Voucher } from "@/types/result";
import { createJupiterApiClient } from "@jup-ag/api";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Currency } from "@/types/currencies";

const appURL = process.env.NEXT_PUBLIC_APP_URL!

function tiplinkToMyLink(tiplink: string) {
  return tiplink.replace('https://tiplink.io/i#', `${appURL}/gift/`)
}

type Tiplink = {
  link: string,
  amount: number,
  pubkey: PublicKey,
  versionedTx: VersionedTransaction,
}

const jupiterQuoteApi = createJupiterApiClient()

async function getSwapIxs(payer: PublicKey,
                          recipient: PublicKey,
                          outputMint: PublicKey,
                          lamports: number,
): Promise<VersionedTransaction> {

  const quote = await jupiterQuoteApi.quoteGet({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: outputMint.toBase58(),
    amount: lamports
  })
  if (!quote) {
    throw new Error('No quote') // todo check that the handling is OK
  }

  const destinationTokenAccount = getAssociatedTokenAddressSync(new PublicKey(outputMint), recipient);

  // get serialized transaction
  const swapResult = await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: payer.toBase58(),
      dynamicComputeUnitLimit: true,
      destinationTokenAccount: destinationTokenAccount.toBase58(),
    },
  });

  // deserialize the transaction
  const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
  return VersionedTransaction.deserialize(swapTransactionBuf);
}

async function getTiplinks(
  connection: Connection,
  caller: PublicKey,
  total: number,
  count: number,
  distribution: string,
  currencies: Currency[]
) {

  // get default amounts
  let amounts = []
  for (let i = 0; i < count; i++) {
    amounts.push(total * LAMPORTS_PER_SOL / count)
  }

  // randomize if applicable
  if (distribution === 'random') {
    // scale amounts by random number between 0.5 and 1.5
    amounts = amounts.map(c => c * (Math.random() + 0.5))
    // normalize to add up to total * LAMPORTS_PER_SOL
    const sum = amounts.reduce((a, b) => a + b, 0)
    amounts = amounts.map(c => c * total * LAMPORTS_PER_SOL / sum)
  }

  const tiplinkResponses = [];
  for (let i = 0; i < count; i++) {
    const tiplink = await TipLink.create()
    tiplinkResponses.push(tiplink)
  }

  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const result: Tiplink[] = [];
  for (let i = 0; i < count; i++) {
    const pubkey = tiplinkResponses[i].keypair.publicKey;
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    let versionedTx: VersionedTransaction | TransactionInstruction;
    if (currency.name === 'SOL') {
      const ix = SystemProgram.transfer({
        fromPubkey: caller,
        toPubkey: pubkey,
        lamports: Math.floor(amounts[i]),
      })
      const messageV0 = new TransactionMessage({
        payerKey: caller,
        recentBlockhash: recentBlockhash,
        instructions: [ix],
      }).compileToV0Message();
      versionedTx = new VersionedTransaction(messageV0);
    } else {
      versionedTx = await getSwapIxs(caller,
        pubkey,
        currency.mintAddress,
        Math.floor(amounts[i])
      )
    }

    result.push({
      link: tiplinkToMyLink(tiplinkResponses[i].url.toString()),
      amount: amounts[i],
      pubkey,
      versionedTx,
    })
  }
  return result
}

export async function prepareVouchers(
  ticketsToGenerate: string,
  totalToSpend: string,
  distribution: string,
  currencies: Currency[],
  connection: Connection,
  publicKey: PublicKey | null,
  signAllTransactions: any,
): Promise<Voucher[]> {
  debugger;
  const count = Number(ticketsToGenerate);
  const total = Number(totalToSpend);

  if (!publicKey || !signAllTransactions) {
    throw new Error('Wallet not connected');
  }
  if (count > 10) {
    throw new Error('Cannot generate more than 10 tickets at a time');
  }
  if (total < 0.1) {
    throw new Error('Cannot spend less than 0.1 SOL');
  }
  if (count < 1) {
    throw new Error('Cannot generate less than 1 ticket');
  }
  console.log(`Total to spend: ${total * LAMPORTS_PER_SOL}, Link count: ${count}`);

  const transactionData = await getTiplinks(
    connection,
    publicKey,
    total,
    count,
    distribution,
    currencies)

  const signedTxs = await signAllTransactions(
    transactionData.map((tx: Tiplink) => tx.versionedTx)
  );

  let txPromises = Promise.all(signedTxs.map(async (signedTx: any) => {
    try {
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      console.log('Transaction sent', txId);
      return {
        id: txId,
      }
    } catch (e) {
      return { error: e }
    }
  }));

  const txResults = await txPromises;

  const vouchers: Voucher[] = transactionData.map((tiplink: any, i: number) => {
    if (txResults[i].error) {
      return {
        amount: tiplink.amount,
        error: txResults[Math.floor(i / 3)].error.message
      }
    }
    return {
      amount: tiplink.amount,
      link: tiplink.link
    }
  })

  try {
    await fetch(
      "/api/log",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pubkey: publicKey.toBase58(),
          txid: txResults,
          total: totalToSpend,
          gifts: count,
          strategy: distribution,
        }),
      }
    )
  } catch (e) {
    // this is not fatal for the user, it shouldn't disrupt the flow.
    console.error(e)
  }

  return vouchers;
}