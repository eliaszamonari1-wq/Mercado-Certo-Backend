import { io } from 'socket.io-client'

const socket = io('http://localhost:3333', { transports: ['websocket'] })

socket.on('connect', () => {
  console.log('[B] connected', socket.id)
  socket.emit('joinRoom', {
    roomId: 'product-test',
    userId: 'B',
    userName: 'Tester B',
  })
  setTimeout(() => {
    console.log('[B] sending message')
    socket.emit('chatMessage', {
      roomId: 'product-test',
      senderId: 'B',
      senderName: 'Tester B',
      text: 'Hi A, this is B',
      timestamp: new Date().toISOString(),
    })
  }, 5500)
})

socket.on('chatMessage', (m) => {
  console.log('[B] received', m)
})

setTimeout(() => {
  socket.emit('leaveRoom', {
    roomId: 'product-test',
    userId: 'B',
    userName: 'Tester B',
  })
  socket.disconnect()
  console.log('[B] disconnected')
}, 20000)
