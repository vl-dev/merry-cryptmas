'use client';

import QRCode from 'react-qr-code';

type props = {
  link: string
}

const VoucherView: React.FC<props> = ({ link }) => {
  return (
    <div className="bg-white w-[340px] h-80 text-black rounded-xl border-2 border-black">
      <h1
        className="mt-8 text-3xl font-bold text-center text-black px-5"
      > MERRY CRYPTMAS! </h1>
      <div className='flex justify-between px-6'>
        <span className='text-6xl h-full my-auto'>🎄</span>
        <QRCode value={link}
                level={'L'}
                className='w-32 mx-auto -my-5'
        />
        <span className='text-6xl h-full my-auto'>🎅</span>
      </div>
      <div className='-mt-3 w-full text-center'>
        cryptmas.xyz
      </div>
    </div>
  );
};

export default VoucherView;