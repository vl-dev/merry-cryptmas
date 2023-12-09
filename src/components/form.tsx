'use client';

import React, { useState } from 'react';
import { NumericInput } from "@/components/numeric_input";

type props = {
  handleSubmit: (ticketsToGenerate: number,
                 totalToSpend: number,
                 distribution: string) => Promise<void>;
  disabled: boolean;
}

const Form: React.FC<props> = (props: props) => {
  const [totalToSpend, setTotalToSpend] = useState("1");
  const [ticketsToGenerate, setTicketsToGenerate] = useState("3");
  const [distribution, setDistribution] = useState('even');
  const [working, setWorking] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setWorking(true);
    try {
      await props.handleSubmit(
        Number(ticketsToGenerate),
        Number(totalToSpend),
        distribution
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="relative">
      <div className="p-5 flex flex-col items-center justify-between gap-4 text-base">
        <label
          className="flex justify-between gap-3 align-middle"
        >
          Total to spend (SOL):
          <NumericInput
            value={totalToSpend}
            setValue={setTotalToSpend}
            min={0.1}
            max={10000}
            step={0.1}
          />
        </label>
        <label
          className="flex justify-between gap-3"
        >
          Number of gifts:
          <NumericInput
            value={ticketsToGenerate}
            setValue={setTicketsToGenerate}
            min={1}
            max={10}
            step={1}
          />
        </label>
        <label
          className="flex justify-between gap-3"
        >
          Distribute:
          <select
            className="w-60 text-center bg-stone-700 text-white"
            value={distribution}
            onChange={e => setDistribution(e.target.value)}
          >
            <option value="even">Same amount to everyone</option>
            <option value="random">Random amounts</option>
          </select>
        </label>
        {props.disabled ? (
          <div className="text-center text-red-500 mt-5">
            Connect your wallet to continue
          </div>
        ) : (
          <input
            className="mt-5 bg-green-700 hover:bg-green-500 text-white font-bold md:py-3 py-2 px-6 rounded-md"
            type="button" value={
            working ? 'Elves are working...' : 'Submit'
          } disabled={working || props.disabled}
            onClick={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Form;