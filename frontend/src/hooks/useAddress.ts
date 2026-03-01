import { useContext } from 'react';
import { AddressContext } from '../context/AddressContext';

export function useAddress() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}
