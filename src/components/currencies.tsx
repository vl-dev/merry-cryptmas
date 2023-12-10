'use client';

import React from 'react';
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
      <div className='md:my-10 my-8 font-medium w-full flex gap-2 md:gap-4 items-center justify-center'>
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
              <div className="flex flex-col gap-2 justify-center items-center rounded-xl md:py-4 md:px-8 py-4 px-4 bg-gray-900">
                <Image
                  width={40}
                  height={40}
                  src={currency.icon}
                  alt="Solana"
                  className="md:w-10 md:h-10 h-6 w-6"
                />
                <div className="text-lg">{currency.name}</div>
              </div>
              <div className="absolute top-0 right-0 rounded-xl bg-opacity-50 w-8 h-8 bg-gray-800">
                <div className="flex w-full h-full justify-center items-center">
                  {!props.selectedCurrencies.includes(currency) ? (
                    <div className="text-2xl text-red-500">✗</div>
                  ): (
                    <div className="text-2xl text-green-500">✓</div>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div className="text-gray-500 text-center w-full flex md:text-base text-[10px] flex-col gap-2 justify-center items-center rounded-xl">
        <div>Other currencies than SOL add a small fee per recipient (~0.0031 SOL),</div>
        <div>to create a token account and make the tokens claimable.</div>
        <div>This SOL is not included in the mint price limit and is claimable by the recipient.</div>
      </div>
    </>
  )
    ;
};

export default Currencies;