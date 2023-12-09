'use client';

import React, { useEffect } from 'react';
import { useBeforeUnload, useToggle } from "react-use";
import { Result, Voucher } from "@/types/result";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type props = {
  working: boolean,
  result: Result,
}

const Welcome: React.FC<props> = ({ working, result }) => {
  const [dirty, toggleDirty] = useToggle(false);
  useBeforeUnload(dirty, 'You might have unsaved changes, are you sure?');
  useEffect(() => {
    toggleDirty(result.vouchers.length > 0);
  }, [result]);

  const resultAmounts = result.vouchers.reduce((total, voucher) => {
    voucher.error ? total.error += voucher.amount : total.success += voucher.amount;
    return total;
  }, { success: 0, error: 0 })

  return (
    <>
      {working ? (
        <div className="-mt-10 flex flex-col items-center justify-between gap-4">
          <h2
            className="mt-10 md:text-2xl text-xl font-bold text-center flex flex-col gap-3">
            <div>The Elves are preparing your presents...</div>
            <div>Help them by<span
              className="text-green-500"
            > signing a transaction!</span></div>
          </h2>
        </div>
      ) : (
        <div className="-mt-10 flex flex-col items-center justify-between gap-4">
          {result.error || resultAmounts.success === 0? (
            <h2
              className="mt-5 md:text-2xl text-xl font-bold text-center text-red-700">
              <div>Error: {result.error || "Voucher creation failed on Solana"}</div>
              <div className='mt-5'>No vouchers were created, all SOL has been returned to your wallet</div>
            </h2>
          ) : (
            <>
              <h2
                className="mt-5 md:text-2xl text-lg font-bold text-center">
                Your presents are ready!
              </h2>
              <div
                className="md:text-2xl text-base font-bold flex flex-col text-center text-red-700">
                <span>SAVE THE LINKS BEFORE LEAVING THIS PAGE!!!</span>
                <span>Otherwise you are going to lose the presents forever!</span>
              </div>
              <div
                className="flex flex-col items-center justify-between gap-1 md:gap-3 md:p-5 p-2"
              >{
                result.vouchers.map((voucher: Voucher) => {
                  if (voucher.error !== undefined)
                    return null;
                  return (<div
                    key={voucher.link}
                  >
                    <a
                      href={voucher.link}
                      key={voucher.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center md:text-base text-sm text-blue-500"
                    >{voucher.link}</a>
                  </div>)
                })
              }</div>
              {
                resultAmounts.error > 0 && (
                  <div
                    className="md:text-lg text-md flex flex-col text-center text-yellow-500">
                    <span>There were some errors while creating the vouchers.</span>
                    <span>You have paid only for the created vouchers, {resultAmounts.error / LAMPORTS_PER_SOL} SOL have been returned to your wallet</span>
                  </div>
                )
              }
              <div className="text-center text-white md:text-base text-sm">
                Every link contains a unique present, so make sure to save them all!
              </div>
            </>)}
        </div>
      )}
    </>
  );
};

export default Welcome;