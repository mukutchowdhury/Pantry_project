// page.js
'use client'

import { firestore } from '@/firebase'
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Filter from './Filter.js'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const normalizedItem = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), normalizedItem)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: (quantity || 0) + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const normalizedItem = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), normalizedItem)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 })
      } else {
        await deleteDoc(docRef)
      }
    }
    await updateInventory()
  }

  const handleFilterChange = (filterText) => {
    const filteredList = inventory.filter(item =>
      item.name.toLowerCase().includes(filterText.toLowerCase())
    )
    setFilteredInventory(filteredList)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      padding={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Typography variant="h3" sx={{ my: 2 }}>
        Pantry Inventory
      </Typography>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      <Filter onFilterChange={handleFilterChange} />
      <Box
        width="100%"
        maxWidth={800}
        border={'1px solid #333'}
        borderRadius={2}
        overflow={'hidden'}
        boxShadow={3}
        bgcolor={'#f9f9f9'}
      >
        <Box
          width="100%"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          padding={2}
        >
          <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} padding={2} overflow={'auto'}>
          {filteredInventory.length > 0 ? (
            filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#fff'}
                padding={2}
                borderRadius={1}
                boxShadow={1}
              >
                <Typography variant={'h6'} color={'#333'} textAlign={'left'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                  Quantity: {quantity || 0}
                </Typography>
                <Button variant="contained" color="error" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant="h6" color="#333" textAlign="center">
              No items found
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
