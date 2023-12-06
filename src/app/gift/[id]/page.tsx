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
          Open your present!
        </div>
        <a href={tiplink} target="_blank" className="text-8xl">
          🎁
        </a>
        <div className="mt-5 text-center text-gray-400">
          Want to send crypto gifts as well? <a href="/" target="_blank" className="underline">Click here</a>
        </div>
      </div>
    </main>
  )
}
