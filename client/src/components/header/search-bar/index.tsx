'use client'
import { JSX, useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

const SearchBar = (): JSX.Element => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSearchParam = searchParams.get('search') || '';

  const [inputValue, setInputValue] = useState(currentSearchParam);
  
  const lastParamRef = useRef(currentSearchParam);

  const handleSearchParams = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); 

    const cleanTerm = term.trim();

    if (cleanTerm) {
      params.set('search', cleanTerm);
    } else {
      params.delete('search');
    }

    lastParamRef.current = cleanTerm;
    replace(`${pathname}?${params.toString()}`);
  }, 400);

  const handleChange = (value: string) => {
    setInputValue(value);
    handleSearchParams(value);
  };

  const handleClear = () => {
    setInputValue('');
    lastParamRef.current = '';
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.delete('search');
    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== lastParamRef.current) {
      setInputValue(urlSearch);
      lastParamRef.current = urlSearch;
    }
  }, [searchParams]);

  return (
    <div className="flex items-center border rounded-xl h-10 pl-2 focus-within:ring-2 focus-within:ring-black">
      <input type="text" id="search" name="search" placeholder="Buscar productos..." value={inputValue} onChange={(e) => handleChange(e.target.value)} className="w-full outline-none border-r" />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="p-1 mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button className="self-stretch px-4 hover:bg-gray-300 hover:text-black rounded-xl transition-all duration-300 cursor-pointer">
        <Search className="w-5 h-5"/>
      </button>
    </div>
  )
};

export default SearchBar;

