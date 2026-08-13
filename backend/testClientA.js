import { io } from 'socket.io-client'

const socket = io('http://localhost:3333', { transports: ['websocket'] })

socket.on('connect', () => {
  console.log('[A] connected', socket.id)
  socket.emit('joinRoom', {
    roomId: 'product-test',
    userId: 'A',
    userName: 'Tester A',
  })
  setTimeout(() => {
    console.log('[A] sending message')
    socket.emit('chatMessage', {
      roomId: 'product-test',
      senderId: 'A',
      senderName: 'Tester A',
      text: 'Hello from A',
      timestamp: new Date().toISOString(),
    })
  }, 5000)
})

socket.on('chatMessage', (m) => {
  console.log('[A] received', m)
})

setTimeout(() => {
  socket.emit('leaveRoom', {
    roomId: 'product-test',
    userId: 'A',
    userName: 'Tester A',
  })
  socket.disconnect()
  console.log('[A] disconnected')
}, 20000)
