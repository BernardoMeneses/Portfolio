import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Portfolio from '../components/Portfolio';
import Contact from '../components/Contact';
import BugHunt from '../components/BugHunt';
import Guestbook from '../components/Guestbook';

const Home = () => (
  <div>
    <Hero />
    <About />
    <Skills />
    <Portfolio />
    <BugHunt />
    <Contact />
    <Guestbook />
  </div>
);

export default Home;
