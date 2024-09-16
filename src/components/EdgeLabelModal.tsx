import React, { useState, useEffect } from 'react'

interface EdgeLabelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (label: string) => void
  initialLabel: string
}

const EdgeLabelModal: React.FC<EdgeLabelModalProps> = ({ isOpen, onClose, onSave, initialLabel }) => {
  const [label, setLabel] = useState(initialLabel)

  useEffect(() => {
    setLabel(initialLabel)
  }, [initialLabel])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg'>
        <h2 className='text-xl font-bold mb-4'>Edit Edge Label</h2>
        <input
          type='text'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded mb-4'
        />
        <div className='flex justify-end'>
          <button onClick={onClose} className='mr-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'>
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
      </div>
    </div>
  )
}

export default EdgeLabelModal
