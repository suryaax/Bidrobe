import React, { useEffect, useState } from "react";
import "./hero.css";

import slide1 from "../assets/images/hero1.png";
import slide2 from "../assets/images/hero2.png";
import slide3 from "../assets/images/hero3.png";
import slide4 from "../assets/images/hero4.png";

const slides = [slide1, slide2, slide3, slide4];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-container">
      <div className="hero">
        <img src={slides[current]} alt="hero" />
      </div>
    </section>
  );
};

export default Hero;