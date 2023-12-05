'use client';
import React, { useEffect, useState } from "react";
import Form from "@/components/form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useBeforeUnload, useToggle } from "react-use";

import dynamic from 'next/dynamic';
import { TipLink } from "@tiplink/api";

// add this
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const appURL = process.env.NEXT_PUBLIC_APP_URL!

function tiplinkToMyLink(tiplink: string) {
  return tiplink.replace('https://tiplink.io/i#', `${appURL}/gift/`)
}

async function getTiplinks(
  caller: PublicKey, total: number, count: number, distribution: string
) {
  if (count > 10)
    throw new Error('Cannot generate more than 10 tickets at a time')

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

export default function Home() {

  const { connection } = useConnection();
  const { signAllTransactions, publicKey } = useWallet();
  const [links, setLinks] = useState<string[]>([]);

  const [dirty, toggleDirty] = useToggle(false);
  useBeforeUnload(dirty, 'You have unsaved changes, are you sure?');

  useEffect(() => {
    toggleDirty(links.length > 0);
  }, [links]);

  const handleSubmit = async (ticketsToGenerate: number,
                              totalToSpend: number,
                              distribution: string) => {
    if (!signAllTransactions || !publicKey) return;
    if (ticketsToGenerate > 10) {
      alert('Cannot generate more than 10 tickets at a time');
      return;
    }
    if (totalToSpend < 0.1) {
      alert('Cannot spend less than 0.1 SOL');
      return;
    }
    if (ticketsToGenerate < 1) {
      alert('Cannot generate less than 1 ticket');
      return;
    }
    console.log(`Total to spend: ${totalToSpend * LAMPORTS_PER_SOL}, Link count: ${ticketsToGenerate}`);

    const tiplinks = await getTiplinks(
      publicKey,
      totalToSpend,
      ticketsToGenerate,
      distribution)

    const tx = new Transaction();
    tiplinks.forEach((tiplink: any) => {
      tx.add(...tiplink.ixs);
    })
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = publicKey;

    const signedTxs = await signAllTransactions([tx]);
    const txid = await connection.sendRawTransaction(signedTxs[0].serialize());
    console.log(`Transaction sent: ${txid}`);

    await fetch(
      "/api/log",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pubkey: publicKey.toBase58(),
          txid,
          total: totalToSpend,
          gifts: ticketsToGenerate,
          strategy: distribution,
        }),
      }
    )

    const links: string[] = tiplinks.map((tiplink: any) => tiplink.link)
    setLinks(links);
  };

  return (
    <main className="flex h-screen">
      <div
        className="flex flex-col items-center gap-12 m-auto h-full md:max-h-[60vh] max-h-[80vh]"
      >
        <h1
          className="md:text-6xl text-3xl font-bold text-center"
        >🎄 MERRY CRYPTMAS! 🎅</h1>
        {links.length == 0 ? (
          <>
            <h2
              className="md:text-2xl text-lg font-bold text-center"
            >Gifts are boring, gib SOL instead!</h2>
            <WalletMultiButtonDynamic
              style={{ backgroundColor: 'rgb(21, 128, 61)' }}
            />
            <Form handleSubmit={handleSubmit} disabled={!publicKey}/>
          </>
        ) : (
          <div className="-mt-10 flex flex-col items-center justify-between gap-4">
            <h2
              className="mt-5 md:text-2xl text-xl font-bold text-center">
              Your presents are ready!
            </h2>
            <div
              className="md:text-2xl text-lg font-bold flex flex-col text-center text-red-700">
              <span>MAKE SURE THAT YOU SAVE THE LINKS BEFORE LEAVING THIS PAGE!!!</span>
              <span>Otherwise you are going to lose the presents forever!</span>
            </div>
            <div
              className="flex flex-col items-center justify-between gap-3"
            >{
              links.map((link: string) => (
                <a
                  href={link}
                  key={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center md:text-lg text-sm text-blue-500"
                >{link}</a>
              ))
            }</div>
          </div>
        )
        }
      </div>
    </main>
  )
}
