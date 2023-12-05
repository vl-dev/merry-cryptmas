'use client';
import React from "react";
import { usePathname } from "next/navigation";

export default function Id() {
  const pathname = usePathname()
  console.log(pathname)
  const tiplink = `https://tiplink.io/i#${pathname && pathname.slice(6)}`
  return (
    <main className="flex h-screen">
      <div
        className="flex flex-col items-center gap-12 m-auto h-full max-h-[60vh]"
      >
        <h1
          className="md:text-6xl text-3xl font-bold text-center"
        >🎄 MERRY CRYPTMAS! 🎅</h1>
        <div className="text-2xl text-white">
          {tiplink}
        </div>
      </div>
    </main>
  )
}
