import React from 'react';
import { MONITORES } from '../../constants/monitors';

export default function MonitorSelect({ monitor, onChange }) {
  return (
    <div className="mt-6">
      <label className="block font-semibold mb-1 text-[#003366]"><i className="fas fa-desktop"></i> Monitor de Destino</label>
      <select className="w-full cursor-pointer border border-gray-300 rounded-lg px-2 py-1 focus:border-[#003366] focus:ring-[#003366]" value={monitor} onChange={onChange}>
        {MONITORES.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  );
} 