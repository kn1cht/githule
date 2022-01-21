import "normalize.css/normalize.css";
import "../styles/globals.scss";

import Head from "next/head";

const App = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>GitHule</title>
      <meta name="description" content="A daily GitHub contribution" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:title" content="GitHule" />
      <meta property="og:site_name" content="GitHule" />
      <meta property="og:description" content="A daily GitHub contribution" />
      <meta property="og:url" content="" />
      <meta property="og:image" content="" />
      <meta property="og:type" content="website" />
      <script defer src="https://use.fontawesome.com/releases/v5.15.4/js/all.js"></script>
    </Head>
    <Component {...pageProps} />
  </>
);

export default App;
