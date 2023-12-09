'use client';

import React, { useEffect } from 'react';
import { supportedCurrencies } from "@/types/currencies";

type props = {
  selectedCurrencies: string[];
  setSelectedCurrencies: (selectedCurrencies: string[]) => void;
  setNextDisabled: (nextStepDisabled: boolean) => void;
}

const Currencies: React.FC<props> = (props) => {
  useEffect(() => {
    props.setNextDisabled(props.selectedCurrencies.length === 0);
  }, [props.selectedCurrencies]);
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
                if (props.selectedCurrencies.includes(currency.name)) {
                  props.setSelectedCurrencies(props.selectedCurrencies.filter((selectedCurrency) => selectedCurrency !== currency.name));
                } else {
                  props.setSelectedCurrencies([...props.selectedCurrencies, currency.name]);
                }
              }}>
              <div className="flex flex-col gap-2 justify-center items-center rounded-xl py-4 px-8 bg-gray-900">
                <img
                  src={currency.icon}
                  alt="Solana"
                  className="w-10 h-10"
                />
                <div className="text-lg">{currency.name}</div>
              </div>
              {!props.selectedCurrencies.includes(currency.name) && (
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
      <div className="flex flex-col gap-2 justify-center items-center rounded-xl">
        more incoming soon...
      </div>
    </>
  )
    ;
};

export default Currencies;