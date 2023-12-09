'use client';

import React, { useEffect } from 'react';
import { useBeforeUnload, useToggle } from "react-use";
import { Result, Voucher } from "@/types/result";

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

  return (
    <>
      {working ? (
        <div className="-mt-10 flex flex-col items-center justify-between gap-4">
          <h2
            className="mt-5 md:text-2xl text-xl font-bold text-center">
            Elves are preparing your presents...
            Help them by signing a few transactions!
          </h2>
        </div>
      ) : (
        <div className="-mt-10 flex flex-col items-center justify-between gap-4">
          {result.error ? (
            <h2
              className="mt-5 md:text-2xl text-xl font-bold text-center">
              Error: {result.error}
            </h2>
          ) : (
            <>
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
                className="flex flex-col items-center justify-between gap-3 p-5"
              >{
                result.vouchers.map((voucher: Voucher) => {
                  if (voucher.error !== undefined)
                    return (<div>
                      <div className="text-center text-red-700">Error: {voucher.error}</div>
                    </div>);
                  return (<a
                    href={voucher.link}
                    key={voucher.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center md:text-lg text-sm text-blue-500"
                  >{voucher.link}</a>)
                })
              }</div>
              <div className="text-center text-white">
                Every link contains a unique present, so make sure to save them all!
              </div>
            </>)}
        </div>
      )}
    </>
  );
};

export default Welcome;