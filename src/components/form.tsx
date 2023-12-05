'use client';

import React, { useState } from 'react';

type props = {
  handleSubmit: (ticketsToGenerate: number,
                 totalToSpend: number,
                 distribution: string) => Promise<void>;
  disabled: boolean;
}

const NumericInput: React.FC<{
  value: string,
  setValue: (value: string) => void,
  min: number,
  max: number,
  step: number
}> = ({
        value,
        setValue,
        min,
        max,
        step
      }) => {
  return (<div
    className="flex"
  >
    <input
      className="bg-red-500 px-2 bg-opacity-30"
      type="button" value='-'
      disabled={Number(value) <= min}
      onClick={() => setValue((Math.round((Number(value) - step) * (1.0/step)) / (1.0/step)).toString())}
    />
    <input
      type="text"
      className="w-20 text-center bg-stone-700 text-white"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={e => setValue(Number(e.target.value) ? Math.min(Math.max(Number(e.target.value), min), max).toString() : min.toString())}
    />
    <input
      className="bg-green-700 bg-opacity-50 px-2"
      type="button" value='+'
      disabled={Number(value) >= max}
      onClick={() => setValue((Math.round((Number(value) + step) * (1.0/step)) / (1.0/step)).toString())}
    />
  </div>)
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
          Total amount (SOL):
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
            className="mt-5 bg-green-700 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-md"
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