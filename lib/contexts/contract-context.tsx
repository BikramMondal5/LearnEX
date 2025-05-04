"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Organization interface
export interface Organization {
  name: string
  contractAddress: string
}

// Context type definition
interface ContractContextType {
  currentContractAddress: string
  setCurrentContractAddress: (address: string) => void
  organizations: Organization[]
  setOrganizations: (orgs: Organization[]) => void
  currentOrganization: Organization | null
  switchOrganization: (orgAddress: string) => void
  addOrganization: (org: Organization) => void
  removeOrganization: (address: string) => void
}

// Default context values
const defaultContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xe12D1e1698d7E07206b5C6C49466631c4dDfbF1B'

// Create the context
const ContractContext = createContext<ContractContextType>({
  currentContractAddress: defaultContractAddress,
  setCurrentContractAddress: () => {},
  organizations: [],
  setOrganizations: () => {},
  currentOrganization: null,
  switchOrganization: () => {},
  addOrganization: () => {},
  removeOrganization: () => {},
})

// Custom hook to use the contract context
export const useContract = () => useContext(ContractContext)

// Provider component
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentContractAddress, setCurrentContractAddress] = useState<string>(defaultContractAddress)
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      name: 'Default Organization',
      contractAddress: defaultContractAddress,
    }
  ])

  // Get the current organization based on the current contract address
  const currentOrganization = organizations.find(org => org.contractAddress === currentContractAddress) || null

  // Load organizations from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrgs = localStorage.getItem('organizations')
      const savedAddress = localStorage.getItem('currentContractAddress')
      
      if (savedOrgs) {
        try {
          const parsedOrgs = JSON.parse(savedOrgs)
          setOrganizations(parsedOrgs)
        } catch (error) {
          console.error('Failed to parse saved organizations:', error)
        }
      }
      
      if (savedAddress) {
        setCurrentContractAddress(savedAddress)
      }
    }
  }, [])

  // Save organizations to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('organizations', JSON.stringify(organizations))
    }
  }, [organizations])

  // Save current contract address to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentContractAddress', currentContractAddress)
    }
  }, [currentContractAddress])

  // Switch to a different organization by contract address
  const switchOrganization = (orgAddress: string) => {
    const org = organizations.find(o => o.contractAddress === orgAddress)
    if (org) {
      setCurrentContractAddress(org.contractAddress)
    }
  }

  // Add a new organization
  const addOrganization = (org: Organization) => {
    // Check if organization with this address already exists
    if (!organizations.some(o => o.contractAddress === org.contractAddress)) {
      setOrganizations([...organizations, org])
    }
  }

  // Remove an organization
  const removeOrganization = (address: string) => {
    // Don't remove the last organization
    if (organizations.length <= 1) {
      return
    }
    
    const newOrgs = organizations.filter(org => org.contractAddress !== address)
    setOrganizations(newOrgs)
    
    // If we're removing the current organization, switch to the first available
    if (currentContractAddress === address && newOrgs.length > 0) {
      setCurrentContractAddress(newOrgs[0].contractAddress)
    }
  }

  const value = {
    currentContractAddress,
    setCurrentContractAddress,
    organizations,
    setOrganizations,
    currentOrganization,
    switchOrganization,
    addOrganization,
    removeOrganization,
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
} 