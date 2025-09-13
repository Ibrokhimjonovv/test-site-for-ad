import { AccessProvider } from "@/contexts/contexts";
import { Poppins } from "next/font/google";
import "@/styles/global.scss"
import Login from "@/components/login/page";
import Register from "@/components/register/page";
import HeaderSwitcher from "@/components/headerSwitcher/headerSwitcher";

const poppins = Poppins({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: "--font-poppins"
})

export const metadata = {
  title: "м17",
  description: "Created by м17",
};

export default function RootLayout({ children }) {
  return (
    <AccessProvider>
      <html lang="en">
        <head>
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1980545331504061"
            crossorigin="anonymous"></script>

          <script>window.yaContextCb=window.yaContextCb||[]</script>
          <script src="https://yandex.ru/ads/system/context.js" async></script>
        </head>
        <body className={`${poppins.className} `}>
          <HeaderSwitcher />
          <Login />
          <Register />
          <main>{children}</main>
        </body>
      </html>
    </AccessProvider>
  );
}
