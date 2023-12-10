import { Connection, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { Voucher } from "@/types/result";
import { Currency } from "@/types/currencies";
import { TiplinkHandler } from "@/types/tiplink";

export async function prepareVouchers(
  ticketsToGenerate: string,
  totalToSpend: string,
  distribution: string,
  currencies: Currency[],
  connection: Connection,
  publicKey: PublicKey | null,
  signAllTransactions: any,
): Promise<Voucher[]> {
  const count = Number(ticketsToGenerate);
  let total = Number(totalToSpend);

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

  let tiplinks = await Promise.all(
    amounts.map(async (amount: number) => {
        return await TiplinkHandler.initialize(
          publicKey,
          amount,
          currencies[Math.floor(Math.random() * currencies.length)]
        )
      }
    ));

  const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
  const txs = (await Promise.all(
    tiplinks.map(async (tiplink: TiplinkHandler) => {
      try {
        return await tiplink.getTx(connection, blockhash)
      } catch (e) {
        console.error(`Error creating transaction for ${tiplink.link}`, e)
        return null
      }
    })
  )).filter((tx: any) => tx !== null)

  const signedTxs = await signAllTransactions(
    txs as VersionedTransaction[]
  );

  let txResults = await Promise.all(signedTxs.map(async (signedTx: any) => {
    try {
      const txId = await connection.sendRawTransaction(signedTx.serialize(),
        {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        }
        );
      console.log('Transaction sent', txId);
      const result = await connection.confirmTransaction(
        {
          signature: txId,
          lastValidBlockHeight,
          blockhash,
        },
        'confirmed',
      );
      if (result.value.err) {
        throw result.value.err
      }
      return {
        id: txId,
      }
    } catch (e) {
      return { error: e }
    }
  }));

  const vouchers: Voucher[] = txResults.map((txResult: any, i: number) =>
    tiplinks[i].getVoucher(txResult.error)
  )

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