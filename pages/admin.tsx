import Head from "next/head";
import { useEffect } from "react";

const FORESTRY_LOGIN = "https://app.forestry.io/login";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.replace(FORESTRY_LOGIN);
  }, []);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0;url=${FORESTRY_LOGIN}`} />
        <link rel="canonical" href={FORESTRY_LOGIN} />
      </Head>
      <p>
        Redirecting to{" "}
        <a href={FORESTRY_LOGIN}>Forestry login</a>…
      </p>
    </>
  );
}
