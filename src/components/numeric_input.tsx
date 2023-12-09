import React from "react";

export const NumericInput: React.FC<{
  value: string,
  setValue: (value: string) => void,
  min: number,
  max: number,
  step: number
  currency?: string
}> = ({
        value,
        setValue,
        min,
        max,
        step,
  currency,
      }) => {

  let inputClassName = "z-10 w-20 text-center bg-stone-700 text-white rounded-l-xl"
  if (!currency) {
    inputClassName += " rounded-r-xl"
  }

  return (<div
    className="flex w-full"
  >
    <div className="m-auto text-xl flex gap-3">
      <input
        className="bg-red-500 px-5 py-3 bg-opacity-30 rounded-full cursor-pointer"
        type="button" value='-'
        disabled={Number(value) <= min}
        onClick={() => setValue((Math.round((Number(value) - step) * (1.0 / step)) / (1.0 / step)).toString())}
      />
      <input
        type="text"
        className={inputClassName}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={e => setValue(Number(e.target.value) ? Math.min(Math.max(Number(e.target.value), min), max).toString() : min.toString())}
      />
      {currency && (
      <div
        className="flex items-center text-base -ml-3 pr-3 pl-2 text-center align-middle text-gray-400 bg-stone-700 rounded-r-xl">
        {currency}
      </div>
      )}
      <input
        className="bg-green-700 px-5 py-3 bg-opacity-50 rounded-full cursor-pointer"
        type="button" value='+'
        disabled={Number(value) >= max}
        onClick={() => setValue((Math.round((Number(value) + step) * (1.0 / step)) / (1.0 / step)).toString())}
      />
    </div>
  </div>)
}