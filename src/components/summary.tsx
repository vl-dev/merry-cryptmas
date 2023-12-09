'use client';

import React from 'react';
import { WalletButton } from "@/components/wallet_button";

type props = {
  totalToSpend: string,
  ticketsToGenerate: string,
  distribution: string,
  setDistribution: (value: string) => void,
}

const Currencies: React.FC<props> = (props) => {
  return (
    <>
      <h2
        className="md:text-2xl text-lg text-center"
      >
        <div className='m-6 font-medium'>You are creating <span
          className="text-green-500"
        >{props.ticketsToGenerate} vouchers</span></div>
        <div>
          for a total of <span
          className="text-green-500"
        >{props.totalToSpend} SOL</span>.
        </div>
        {props.distribution === 'even' ? (
          <div className='m-6 font-medium'>Each voucher is worth <span
            className="text-green-500"
          >~{Math.floor(Number(props.totalToSpend) / Number(props.ticketsToGenerate) * 1e3) / 1e3} SOL</span>.
          </div>
        ) : (
          <div className='m-6 font-medium'>The voucher values will be <span
            className="text-green-500"
          >random</span>.
          </div>
        )}
      </h2>
      <div className='mt-8 font-medium w-fit flex flex-col mx-auto gap-8 items-center'>
        <input
          type="button"
          className="mx-aut border-green-700 border-2 text-sm hover:bg-green-800 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
          value={props.distribution === 'even' ?
            "Split randomly instead" :
            "Split evenly instead"
          }
          onClick={() => {
            props.setDistribution(props.distribution === 'even' ? 'random' : 'even');
          }}
        />
        <WalletButton/>
      </div>
      <div className="flex flex-col gap-2 justify-center items-center rounded-xl">
      </div>
    </>
  )
    ;
};

export default Currencies;