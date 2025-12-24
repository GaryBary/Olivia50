
import React from 'react';
import { SelectionItem } from '../types';

interface SelectionCardProps {
  item: SelectionItem;
  isSelected: boolean;
  onSelect: (item: SelectionItem) => void;
  variant?: 'horizontal' | 'vertical';
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ item, isSelected, onSelect, variant = 'vertical' }) => {
  const isShow = !!item.venue;
  
  const containerClasses = `
    relative group cursor-pointer transition-all duration-500 overflow-hidden
    ${isSelected ? 'border-[#d4af37] ring-1 ring-[#d4af37] scale-[1.02]' : 'border-white/10 hover:border-white/30'}
    ${variant === 'vertical' ? 'w-full aspect-[4/5]' : 'flex-shrink-0 w-80 h-[550px]'}
    rounded-2xl border bg-[#0a0e1a]/80 shadow-2xl
  `;

  return (
    <div 
      className={containerClasses}
      onClick={() => onSelect(item)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/70 to-transparent" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        {item.criticRating && (
          <div className="bg-[#d4af37] text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
            {item.criticRating}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
        <div className="z-10 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent absolute inset-0 -mb-2" />
        
        <div className="relative z-20">
          {item.dates && (
            <span className="text-[#d4af37] text-xs font-semibold tracking-[0.2em] uppercase mb-1 block">
              {item.dates}
            </span>
          )}
          <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-[#d4af37] transition-colors duration-300 leading-tight luxury-font">
            {item.name}
          </h3>
          
          {item.venue && (
            <p className="text-[#d4af37]/80 text-[10px] mb-3 font-medium uppercase tracking-widest">{item.venue}</p>
          )}

          {item.topFeatures && item.topFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.topFeatures.map((feature, i) => (
                <span key={i} className="bg-white/10 text-[9px] text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/20 uppercase tracking-wider">
                  {feature}
                </span>
              ))}
            </div>
          )}

          {item.signatureDish && (
            <div className="mb-3">
               <span className="text-white/50 text-[10px] uppercase tracking-widest block mb-1">Signature Dish</span>
               <p className="text-white text-xs font-serif italic">"{item.signatureDish}"</p>
            </div>
          )}

          <div className={`
            text-gray-300 text-sm leading-relaxed mb-4 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar
            ${isShow ? 'font-serif italic luxury-font' : 'line-clamp-3 group-hover:line-clamp-none'}
            transition-all duration-300
          `}>
            {item.description}
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[#d4af37] font-medium tracking-tighter text-sm">{item.priceRange}</span>
              {item.location && <span className="text-gray-400 text-[10px] opacity-75 uppercase tracking-wider">• {item.location}</span>}
            </div>
            
            <div className={`
              w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
              ${isSelected ? 'bg-[#d4af37] text-black shadow-[0_0_15px_#d4af37]' : 'bg-white/10 text-white group-hover:bg-[#d4af37] group-hover:text-black shadow-lg'}
            `}>
              {isSelected ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
