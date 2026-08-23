import React from 'react';

const Logo = ({ size = 16, theme = 'light' }) => {
  return (
    <div 
      className="relative flex flex-shrink-0 items-center justify-center"
      style={{ height: size * 4 }}
    >
      <img
        src="/Insta-Logo.jpg.jpeg"
        alt="Shivang Bags Collection Logo"
        className="h-full w-auto object-contain"
        style={{ 
          mixBlendMode: theme === 'dark' ? 'normal' : 'multiply'
        }}
      />
    </div>
  );
};

export default Logo;
