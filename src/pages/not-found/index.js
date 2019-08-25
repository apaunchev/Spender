import React from "react";
import Header from "../../components/header";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";

const NotFound = () => (
  <>
    <Header />
    <main>
      <Blankslate
        title="404"
        description="The page you are looking for could not be found."
      />
    </main>
    <Footer />
  </>
);

export default NotFound;
