// components/Filter.js
'use client'

import { TextField } from '@mui/material'
import { useState } from 'react'

const Filter = ({ onFilterChange }) => {
  const [filterText, setFilterText] = useState('')

  const handleChange = (event) => {
    const value = event.target.value
    setFilterText(value)
    onFilterChange(value)
  }

  return (
    <TextField
      label="Search Items"
      variant="outlined"
      fullWidth
      value={filterText}
      onChange={handleChange}
      sx={{ my: 2 }}
    />
  )
}

export default Filter
