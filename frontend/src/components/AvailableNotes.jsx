import React, { useState } from 'react'

const AvailableNotes = () => {
  const [notes, setNotes] = useState([
    "Hassan.txt", 
    "Ahmed.txt",
    "Junaid.txt", 
    "Afia.txt", 
    "Salman.txt", 
    "Hashir.txt"
  ])

  return (
    <div className='max-h-200 overflow-auto rounded-lg'>
      {notes.map((item) => {
        return (
          <div className='w-full bg-white hover:bg-gray-100 text-gray-700 font-normal text-center text-xs py-2 border-b border-gray-200 ' key={item}>
            {item.split(".")[0]}
          </div>
        )
      })}
    </div>
  )
}

export default AvailableNotes