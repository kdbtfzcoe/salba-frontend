import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

// 1. IMPORT YOUR IMAGE HERE
// Make sure the file name matches exactly what you named it in the assets folder!
import heroImage from './assets/hero-bg.webp'; 

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      <Navbar />

      {/* HERO SECTION WITH FLOOD BACKGROUND OVERLAY */}
      <header className="relative w-full py-25 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        
        {/* 2. BACKGROUND IMAGE PLUGGED IN HERE */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }} 
        ></div>

        {/* 3. TEAL OVERLAY (Adjust the /80 and /70 numbers to change the see-through level) */}
        {/* /90 is very dark, /50 is very clear. /80 is usually the sweet spot for readable text. */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-teal-900/95 to-teal-800/90"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
            PROJECT SALBA
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-teal-200 drop-shadow-sm">
            Flood Monitoring & Early Warning System
          </h2>
          <p className="text-teal-50/90 text-lg md:text-xl max-w-2xl mx-auto pt-4 font-medium leading-relaxed">
            Real-time water level tracking and intelligent flood prediction tailored to protect the communities of Biñan, Laguna.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-16 space-y-8 -mt-10 relative z-30">
        
        {/* TWO-COLUMN INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: What is it? */}
          <div className="bg-white p-9 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Ano ang PROJECT SALBA?</h3>
            <p className="text-gray-500 leading-relaxed font-medium text-justify">
              Ang Project Salba ay isang makabagong sistema na nagsisilbing "bantay-baha" upang protektahan ang ating buong komunidad. Nilalayon nito na magbigay ng mga live update at totoong impormasyon tungkol sa taas ng tubig sa inyong paligid para lagi kayong handa at updated sa lahat ng oras. Gamit ang teknolohiyang ito, hindi na ninyo kailangang manghula kung ligtas pa ba ang inyong lugar o kung kailangan na bang mag-impake at lumikas. 
            </p>
          </div>

          {/* Card 2: How It Works */}
          <div className="bg-white p-9 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4">Paano ka poprotektahan ng PROJECT SALBA?</h3>
            <p className="text-gray-500 leading-relaxed font-medium text-justify">
              Mayroon kaming mga smart sensor na 24/7 na nakatutok sa taas ng tubig sa inyong lugar. Kapag nakita ng aming system na mabilis ang pagtaas at may banta na ng baha, agad itong magpapadala ng babala (text alert) sa inyong cellphone. Dahil dito, mas maaga kayong makakapaghanda, mas mabilis ninyong maililigpit ang inyong mga gamit, at higit sa lahat, mas ligtas na makakalikas ang inyong buong pamilya bago pa man tumaas ang tubig.
            </p>
          </div>
        </div>

        {/* THREE-COLUMN STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center">
            <h4 className="text-3xl font-black text-slate-800 mb-2">24/7</h4>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Continuous Monitoring</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center">
            <h4 className="text-3xl font-black text-slate-800 mb-2">Real-Time</h4>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Live Data Updates</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center">
            <h4 className="text-3xl font-black text-slate-800 mb-2">Accurate</h4>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Flood Predictions</p>
          </div>
        </div>

      </main>

      {/* CALL TO ACTION SECTION */}
      <section className="w-full bg-white py-15 border-t border-gray-100 mt-auto">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-slate-800 mb-4">Get Started Today</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Register to receive instant SMS flood alerts, access real-time monitoring data, and stay protected. Join our community of informed residents today.
          </p>
            <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-xl transition-all transform active:scale-95 text-lg"
            >
            Register Now
            </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;