import React from 'react';
import '../../App.css';

export default function Home() {
  const publicUrl = process.env.PUBLIC_URL;
  const bgUrl = `${publicUrl}/bg.jpg`;
  const logoUrl = `${publicUrl}/logo.png`;

  return (
    <div className="home-page">
      {/* Reuse the same background styles used by the main App */}
      <img src={bgUrl} alt="background" className="bg-image" />

      {/* Small logo pinned to the top-right */}
      <img src={logoUrl} alt="logo" className="home-logo-topright" />

      <div className="home-content">
        <p>To begin analysis, upload your rice leaf image, and</p>
        <p> ensure the photo is  clear for the best results.</p>
      </div>
    </div>
  );
}
