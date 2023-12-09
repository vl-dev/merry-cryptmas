import { PublicKey } from "@solana/web3.js";

export type Currency = {
  name: string;
  mintAddress: PublicKey;
  icon: string;
}

export const supportedCurrencies: Currency[] = [
  {
    name: 'SOL',
    mintAddress: new PublicKey('So11111111111111111111111111111111111111112'),
    icon: '/solana.svg',
  },
  {
    name: 'BONK',
    mintAddress: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
    icon: '/bonk.jpeg',
  }
];