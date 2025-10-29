import '../styles/globals.css';
import Nav from '../components/Nav';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Support Tickets</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />
      <main className="container">
        <Component {...pageProps} />
      </main>
      <footer className="footer">Built with Next.js + Supabase</footer>
    </>
  );
}
