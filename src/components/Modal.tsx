import React from 'react'

interface ModalProps {
  onClose: () => void
  onSelect: (type: 'js' | 'python') => void
}

const Modal: React.FC<ModalProps> = ({ onClose, onSelect }) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg'>
        <h2 className='text-xl font-bold mb-4'>Choose Code Type</h2>
        <div className='flex space-x-4'>
          <button
            onClick={() => onSelect('js')}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            JavaScript
          </button>
          <button
            onClick={() => onSelect('python')}
            className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
          >
            Python
          </button>
        </div>
        <button onClick={onClose} className='mt-4 text-gray-600 hover:text-gray-800'>
          Cancel
        </button>
      </div>
    </div>
  )
}
export default Modal
