import React, { createContext, useState, useContext } from 'react'

type EdgeLabelContextType = {
  edgeLabels: { [key: string]: string }
  updateEdgeLabel: (id: string, label: string) => void
  getEdgeLabel: (id: string, defaultLabel: string) => string
}

const EdgeLabelContext = createContext<EdgeLabelContextType | undefined>(undefined)

export const EdgeLabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [edgeLabels, setEdgeLabels] = useState<{ [key: string]: string }>({})

  const updateEdgeLabel = (id: string, label: string) => {
    setEdgeLabels((prev) => ({ ...prev, [id]: label }))
  }

  const getEdgeLabel = (id: string, defaultLabel: string) => {
    return edgeLabels[id] || defaultLabel
  }

  return (
    <EdgeLabelContext.Provider value={{ edgeLabels, updateEdgeLabel, getEdgeLabel }}>
      {children}
    </EdgeLabelContext.Provider>
  )
}

export const useEdgeLabel = () => {
  const context = useContext(EdgeLabelContext)
  if (context === undefined) {
    throw new Error('useEdgeLabel must be used within an EdgeLabelProvider')
  }
  return context
}
