import React from 'react';

const MentoriaIllustration = () => {
  return (
    <svg 
      viewBox="0 0 800 600" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto"
    >
      {/* Fondo con formas decorativas */}
      <circle cx="150" cy="120" r="80" fill="#D1FAE5" opacity="0.3" />
      <circle cx="650" cy="450" r="100" fill="#A7F3D0" opacity="0.2" />
      <circle cx="700" cy="150" r="60" fill="#6EE7B7" opacity="0.15" />
      
      {/* Mesa */}
      <rect x="200" y="420" width="400" height="15" rx="7" fill="#059669" opacity="0.2" />
      <ellipse cx="400" cy="427" rx="200" ry="8" fill="#047857" opacity="0.1" />
      
      {/* Laptop en la mesa */}
      <g>
        {/* Base del laptop */}
        <rect x="320" y="395" width="160" height="8" rx="4" fill="#10B981" />
        {/* Pantalla */}
        <rect x="310" y="300" width="180" height="95" rx="4" fill="#059669" />
        <rect x="320" y="310" width="160" height="75" rx="2" fill="#D1FAE5" />
        {/* Detalles de la pantalla */}
        <rect x="330" y="320" width="60" height="4" rx="2" fill="#10B981" opacity="0.5" />
        <rect x="330" y="330" width="80" height="4" rx="2" fill="#10B981" opacity="0.3" />
        <rect x="330" y="340" width="70" height="4" rx="2" fill="#10B981" opacity="0.3" />
      </g>
      
      {/* Persona 1 - Mentor (izquierda) */}
      <g>
        {/* Cuerpo */}
        <ellipse cx="250" cy="450" rx="45" ry="15" fill="#047857" opacity="0.1" />
        <path d="M 250 350 Q 240 380 230 420 L 270 420 Q 260 380 250 350 Z" fill="#059669" />
        {/* Brazo derecho señalando */}
        <path d="M 265 370 Q 290 360 310 365" stroke="#047857" strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="312" cy="365" r="6" fill="#047857" />
        {/* Brazo izquierdo */}
        <path d="M 235 370 Q 215 390 220 410" stroke="#047857" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Cabeza */}
        <circle cx="250" cy="330" r="25" fill="#10B981" />
        {/* Cara sonriente */}
        <circle cx="243" cy="327" r="2.5" fill="#047857" />
        <circle cx="257" cy="327" r="2.5" fill="#047857" />
        <path d="M 243 337 Q 250 342 257 337" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Cabello */}
        <path d="M 230 320 Q 225 310 235 308 Q 240 305 245 307 Q 250 305 255 307 Q 260 305 265 308 Q 275 310 270 320" fill="#047857" />
      </g>
      
      {/* Persona 2 - Aprendiz (derecha) */}
      <g>
        {/* Cuerpo */}
        <ellipse cx="550" cy="450" rx="45" ry="15" fill="#059669" opacity="0.1" />
        <path d="M 550 360 Q 540 390 530 420 L 570 420 Q 560 390 550 360 Z" fill="#10B981" />
        {/* Brazo derecho tomando notas */}
        <path d="M 565 380 Q 585 390 590 410" stroke="#059669" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Brazo izquierdo */}
        <path d="M 535 380 Q 515 395 518 415" stroke="#059669" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Cabeza */}
        <circle cx="550" cy="340" r="25" fill="#34D399" />
        {/* Cara atenta */}
        <circle cx="543" cy="337" r="2.5" fill="#047857" />
        <circle cx="557" cy="337" r="2.5" fill="#047857" />
        <ellipse cx="550" cy="347" rx="4" ry="3" fill="#047857" opacity="0.6" />
        {/* Cabello */}
        <path d="M 530 330 Q 525 320 535 318 Q 540 315 545 317 Q 550 315 555 317 Q 560 315 565 318 Q 575 320 570 330" fill="#059669" />
      </g>
      
      {/* Libreta con notas (aprendiz) */}
      <g>
        <rect x="585" y="405" width="25" height="30" rx="2" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
        <line x1="590" y1="412" x2="605" y2="412" stroke="#10B981" strokeWidth="1.5" />
        <line x1="590" y1="418" x2="605" y2="418" stroke="#10B981" strokeWidth="1.5" />
        <line x1="590" y1="424" x2="600" y2="424" stroke="#10B981" strokeWidth="1.5" />
      </g>
      
      {/* Burbujas de diálogo decorativas */}
      <g opacity="0.6">
        {/* Burbuja 1 */}
        <circle cx="180" cy="280" r="8" fill="#10B981" />
        <circle cx="165" cy="290" r="5" fill="#10B981" opacity="0.7" />
        <circle cx="155" cy="297" r="3" fill="#10B981" opacity="0.5" />
        
        {/* Burbuja 2 */}
        <circle cx="620" cy="270" r="8" fill="#34D399" />
        <circle cx="635" cy="280" r="5" fill="#34D399" opacity="0.7" />
        <circle cx="645" cy="287" r="3" fill="#34D399" opacity="0.5" />
      </g>
      
      {/* Iconos flotantes decorativos */}
      <g opacity="0.4">
        {/* Estrella 1 */}
        <path d="M 120 200 L 125 215 L 140 215 L 128 224 L 133 239 L 120 230 L 107 239 L 112 224 L 100 215 L 115 215 Z" fill="#10B981" />
        
        {/* Estrella 2 */}
        <path d="M 680 380 L 685 395 L 700 395 L 688 404 L 693 419 L 680 410 L 667 419 L 672 404 L 660 395 L 675 395 Z" fill="#34D399" />
        
        {/* Corazón */}
        <path d="M 650 100 C 650 95 655 90 660 90 C 665 90 668 95 668 100 C 668 95 673 90 678 90 C 683 90 688 95 688 100 C 688 110 668 120 668 120 C 668 120 648 110 648 100 Z" fill="#6EE7B7" transform="translate(-5, 0)" />
      </g>
      
      {/* Líneas de conexión (representando comunicación) */}
      <g opacity="0.3">
        <path d="M 275 340 Q 350 320 480 340" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" fill="none" />
        <circle cx="350" cy="320" r="4" fill="#10B981" />
        <circle cx="400" cy="318" r="4" fill="#10B981" />
        <circle cx="450" cy="325" r="4" fill="#10B981" />
      </g>
      
      {/* Bombilla de idea (arriba centro) */}
      <g transform="translate(380, 150)">
        <ellipse cx="20" cy="45" rx="12" ry="4" fill="#047857" opacity="0.1" />
        <circle cx="20" cy="20" r="12" fill="#FDE047" opacity="0.8" />
        <path d="M 15 28 L 25 28 L 24 35 L 16 35 Z" fill="#F59E0B" opacity="0.8" />
        <rect x="17" y="35" width="6" height="3" rx="1" fill="#D97706" opacity="0.8" />
        {/* Rayitas de brillo */}
        <line x1="20" y1="5" x2="20" y2="0" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="12" x2="37" y2="9" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="28" x2="37" y2="31" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="3" y2="9" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="28" x2="3" y2="31" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default MentoriaIllustration;

