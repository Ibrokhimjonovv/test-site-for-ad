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
  title: "Afd Test Platform - Online Tests",
  description: "Take free and paid online tests with Afd Test Platform. Prepare for exams, check your knowledge, and see your results instantly.",
};

export default function RootLayout({ children }) {
  return (
    <AccessProvider>
      <html lang="en">
        <head>
          {/* Charset */}
          <meta charSet="UTF-8" />

          {/* Viewport */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          {/* Title & Description */}
          <title>Afd Test Platform - Online Tests</title>
          <meta 
            name="description" 
            content="Take free and paid online tests with Afd Test Platform. Prepare for exams, check your knowledge, and see your results instantly." 
          />

          {/* Keywords */}
          <meta 
            name="keywords" 
            content="Afd Test Platform, online tests, free tests, paid tests, exam preparation, test solving, knowledge check, student tests, subject quizzes" 
          />

          {/* Robots */}
          <meta name="robots" content="index, follow" />

          {/* Author */}
          <meta name="author" content="Afd Test Platform" />

          {/* Open Graph */}
          <meta property="og:title" content="Afd Test Platform - Online Tests" />
          <meta 
            property="og:description" 
            content="Take free and paid online tests with Afd Test Platform. Prepare for exams, check your knowledge, and track your progress." 
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://afd-test-platform.vercel.app/" />
          <meta property="og:image" content="https://afd-test-platform.vercel.app/preview.png" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Afd Test Platform - Online Tests" />
          <meta 
            name="twitter:description" 
            content="Take free and paid online tests with Afd Test Platform. Prepare for exams, improve your knowledge, and achieve better results." 
          />
          <meta name="twitter:image" content="https://afd-test-platform.vercel.app/preview.png" />
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
