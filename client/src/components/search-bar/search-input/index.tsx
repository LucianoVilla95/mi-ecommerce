import { JSX } from 'react';
import { Search } from 'lucide-react';

const SearchInput = (): JSX.Element => {
  return (
    <div className="flex items-center border rounded-2xl h-12 px-5 gap-3">
      <Search className="w-5 h-5"/>
      <input type="text" placeholder="Buscar productos..." className="w-full outline-none"/>
    </div>
  )
};

export default SearchInput;