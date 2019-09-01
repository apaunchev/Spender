import { A } from "hookrouter";
import React from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";

const Intro = () => (
  <>
    <Header />
    <main className="jumbo">
      <h1>
        Spender is a budgeting app with a focus on simplicity and privacy.
      </h1>
      <p>
        To use it, all you need to do is set up your monthly{" "}
        <strong>budgets</strong> for things like groceries and rent, and then
        start tracking your daily <strong>expenses</strong>.
      </p>
      <p>
        Using clean and simple visualizations, the app will then help you
        understand how much you spend and on what, along with how much you can
        save every month. We don’t care about your income, net worth, or credit;
        there are better apps for tracking those.
      </p>
      <p>
        We understand financial information is private and this is why we don’t
        ask you to create an account or hand over any of your data to a third
        party. In fact, your data never leaves your device and can be erased by
        you at any time.
      </p>
      <p>
        <strong>Ready to give it a go?</strong>
      </p>
      <p>
        <A className="button button--primary" href="/dashboard">
          Let’s get started
        </A>
      </p>
    </main>
    <Footer />
  </>
);

export default Intro;
