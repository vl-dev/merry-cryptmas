'use client';

import React, { useEffect } from 'react';
import { useBeforeUnload, useToggle } from "react-use";
import { Result, Voucher } from "@/types/result";

const appURL = process.env.NEXT_PUBLIC_APP_URL!

function tiplinkToMyLink(tiplink: string) {
  return tiplink.replace('https://tiplink.io/i#', `${appURL}/gift/`)
}

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
            className="mt-10 md:text-2xl text-xl font-bold text-center flex flex-col gap-5">
            <div>The Elves are preparing your presents...</div>
            <div>Help them by<span
              className="text-green-500"
            > signing some transactions!</span></div>
          </h2>
          <div className="mt-8 animate-spin rounded-full h-20 w-20 border-b-4 border-green-700"></div>
        </div>
      ) : (
        <div className="-mt-10 flex flex-col items-center justify-between gap-4">
          {result.error || resultAmounts.success === 0 ? (
            <h2
              className="mt-5 md:text-2xl text-xl font-bold text-center text-red-700">
              <div>Error: {result.error || "Voucher creation failed on Solana"}</div>
              <div className='mt-5'>No vouchers were created</div>
            </h2>
          ) : (
            <div className="flex flex-col items-center justify-between gap-3">
              <h2
                className="md:mt-10 mt-2 md:text-2xl text-lg font-bold text-center">
                Your presents are ready!
              </h2>
              <div
                className="md:text-2xl text-base font-bold flex flex-col text-center text-red-700">
                <span>SAVE THE LINKS BEFORE LEAVING THIS PAGE!!!</span>
                <span>Otherwise you are going to lose the presents forever!</span>
              </div>
              <div
                className="flex flex-col items-center justify-between  md:gap-2 md:p-5 p-2"
              >{
                result.vouchers.map((voucher: Voucher) => {
                  if (voucher.error !== undefined || voucher.link === undefined)
                    return null;
                  const link = tiplinkToMyLink(voucher.link);
                  return (
                    <div
                      key={link}
                    >
                      <a
                        href={link}
                        key={link + 'a'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center md:text-base text-xs text-blue-500"
                      >{link}</a>
                    </div>)
                })
              }</div>
              <input
                type="button"
                className="mx-auto text-xl border-2 border-green-700 hover:bg-green-500 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer"
                value="Copy all links"
                onClick={() => {
                  navigator.clipboard.writeText(result.vouchers
                    .filter((voucher: Voucher) => voucher.error === undefined && voucher.link !== undefined)
                    .map((voucher: Voucher) => tiplinkToMyLink(voucher.link!))
                    .join('\n'));
                }}
              />
              {
                resultAmounts.error > 0 && (
                  <div
                    className="md:text-lg text-md flex flex-col text-center text-yellow-500">
                    <span>There were some errors while creating the vouchers.</span>
                    <span>No worries, you have paid only for the created vouchers</span>
                  </div>
                )
              }
              <div className="text-center text-white md:text-base text-sm">
                Every link contains a unique present, so make sure to save them all!
              </div>
            </div>)}
        </div>
      )}
    </>
  );
};

export default Welcome;