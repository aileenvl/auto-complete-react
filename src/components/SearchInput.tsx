import React, { useState, useCallback, useEffect } from "react";
import "./SearchInput.css";
import { useDebounce } from "../hooks/debounceHook";

interface SuggestionItemProps {
  suggestion: string;
  onClick: (value: string) => void;
  inputValue: string;
}
export default function SearchInput() {
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value;
    setInputValue(value);
  };

  const prepareQuery = (value: string) => {
    const url = `https://restcountries.com/v3.1/name/${value}`;
    return encodeURI(url);
  };
    
  const getCountry = useCallback(async () => {
    if (!inputValue || inputValue.trim() === "") return;
    const URL = prepareQuery(inputValue);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(URL);
      const data = await response.json();
      const countries = data.map((country: any) => country.name.common);
      setSuggestions(countries);
    } catch (error: any) {
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [inputValue, prepareQuery]);

  const debouncedGetCountry = useDebounce(getCountry, 500);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
    } else {
      debouncedGetCountry();
    }
  }, [inputValue, debouncedGetCountry]);
    
  const handleSuggestionClick = useCallback(
    (value: string) => {
      setInputValue(value);
      setSuggestions([]);
    },
    []
  );

  const MemoizedSuggestionItem: React.FC<SuggestionItemProps> = React.memo(({ suggestion, onClick, inputValue }) => {
    const highlightMatchingPart = (text: string, highlight: string) => {
      if (!highlight || highlight.trim() === '') {
        return <span>{text}</span>;
      }
  
      const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const characters = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  
      return (
        <span>
          {characters.map((char, index) =>
            char.toLowerCase() === highlight.toLowerCase() ? (
              <strong key={index}>{char}</strong>
            ) : (
              <span key={index}>{char}</span>
            )
          )}
        </span>
      );
    };
  
    return (
      <li onClick={() => onClick(suggestion)} role="option">
        {highlightMatchingPart(suggestion, inputValue)}
      </li>
    );
  });
  
  return (
    <div>
      <input 
      className="input"
      value={inputValue}
      onChange={handleInputChange}
      aria-autocomplete="list"
      aria-controls="autocomplete-list"
      type="text"
      name="query" placeholder="Search..." />
      {loading && <p>Loading...</p>}
      {error && <p> No countries found</p>}
      {!loading && suggestions.length > 0 && (
        <ul id="autocomplete-list" className="suggestions-list" role="listbox">
          {suggestions.map((suggestion, index) => (
            <MemoizedSuggestionItem
            key={index}
            suggestion={suggestion}
            onClick={handleSuggestionClick}
            inputValue={inputValue}
          />
          ))}
        </ul>
      )}
    </div>
  );
}