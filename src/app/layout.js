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
