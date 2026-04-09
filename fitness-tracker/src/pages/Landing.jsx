import React, { useState } from "react";
import Navbar from "./../components/Navbar";
import Banner from "./../components/Banner";
import Slider from "./../components/Slider";
import Gallery from "./../components/Gallery";
import About from "./../components/About";
import Contact from "./../components/Contact";
import Footer from "./../components/Footer";
import SignupModal from "./../components/SignupModal";
import LoginModal from "./../components/LoginModal"; // <- NEW

const App = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <Navbar
        onSignupClick={() => setShowSignupModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
      />

      <main>
        <Banner onSignupClick={() => setShowSignupModal(true)} />
        <Slider />
        <Gallery />
        <About />
        <Contact />
      </main>
      <Footer />

      {/* Modals */}
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default App;
