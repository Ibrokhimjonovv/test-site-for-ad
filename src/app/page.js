import Section_1 from '@/components/homeSection_1/section_1';
import Tests from '@/components/tests/tests';
import React from 'react';

export const metadata = {
  title: 'Bosh sahifa - Infinite Co',
  // description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  // keywords: 'Anime, Film, Drama, Kdrama, Seriallar, O\'zbek tilida, Afd, AFD, AFD Platform, afd-platform, fantastika',
  // openGraph: {
  //   title: 'AFD Platform - Bosh sahifa',
  //   description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  //   url: 'https://afd-platform.uz/',
  //   siteName: "AFD Platform",
  //   images: [
  //     {
  //       url: 'https://afd-platform.uz/preview.png',
  //       width: 800,
  //       height: 600,
  //     },
  //   ],
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'AFD Platform - Bosh sahifa',
  //   description: 'AFD - Anime, Film va dramalarni o\'zida jam etgan bepul, sodda va reklamalarsiz bo\'lgan platforma!',
  //   images: ['https://afd-platform.uz/preview.png'],
  // },
  // alternates: {
  //   canonical: 'https://afd-platform.uz',
  // },
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