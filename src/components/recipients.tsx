'use client';

import React from 'react';
import { NumericInput } from "@/components/numeric_input";

type props = {
  totalToSpend: string,
  setTotalToSpend: (value: string) => void,
  ticketsToGenerate: string,
  setTicketsToGenerate: (value: string) => void,
}

const Welcome: React.FC<props> = (props) => {
  return (
    <>
      <h2
        className="md:text-2xl text-lg font-bold text-center"
      >
        <div className='m-6 font-medium'>How much do you want to spend?</div>
      </h2>
      <NumericInput
        value={props.totalToSpend}
        setValue={props.setTotalToSpend}
        min={0.1}
        max={10000}
        step={0.1}
        currency='SOL'
      />
      <h2
        className="md:text-2xl text-lg font-bold text-center"
      >
        <div className='m-10 font-medium'>How many vouchers do you need?</div>
      </h2>
      <NumericInput
        value={props.ticketsToGenerate}
        setValue={props.setTicketsToGenerate}
        min={1}
        max={10}
        step={1}
      />
    </>
  )
    ;
};

export default Welcome;