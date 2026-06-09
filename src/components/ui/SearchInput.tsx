'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useTransition, useEffect, Suspense } from 'react';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

function SearchInputInner({ placeholder = "Search by model name...", className = "" }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') || '';
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Search-as-you-type debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== currentSearch) {
        handleSearch(value.trim());
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="absolute left-4 text-charcoal-light/50">
        <Search className="w-4.5 h-4.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(value.trim());
          }
        }}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-sage/20 bg-white/70 backdrop-blur-sm text-sm text-charcoal placeholder-charcoal-light/50 focus:border-sage focus:ring-0 outline-none transition-all shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            handleSearch('');
          }}
          className="absolute right-3 p-1 rounded-full text-charcoal-light/50 hover:text-charcoal hover:bg-sage/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function SearchInput(props: SearchInputProps) {
  return (
    <Suspense fallback={
      <div className={`relative flex items-center ${props.className || ''}`}>
        <div className="absolute left-4 text-charcoal-light/30">
          <Search className="w-4.5 h-4.5 animate-pulse" />
        </div>
        <div className="w-full h-10 bg-white/50 border border-sage/10 rounded-xl animate-pulse" />
      </div>
    }>
      <SearchInputInner {...props} />
    </Suspense>
  );
}
