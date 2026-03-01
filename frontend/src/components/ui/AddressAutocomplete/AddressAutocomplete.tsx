import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import './AddressAutocomplete.css';

// Структура ответа DaData
interface DaDataSuggestion {
  value: string;
  data: {
    postal_code?: string;
    city?: string;
    city_with_type?: string;
    settlement?: string;
    settlement_with_type?: string;
    street?: string;
    street_with_type?: string;
    house?: string;
    flat?: string;  // Квартира от DaData
  };
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    city: string;
    street: string;
    house: string;
    postal_code: string;
    apartment: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  addressType?: 'apartment' | 'house';  // Тип адреса для фильтрации
}

// API ключ DaData (замени на свой!)
const DADATA_API_KEY = '618acfca073dbdbf80b2b9d13e12e5d014193a4d';
const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

export function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = 'Введите адрес',
  disabled = false,
  addressType
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Поиск адресов с задержкой (debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      // Фильтр в зависимости от типа адреса
      const filterOptions: any = {};
      if (addressType === 'apartment') {
        // Для квартир: показываем только квартиры (flat)
        filterOptions.from_bound = { value: 'flat' };
        filterOptions.to_bound = { value: 'flat' };
      } else if (addressType === 'house') {
        // Для домов: показываем только дома (house)
        filterOptions.from_bound = { value: 'house' };
        filterOptions.to_bound = { value: 'house' };
      }

      setLoading(true);
      try {
        const response = await fetch(DADATA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Token ${DADATA_API_KEY}`,
          },
          body: JSON.stringify({ 
            query,
            ...filterOptions,
          }),
        });

        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(true);
      } catch (error) {
        console.error('DaData error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Задержка 300ms

    return () => clearTimeout(timer);
  }, [query, addressType]);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: DaDataSuggestion) => {
    const { data } = suggestion;
    
    // Пытаемся получить квартиру из разных источников
    let apartment = '';
    
    // 1. Пробуем из data.flat (если DaData вернула)
    if (data.flat) {
      apartment = data.flat;
    } 
    // 2. Пробуем распарсить из value (полный адрес)
    else {
      const match = suggestion.value.match(/кв\.?\s*(\d+[А-Я]?)/i);
      if (match) {
        apartment = match[1];
      }
    }
    
    // Умное определение города/населённого пункта
    let city = '';
    
    // 1. Пробуем city (город)
    if (data.city) {
      city = data.city;
    }
    // 2. Пробуем settlement (посёлок/село/деревня)
    else if (data.settlement) {
      city = data.settlement;
    }
    // 3. Пробуем распарсить из value
    else {
      // Пробуем найти город/посёлок в начале строки
      const match = suggestion.value.match(/^([^,]+),/);
      if (match) {
        city = match[1].trim();
      }
    }
    
    // Заполняем поля адреса
    onAddressSelect({
      city: city,
      street: data.street || '',
      house: data.house || '',
      postal_code: data.postal_code || '',
      apartment: apartment,
    });

    setQuery(suggestion.value);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="address-autocomplete-wrapper" ref={wrapperRef}>
      <div className="address-autocomplete-input-wrapper">
        <MapPin size={18} className="address-autocomplete-icon" />
        <input
          type="text"
          className="address-autocomplete-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        {loading && <Loader2 size={18} className="address-autocomplete-loader" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="address-autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="address-autocomplete-item"
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin size={14} className="address-autocomplete-item-icon" />
              <span>{suggestion.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
