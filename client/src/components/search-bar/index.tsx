import { JSX } from 'react';
import SearchInput from './search-input';

const SearchBar = (): JSX.Element => {
  return (
    <section className="px-5 py-2">
      <SearchInput />
    </section>
  )
};

export default SearchBar;