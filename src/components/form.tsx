'use client';

import React, { useState } from 'react';

type props = {
  handleSubmit: (ticketsToGenerate: number,
                 totalToSpend: number,
                 distribution: string) => Promise<void>;
  disabled: boolean;
}

const Form: React.FC<props> = (props: props) => {
  const [totalToSpend, setTotalToSpend] = useState(1);
  const [ticketsToGenerate, setTicketsToGenerate] = useState(3);
  const [distribution, setDistribution] = useState('even');
  const [working, setWorking] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setWorking(true);
    try {
      await props.handleSubmit(
        ticketsToGenerate,
        totalToSpend,
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
          Spending limit:
          <input
            type="number"
            step="0.1"
            min="0"
            className="w-20 text-center bg-stone-700 text-white"
            value={totalToSpend}
            onChange={e => setTotalToSpend(Number(e.target.value))}
          />
          SOL
        </label>
        <label
          className="flex justify-between gap-3"
        >
          Present count:
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            className="w-20 text-center bg-stone-700 text-white"
            value={ticketsToGenerate}
            onChange={e => setTicketsToGenerate(Number(e.target.value))}
          />
        </label>
        <label
          className="flex justify-between gap-3"
        >
          Distribute:
          <select
            className="w-40 text-center bg-stone-700 text-white"
            value={distribution}
            onChange={e => setDistribution(e.target.value)}
          >
            <option value="even">Evenly</option>
            <option value="random">Randomly</option>
          </select>
        </label>
        {props.disabled ? (
          <div className="text-center text-red-500 mt-5">
           Connect your wallet to continue
          </div>
        ) : (
          <input
            className="mt-5 bg-green-700 hover:bg-green-500 text-white font-bold py-3 px-6 rounded"
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