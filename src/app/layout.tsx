import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Wallet } from "@/components/wallet";
import React from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Merry Cryptmas',
  description: 'Send your friends a gift of SOL this holiday season!',
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <Wallet>
      <main className="flex h-screen">
        <div
          className="flex flex-col items-center gap-12 m-auto h-full md:max-h-[60vh] max-h-[80vh]"
        >
          <h1
            className="md:text-6xl text-3xl font-bold text-center"
          >🎄 MERRY CRYPTMAS! 🎅</h1>
          {children}
        </div>
      </main>
    </Wallet>
    <div
      className="text-center bg-black text-white text-sm z-50 fixed bottom-0 left-0 right-0 p-4 border-t-2 border-gray-900"
    >
      Created by <a href="https://twitter.com/mmatdev"
                    target="_blank"
                    className="underline"
    >mat</a>
    </div>
    </body>
    </html>
  )
}
