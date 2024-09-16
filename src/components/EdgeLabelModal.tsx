import React, { useState, useEffect } from 'react'

interface EdgeLabelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (label: string) => void
  initialLabel: string
}

const EdgeLabelModal: React.FC<EdgeLabelModalProps> = ({ isOpen, onClose, onSave, initialLabel }) => {
  const [label, setLabel] = useState(initialLabel)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setLabel(initialLabel)
    setIsVisible(isOpen)
  }, [initialLabel, isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-[#131316] p-6 rounded-lg relative transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className='text-xl text-white font-semibold mb-4'>Add edge label</h2>
        <input
          type='text'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className='w-full p-2 border border-gray-700  ring-0 focus:ring-0 focus:outline-none rounded mb-4 bg-[#1E1E1E] text-white'
        />
        <div className='flex justify-end space-x-4'>
          <button onClick={onClose} className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'>
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(label)
              onClose()
            }}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Save
          </button>
        </div>
        <button onClick={onClose} className='text-white absolute top-2 right-4 font-bold hover:text-gray-500'>
          x
        </button>
      </div>
    </div>
  )
}

export default EdgeLabelModal
