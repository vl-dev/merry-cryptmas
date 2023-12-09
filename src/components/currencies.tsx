'use client';

import React, { useEffect } from 'react';
import { Currency, supportedCurrencies } from "@/types/currencies";
import Image from "next/image";

type props = {
  selectedCurrencies: Currency[];
  setSelectedCurrencies: (selectedCurrencies: Currency[]) => void;
}

const Currencies: React.FC<props> = (props) => {
  return (
    <>
      <h2
        className="md:text-2xl text-lg text-center"
      >
        <div className='m-6 font-medium'><span
          className="text-green-500"
        >Which cryptocurrencies</span> do you want to give to your friends?
        </div>
      </h2>
      <div className='m-10 font-medium w-fit flex mx-auto gap-4'>
        {
          supportedCurrencies.map((currency) => (
            <div
              className="relative"
              key={currency.name}
              onClick={() => {
                if (props.selectedCurrencies.includes(currency)) {
                  props.setSelectedCurrencies(props.selectedCurrencies.filter((selectedCurrency) => selectedCurrency !== currency));
                } else {
                  props.setSelectedCurrencies([...props.selectedCurrencies, currency]);
                }
              }}>
              <div className="flex flex-col gap-2 justify-center items-center rounded-xl py-4 px-8 bg-gray-900">
                <Image
                  width={40}
                  height={40}
                  src={currency.icon}
                  alt="Solana"
                  className="w-10 h-10"
                />
                <div className="text-lg">{currency.name}</div>
              </div>
              {!props.selectedCurrencies.includes(currency) && (
                <div className="absolute top-0 right-0 w-full h-full rounded-xl bg-opacity-60 inset-y-0 bg-gray-700">
                  <div className="flex justify-center items-center w-full h-full">
                    <div className="text-5xl text-red-500">╳</div>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
      <div className="text-gray-500 text-center w-full flex flex-col gap-2 justify-center items-center rounded-xl">
        <div>Other currencies than SOL add a small fee per recipient (~0.0031 SOL),</div>
        <div>to create a token account and make the tokens claimable.</div>
        <div>This SOL is not included in the mint price limit and is claimable by the recipient.</div>
      </div>
    </>
  )
    ;
};

export default Currencies;