import { A } from "hookrouter";
import React from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";

const Intro = () => (
  <>
    <Header />
    <main className="jumbo">
      <h1>Spender is a free and simple budgeting app.</h1>
      <p>Your data never leaves your device and can be erased at any time.</p>
      <p>
        <A className="button button--primary" href="/dashboard">
          Get started →
        </A>
      </p>
    </main>
    <Footer />
  </>
);

export default Intro;
