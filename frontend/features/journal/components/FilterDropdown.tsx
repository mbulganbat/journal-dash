import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

// Custom Dropdown Component for Filters
export const FilterDropdown = ({ label, value, options, onChange, icon: Icon, placeholder }: { label?: string, value: string, options: {value: string, label: string}[], onChange: (val: string) => void, icon?: React.ElementType, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative min-w-[160px]" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#16161A] border ${isOpen ? 'border-[#00FFB2]/40' : 'border-white/[0.08]'} rounded-xl h-11 px-4 flex justify-between items-center text-text-1 hover:border-[#00FFB2]/20 transition-all cursor-pointer select-none gap-3`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-text-3" />}
          <span className="text-sm font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <IconChevronDown size={15} className="text-text-3" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#16161A] border border-white/[0.1] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-[100] max-h-60 overflow-y-auto py-1"
          >
            <div
              onClick={() => { onChange(''); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                value === ''
                  ? 'text-[#00FFB2] bg-[#00FFB2]/[0.08] font-semibold'
                  : 'text-text-2 hover:bg-white/[0.06] hover:text-[#00FFB2]'
              }`}
            >
              {placeholder}
              {value === '' && <IconCheck size={14} />}
            </div>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  value === opt.value
                    ? 'text-[#00FFB2] bg-[#00FFB2]/[0.08] font-semibold'
                    : 'text-text-2 hover:bg-white/[0.06] hover:text-[#00FFB2]'
                }`}
              >
                {opt.label}
                {value === opt.value && <IconCheck size={14} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
