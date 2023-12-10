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
  },
  {
    name: 'PYTH',
    mintAddress: new PublicKey('HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'),
    icon: '/pyth.svg',
  },
  // {
  //   name: 'JTO',
  //   mintAddress: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'),
  //   icon: '/jito.png',
  // },
  {
    name: 'ACS',
    mintAddress: new PublicKey('5MAYDfq5yxtudAhtfyuMBuHZjgAbaS9tbEyEQYAhDS5y'),
    icon: '/acs.png',
  },
];