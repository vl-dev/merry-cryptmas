import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Wallet } from "@/components/wallet";

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
      {children}
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
