'use client';

import React from 'react';

const Welcome: React.FC = () => {
  return (
    <>
      <h2
        className="md:text-2xl text-lg font-bold text-center"
      >
        <div className='m-10 font-medium'>Show people that crypto is a better gift than envelopes with cash!</div>
        <div className='m-10 font-medium'>Create
          <span
            className="text-green-500"
          > crypto vouchers</span> for your friends and family!</div>
      </h2>
    </>
  )
    ;
};

export default Welcome;