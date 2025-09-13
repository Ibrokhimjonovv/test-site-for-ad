import Section_1 from '@/components/homeSection_1/section_1';
import Tests from '@/components/tests/tests';
import React from 'react';

export const metadata = {
  title: 'Home page - м17',
};

const Main = () => {
  return (
    <div className='home'>
      <Section_1 />
      <Tests />
    </div>
  )
}

export default Main