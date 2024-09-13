import React, { useState, useEffect } from 'react'

interface ModalProps {
  onClose: () => void
  onSelect: (type: 'js' | 'python') => void
}

const Modal: React.FC<ModalProps> = ({ onClose, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`bg-[#131316] p-6 rounded-lg relative transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <h2 className='text-xl text-white font-semibold mb-4'>Choose Language</h2>
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
        <button onClick={onClose} className='text-white absolute top-2 right-4 font-bold hover:text-gray-500'>
          x
        </button>
      </div>
    </div>
  )
}
export default Modal
