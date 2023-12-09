'use client';
import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useBeforeUnload, useToggle } from "react-use";
import Welcome from "@/components/welcome";
import Currencies from "@/components/currencies";
import { supportedCurrencies } from "@/types/currencies";
import Recipients from "@/components/recipients";
import Summary from "@/components/summary";
import Output from "@/components/output";
import { prepareVouchers } from "@/lib/prepare_vouchers";
import { Result } from "@/types/result";
import currencies from "@/components/currencies";

// step enum
const WELCOME = 0;
const CURRENCIES = 1;
const AMOUNTS = 2;
const STRATEGIES = 3;
const OUTPUT = 4;

const steps = [
  {
    id: WELCOME,
    next: 'Start',
    back: null,
  },
  {
    id: CURRENCIES,
    next: 'Next',
    back: 'Back',
  },
  {
    id: AMOUNTS,
    next: 'Next',
    back: 'Back',
  },
  {
    id: STRATEGIES,
    back: 'Back',
    next: 'SUBMIT'
  },
  {
    id: OUTPUT,
    next: null,
    back: null,
  },
]

// add this
// const WalletMultiButtonDynamic = dynamic(
//   async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
//   { ssr: false }
// );

export default function Home() {

  const { connection } = useConnection();
  const { signAllTransactions, publicKey } = useWallet();
  const [step, setStep] = useState(steps[WELCOME]);
  const [selectedCurrencies, setSelectedCurrencies] = useState(supportedCurrencies);
  const [totalToSpend, setTotalToSpend] = useState("0.5");
  const [ticketsToGenerate, setTicketsToGenerate] = useState("3");
  const [distribution, setDistribution] = useState('even');
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result>({ vouchers: [] });

  const [dirty, toggleDirty] = useToggle(false);
  useBeforeUnload(dirty, 'You have unsaved changes, are you sure?');

  useEffect(() => {
    toggleDirty(result.vouchers.length > 0);
  }, [result.vouchers]);

  const handleSubmit = async () => {
    setWorking(true);
    try {
      let vouchers = await prepareVouchers(
        ticketsToGenerate,
        totalToSpend,
        distribution,
        selectedCurrencies,
        connection,
        publicKey,
        signAllTransactions,
      );
      console.log(vouchers);
      setResult({ vouchers });
    } catch (e: any) {
      setResult({ vouchers: [], error: e.message });
      return;
    } finally {
      setWorking(false);
    }
  };

useEffect(() => {
  console.log(selectedCurrencies)
}, [selectedCurrencies])

  return (
    <>
      <div className="h-3/4">
        {step.id === WELCOME && (
          <Welcome/>
        )}
        {step.id === CURRENCIES && (
          <Currencies
            selectedCurrencies={selectedCurrencies}
            setSelectedCurrencies={setSelectedCurrencies}
          />
        )}
        {step.id === AMOUNTS && (
          <Recipients
            totalToSpend={totalToSpend}
            setTotalToSpend={setTotalToSpend}
            ticketsToGenerate={ticketsToGenerate}
            setTicketsToGenerate={setTicketsToGenerate}
          />
        )}
        {step.id === STRATEGIES && (
          <Summary
            totalToSpend={totalToSpend}
            ticketsToGenerate={ticketsToGenerate}
            distribution={distribution}
            setDistribution={setDistribution}
          />
        )}
        {step.id === OUTPUT && (
          <Output
            working={working}
            result={result}
          />
        )}
      </div>
      {step.id !== OUTPUT && (
        <div className="flex justify-between w-full items-center">
          {step.back && (
            <input
              type="button"
              className="mx-auto mt-5 text-xl border-2 border-green-700 hover:bg-green-500 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer"
              value={step.back}
              onClick={() => setStep(steps[step.id - 1])}
            />
          )}
          {step.next && (
            <input
              type="button"
              className="mx-auto mt-5 text-xl bg-green-700 hover:bg-green-500 text-white md:py-3 py-2 px-6 rounded-md cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
              value={step.next}
              disabled={(step.id === CURRENCIES && selectedCurrencies.length === 0) || (step.id === STRATEGIES && !publicKey)}
              onClick={() => {
                setStep(steps[step.id + 1])
                if (step.id === STRATEGIES) {
                  handleSubmit()
                }
              }
              }
            />
          )}
        </div>
      )}
    </>
  )
}
