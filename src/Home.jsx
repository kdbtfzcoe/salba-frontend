import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

import heroImage from './assets/hero-bg.webp'; 

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      <Navbar />

      {/* HERO SECTION */}
      {/* 1. Increased bottom padding (pb-40) to make room for the floating cards */}
      <header className="relative w-full pt-20 pb-40 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }} 
        ></div>

        {/* 2. Richer gradient: Added a 'via' color to make the transition smoother */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-teal-900/95 via-teal-800/90 to-teal-900/95"></div>

        <div className="relative z-20 max-w-4xl mx-auto space-y-5">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            PROJECT SALBA
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-teal-200 drop-shadow-md">
            Flood Monitoring & Early Warning System
          </h2>
          {/* 3. Increased font weight to font-semibold and text color to pure teal-50 for better readability */}
          <p className="text-teal-50 text-lg md:text-xl max-w-2xl mx-auto pt-4 font-semibold leading-relaxed drop-shadow-md">
            Real-time water level tracking and intelligent flood prediction tailored to protect the communities of Biñan, Laguna.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {/* 4. Dramatically pulled the cards up (-mt-24) so they float over the hero image boundary */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pb-16 space-y-8 -mt-24 relative z-30">
        
        {/* TWO-COLUMN INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            {/* Title aligned with a locked minimum height */}
            <h3 className="text-2xl font-black text-slate-900 mb-4 min-h-[5rem] flex items-start">
              Ano ang PROJECT SALBA?
            </h3>
            {/* Justified text with perfectly matched length */}
            <p className="text-gray-600 leading-relaxed font-medium text-justify flex-grow">
              Ang Project Salba ay isang makabagong sistema na nagsisilbing inyong "bantay-baha" upang protektahan ang ating buong komunidad. Nilalayon nito na magbigay ng mga live update at totoong impormasyon tungkol sa taas ng tubig sa inyong paligid para lagi kayong handa at updated sa lahat ng oras. Gamit ang maaasahang teknolohiyang ito, hindi na ninyo kailangang manghula pa kung ligtas ba ang inyong lugar o kung kailangan na bang mag-impake at lumikas. 
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            {/* Title aligned with a locked minimum height */}
            <h3 className="text-2xl font-black text-slate-900 mb-4 min-h-[5rem] flex items-start">
              Paano ka poprotektahan ng PROJECT SALBA?
            </h3>
            {/* Justified text */}
            <p className="text-gray-600 leading-relaxed font-medium text-justify flex-grow">
              Mayroon kaming mga smart sensor na 24/7 na nakatutok sa taas ng tubig sa inyong lugar. Kapag nakita ng aming system na mabilis ang pagtaas at may banta na ng baha, agad itong magpapadala ng babala (text alert) sa inyong cellphone. Dahil dito, mas maaga kayong makakapaghanda, mas mabilis ninyong maililigpit ang inyong mga gamit, at higit sa lahat, mas ligtas na makakalikas ang inyong buong pamilya bago pa man tumaas ang tubig.
            </p>
          </div>
          
        </div>

       {/* THREE-COLUMN STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Card 1: Soft Teal */}
          <div className="bg-teal-50 p-8 rounded-2xl shadow-sm border border-teal-100 text-center flex flex-col justify-center items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h4 className="text-3xl font-black text-teal-900 mb-2">24/7</h4>
            <p className="text-teal-600 font-bold uppercase tracking-widest text-xs">Continuous Monitoring</p>
          </div>

          {/* Card 2: Soft Blue */}
          <div className="bg-blue-50 p-8 rounded-2xl shadow-sm border border-blue-100 text-center flex flex-col justify-center items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h4 className="text-3xl font-black text-blue-900 mb-2">Real-Time</h4>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Live Data Updates</p>
          </div>

          {/* Card 3: Soft Emerald */}
          <div className="bg-emerald-50 p-8 rounded-2xl shadow-sm border border-emerald-100 text-center flex flex-col justify-center items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <h4 className="text-3xl font-black text-emerald-900 mb-2">Accurate</h4>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Flood Predictions</p>
          </div>

        </div>

      </main>

      {/* CALL TO ACTION SECTION */}
      {/* 8. Changed background to a soft teal (bg-teal-50) to separate it visually from the cards */}
      <section className="w-full bg-teal-50 py-20 border-t border-teal-100 mt-auto">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-5">Get Started Today</h2>
          <p className="text-gray-600 font-medium mb-10 leading-relaxed text-lg">
            Register to receive instant SMS flood alerts, access real-time monitoring data, and stay protected. Join our community of informed residents today.
          </p>
            <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-teal-700 hover:bg-teal-800 hover:shadow-2xl hover:-translate-y-1 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 text-lg"
            >
            Register Now
            </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;