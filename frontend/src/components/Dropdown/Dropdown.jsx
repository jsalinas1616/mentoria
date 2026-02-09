import React, { useState, useEffect, useRef } from "react";
import { Users, Plus, ChevronDown, User, NotebookText } from "lucide-react";

const DropdownActions = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      
      {/* BOTÓN “NUEVO” */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center gap-2 shadow-lg"
      >
        <Plus size={18} />
        Nuevo
        <ChevronDown size={16} className={`${open ? "rotate-180" : ""} transition`} />
      </button>

      {/* DROPDOWN MENU */}
      {open && (
        <div className="absolute mt-2 w-70 bg-white border border-gray-200 rounded-md shadow-lg right-0 z-50 overflow-hidden animate-scale">
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex gap-2 items-center"
            onClick={() => window.location.href = "/#/dashboard/sesiones/nueva"}>
            <NotebookText size={16} /> Entrevista
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex gap-2 items-center"
            onClick={() => window.location.href = "/#/dashboard/acercamientos/nueva"}>
            <Users size={16} /> Contacto de vida
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex gap-2 items-center"
            onClick={() => window.location.href = "/#/dashboard/capacitaciones/nueva"}>
            <User size={16} /> Capacitación
          </button>
        </div>
      )}

    </div>
  );
}

export default DropdownActions;
