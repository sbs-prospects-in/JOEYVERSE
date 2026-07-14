/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactType, setContactType] = useState('general');
  
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const openDonate = () => setIsDonateOpen(true);
  const closeDonate = () => setIsDonateOpen(false);

  const openContact = (type = 'general', pet = null) => {
    setSelectedPet(pet);
    setContactType(type);
    setIsContactOpen(true);
  };
  const closeContact = () => setIsContactOpen(false);

  const openAdoption = () => setIsAdoptionOpen(true);
  const closeAdoption = () => setIsAdoptionOpen(false);

  return (
    <ModalContext.Provider value={{ 
      isDonateOpen, openDonate, closeDonate,
      isContactOpen, contactType, openContact, closeContact,
      isAdoptionOpen, selectedPet, openAdoption, closeAdoption, setSelectedPet
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
