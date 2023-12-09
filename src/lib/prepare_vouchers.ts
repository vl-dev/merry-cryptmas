import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TipLink } from "@tiplink/api";
import { Voucher } from "@/types/result";

const appURL = process.env.NEXT_PUBLIC_APP_URL!

function tiplinkToMyLink(tiplink: string) {
  return tiplink.replace('https://tiplink.io/i#', `${appURL}/gift/`)
}

async function getTiplinks(
  caller: PublicKey, total: number, count: number, distribution: string
) {

  // array of total * LAMPORTS_PER_SOL/count
  let amounts = []
  for (let i = 0; i < count; i++) {
    amounts.push(total * LAMPORTS_PER_SOL / count)
  }

  if (distribution === 'random') {
    // scale amounts by random number between 0.5 and 1.5
    amounts = amounts.map(c => c * (Math.random() + 0.5))
    // normalize to add up to total * LAMPORTS_PER_SOL
    const sum = amounts.reduce((a, b) => a + b, 0)
    amounts = amounts.map(c => c * total * LAMPORTS_PER_SOL / sum)
  }
  console.log(amounts)

  var tiplinks = [];
  for (let i = 0; i < count; i++) {
    const tiplink = await TipLink.create()
    const pubkey = tiplink.keypair.publicKey;
    tiplinks.push({
      link: tiplinkToMyLink(tiplink.url.toString()),
      amount: amounts[i],
      pubkey,
      ixs: [
        SystemProgram.transfer({
          fromPubkey: caller,
          toPubkey: pubkey,
          lamports: Math.floor(amounts[i]),
        })
      ]
    })
  }
  return tiplinks
}

export async function prepareVouchers(
  ticketsToGenerate: string,
  totalToSpend: string,
  distribution: string,
  connection: Connection,
  publicKey: PublicKey | null,
  signAllTransactions: any,
): Promise<Voucher[]> {
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

  const tiplinks = await getTiplinks(
    publicKey,
    total,
    count,
    distribution)

  const txSets = [];
  // spread tiplinks to groups of 3
  for (let i = 0; i < tiplinks.length; i += 3) {
    txSets.push(tiplinks.slice(i, i + 3));
  }

  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const txs = txSets.map((txSet) => {
    const tx = new Transaction();
    txSet.forEach((tiplink: any) => {
      tx.add(...tiplink.ixs);
    })
    tx.recentBlockhash = recentBlockhash;
    tx.feePayer = publicKey;
    return tx;
  })

  const signedTxs = await signAllTransactions(txs);

  let txPromises = Promise.all(signedTxs.map(async (signedTx: any) => {
    try {
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      console.log('Transaction sent', txId);
      return { id: txId,
      }
    } catch (e) {
      return { error: e }
    }
  }));

  const txResults = await txPromises;

  const vouchers: Voucher[] = tiplinks.map((tiplink: any, i: number) => {
    if (txResults[Math.floor(i/3)].error) {
      return {
        amount: tiplink.amount,
        error: txResults[Math.floor(i/3)].error.message
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