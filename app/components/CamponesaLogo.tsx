import React from 'react';

interface CamponesaLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const CamponesaLogo: React.FC<CamponesaLogoProps> = ({ 
  width = 200, 
  height = 60, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="https://i.imgur.com/jWRWsgo.png"
        alt="Rubix Logo"
        width={width}
        height={height}
        className="drop-shadow-sm object-contain"
      />
    </div>
  );
};

export default CamponesaLogo;
