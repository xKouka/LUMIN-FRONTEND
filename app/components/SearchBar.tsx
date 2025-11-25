'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value: string;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  value,
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2 
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-brand-500 focus:border-transparent
          outline-none
          placeholder-gray-700   /* <-- más oscuro */
        "
      />
      {value && (
        <button
          onClick={() => onSearch('')}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
