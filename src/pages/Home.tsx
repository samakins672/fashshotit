import { useEffect } from "react";
import About from "../components/About";
import ClientLogos from "../components/ClientLogos";
import Contact from "../components/Contact";
import Hero from "../components/Hero";
import Portfolio from "../components/Portfolio";
import Services from "../components/Services";
import Skills from "../components/Skills";
import Testimonials from "../components/Testimonials";

export default function Home() {
  useEffect(() => {
    document.title = "Fash Shot It — Beyond Imagination";
  }, []);

  return (
    <>
      <Hero />
      <Portfolio />
      <ClientLogos />
      <About />
      <Services />
      <Skills />
      <Testimonials />
      <Contact />
    </>
  );
}
