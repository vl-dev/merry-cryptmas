'use client';
import React from "react";
import { usePathname } from "next/navigation";
import VoucherView from "@/components/voucher";

const appURL = process.env.NEXT_PUBLIC_APP_URL!

export default function Id() {
  const pathname = usePathname()
  console.log(pathname)
  const valString = pathname && pathname.slice(11) || ""
  const vals = valString.split('$$$')

  return (
    <main className="grid-cols-2 grid">
      {
        vals.map(val =>
          <VoucherView
            key={val}
            link={`${appURL}/gift/${val}`}
          />)
      }
    </main>
  )
}
