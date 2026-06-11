import React from "react";

import { useNavigate } from "react-router-dom";

import "./about.css";

import aboutHero
from "../assets/images/abouthero.png";

import aboutAction
from "../assets/images/aboutact.png";

const About = () => {

  const navigate =
    useNavigate();

  return (

    <div className="about-page container">

      {/* HERO */}
      <section className="about-hero">

        <img
          src={aboutHero}
          alt="about hero"
        />

        <div className="about-hero-overlay">

          <h1>
            Fashion Finds.
            <br />
            Auction Energy.
          </h1>

        </div>

      </section>

      {/* SUBTITLE */}
      <section className="about-subtitle">

        <p>
          Temukan koleksi busana pilihan melalui 
          pengalaman lelang langsung yang dirancang 
          khusus untuk budaya streetwear modern.
        </p>

      </section>

      {/* ACTION HERO */}
      <section className="about-action">

        <img
          src={aboutAction}
          alt="about action"
        />

        <div className="about-action-card">

          <h2>
            Find Your
            <br />
            Next Grail.
          </h2>

          <p>
            Telusuri lelang yang sedang berlangsung dan
            temukan barang-barang fashion langka
            sebelum kehabisan.
          </p>

          <button
            onClick={() =>
              navigate("/#recommendation")
            }
          >

            Belanja Sekarang →

          </button>

        </div>

      </section>

      {/* DETAILS */}
      <section className="about-details">

        <h2>
          Tentang Bidrobe.
        </h2>

        <p>
          Bidrobe adalah platform lelang
          fashion yang dirancang untuk orang-orang yang
          mengutamakan keunikan, keistimewaan,
          dan penemuan yang kompetitif.
          Mulai dari streetwear vintage hingga
          pakaian esensial modern, setiap
          penawaran menghadirkan pengalaman
          berbelanja yang dinamis
          berkat sistem penawaran secara real-time.
        </p>

      </section>

    </div>

  );

};

export default About;