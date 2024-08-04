// app/page.js
'use client'

import { firestore } from '@/firebase'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import InventoryIcon from '@mui/icons-material/Inventory'
import { Alert, Box, Button, IconButton, Modal, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material'
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
import { CSSTransition } from 'react-transition-group'
import Filter from './Filter.js'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: 'background.paper',
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
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [itemName, setItemName] = useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleSnackbarClose = () => setSnackbarOpen(false)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []

    for (const docSnap of docs.docs) {
      const docData = docSnap.data()
      const normalizedItem = docSnap.id.toLowerCase()
      if (docSnap.id !== normalizedItem) {
        await setDoc(doc(collection(firestore, 'inventory'), normalizedItem), docData)
        await deleteDoc(docSnap.ref)
      }
      inventoryList.push({ name: normalizedItem, ...docData })
    }

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
    setSnackbarMessage('Item added successfully!')
    setSnackbarOpen(true)
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
    setSnackbarMessage('Item removed successfully!')
    setSnackbarOpen(true)
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
      sx={{
        background: 'linear-gradient(135deg, #ece9e6 25%, #ffffff 100%)',
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <CSSTransition in={open} timeout={300} classNames="fade" unmountOnExit>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{
            transition: 'opacity 0.3s ease-in-out',
            '&.fade-enter': { opacity: 0 },
            '&.fade-enter-active': { opacity: 1 },
            '&.fade-exit': { opacity: 1 },
            '&.fade-exit-active': { opacity: 0 },
          }}
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
                startIcon={<AddIcon />}
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
                sx={{
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                  },
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
      </CSSTransition>
      <Typography variant="h3" sx={{ my: 2 }}>
        Pantry Inventory
      </Typography>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: 2,
          borderRadius: 2,
          boxShadow: 2,
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography variant="body1">
          Summary: This project is designed to help you keep track of your pantry items. You can add, remove, and search for items in your inventory easily.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{
          mb: 2,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
          },
        }}
      >
        Add New Item
      </Button>
      <Filter onFilterChange={handleFilterChange} />
      <Box
        width="100%"
        maxWidth={800}
        borderRadius={2}
        overflow={'hidden'}
        boxShadow={3}
        bgcolor={'#fff'}
        mt={2}
      >
        <Box
          width="100%"
          bgcolor={'#1976d2'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          padding={2}
        >
          <Typography variant={'h4'} color={'#fff'} textAlign={'center'}>
            <InventoryIcon sx={{ mr: 1 }} />
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} padding={2} overflow={'auto'}>
          {filteredInventory.length > 0 ? (
            filteredInventory.map(({ name, quantity }) => (
              <Paper
                key={name}
                elevation={3}
                sx={{
                  padding: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <Typography variant={'h6'} color={'#333'} textAlign={'left'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                  Quantity: {quantity || 0}
                </Typography>
                <IconButton color="error" onClick={() => removeItem(name)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
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
