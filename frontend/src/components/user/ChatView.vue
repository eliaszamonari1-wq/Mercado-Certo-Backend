<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Conversa com {{ otherUser.name }}</h2>
      <div v-if="listing" class="listing-context">
        <strong>📦 {{ listing.title }}</strong>
        <span v-if="listing.category">{{ listing.category }}</span>
        <span v-if="listing.price">R$ {{ formatPrice(listing.price) }}</span>
      </div>
      <p class="chat-purpose">
        Tire dúvidas, confirme detalhes ou diga que quer comprar este produto.
      </p>
      <p v-if="errorMessage" class="chat-error">{{ errorMessage }}</p>
    </div>

    <div class="chat-messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'message',
          msg.senderId === currentUserId ? 'sent' : 'received',
        ]"
      >
        <div class="message-content">
          <p>{{ msg.content }}</p>
          <span class="timestamp">{{ formatTime(msg.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="chat-input-section">
      <div class="intent-actions">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          :class="{ selected: selectedIntent === template.id }"
          @click="selectTemplate(template)"
        >
          {{ template.title }}
        </button>
      </div>

      <form @submit.prevent="sendMessage" class="chat-form">
        <textarea
          v-model="messageContent"
          placeholder="Digite sua mensagem..."
          @keydown.enter.ctrl="sendMessage"
        ></textarea>
        <button type="submit" class="btn-send">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { onAuthStateChanged } from 'firebase/auth'
  import { useRoute } from 'vue-router'
  import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
  } from 'firebase/firestore'
  import { auth, db } from '../../firebase.js'

  const route = useRoute()
  const messageContent = ref('')
  const messages = ref([])
  const templates = ref([])
  const showTemplates = ref(false)
  const otherUser = ref({})
  const listing = ref(null)
  const currentUserId = ref(auth.currentUser?.uid || null)
  const currentUserName = ref('Usuário')
  const conversationId = ref('')
  const errorMessage = ref('')
  const selectedIntent = ref('question')
  let unsubscribeMessages = null

  const formatTime = (timestamp) => {
    if (!timestamp) return 'agora'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) =>
    Number(price || 0)
      .toFixed(2)
      .replace('.', ',')

  const selectTemplate = (template) => {
    messageContent.value = template.content
    selectedIntent.value = template.id
    showTemplates.value = true
  }

  const sendMessage = async () => {
    if (!messageContent.value.trim() || !conversationId.value) return

    try {
      await addDoc(
        collection(db, 'conversations', conversationId.value, 'messages'),
        {
          content: messageContent.value.trim(),
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          intent: selectedIntent.value,
          createdAt: serverTimestamp(),
        },
      )

      await setDoc(
        doc(db, 'conversations', conversationId.value),
        {
          lastMessage: messageContent.value.trim(),
          lastMessageAt: serverTimestamp(),
          lastIntent: selectedIntent.value,
        },
        { merge: true },
      )

      if (otherUser.value.id && otherUser.value.id !== currentUserId.value) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: otherUser.value.id,
          recipientEmail: null,
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          conversationId: conversationId.value,
          type: 'new_chat_message',
          title: 'Nova mensagem no chat',
          message: `${currentUserName.value} enviou uma mensagem sobre "${listing.value?.title || 'um produto'}".`,
          listingId: listing.value?.id || String(route.query.listing_id || ''),
          listingName: listing.value?.title || 'Produto',
          read: false,
          createdAt: new Date().toISOString(),
        })
      }

      messageContent.value = ''
    } catch (error) {
      errorMessage.value = 'Não foi possível enviar a mensagem.'
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const startConversation = async () => {
    const sellerId = String(route.query.seller_id || '')
    const listingId = String(route.query.listing_id || '')

    if (!currentUserId.value || !sellerId || !listingId) {
      errorMessage.value = 'É necessário estar logado e informar o anúncio.'
      return
    }

    const participantIds = [currentUserId.value, sellerId].sort()
    conversationId.value = `${listingId}_${participantIds.join('_')}`
    otherUser.value = {
      id: sellerId,
      name: route.query.seller_name || 'vendedor',
    }
    listing.value = route.query.listing_title
      ? {
          title: route.query.listing_title,
          category: route.query.listing_category,
          price: route.query.listing_price,
        }
      : null

    await setDoc(
      doc(db, 'conversations', conversationId.value),
      {
        listingId,
        participantIds,
        sellerName: otherUser.value.name,
        listingTitle: listing.value?.title || 'Produto',
        listingCategory: listing.value?.category || null,
        listingPrice: listing.value?.price || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const subscribeToMessages = () => {
    if (!conversationId.value) return

    const messagesQuery = query(
      collection(db, 'conversations', conversationId.value, 'messages'),
      orderBy('createdAt', 'asc'),
    )

    unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        messages.value = snapshot.docs.map((message) => ({
          id: message.id,
          ...message.data(),
        }))
      },
      (error) => {
        errorMessage.value = 'Não foi possível carregar as mensagens.'
        console.error('Erro ao observar mensagens:', error)
      },
    )
  }

  const loadTemplates = async () => {
    templates.value = [
      {
        id: 'buy',
        title: 'Quero comprar',
        content:
          'Olá! Tenho interesse em comprar este produto. Como podemos finalizar?',
      },
      {
        id: 'question',
        title: 'Tirar uma dúvida',
        content: 'Olá! Tenho uma dúvida sobre este produto: ',
      },
      {
        id: 'added',
        title: 'O que foi adicionado?',
        content:
          'Olá! Pode me explicar os detalhes e o que foi adicionado neste produto?',
      },
      {
        id: 'shipping',
        title: 'Entrega e retirada',
        content: 'Olá! Quais são as opções de entrega ou retirada?',
      },
    ]
  }

  const waitForAuth = () =>
    new Promise((resolve) => {
      if (auth.currentUser) {
        resolve(auth.currentUser)
        return
      }

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe()
        resolve(firebaseUser)
      })
    })

  onMounted(async () => {
    try {
      const firebaseUser = await waitForAuth()
      if (firebaseUser) {
        currentUserId.value = firebaseUser.uid
        currentUserName.value =
          firebaseUser.displayName || firebaseUser.email || 'Usuário'
      }
      await startConversation()
      subscribeToMessages()
    } catch (error) {
      errorMessage.value = 'Não foi possível iniciar a conversa.'
      console.error('Erro ao iniciar conversa:', error)
    }
    loadTemplates()
  })

  onUnmounted(() => {
    unsubscribeMessages?.()
  })
</script>

<style scoped>
  .chat-container {
    max-width: 800px;
    margin: 0 auto;
    height: 600px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .chat-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }

  .chat-header h2 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  .listing-ref {
    margin: 0;
    font-size: 13px;
    color: #666;
  }

  .listing-context {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 10px;
    padding: 10px 12px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #f7fbf8;
    color: #365344;
    font-size: 13px;
  }

  .chat-purpose {
    margin: 10px 0 0;
    color: #64766b;
    font-size: 13px;
  }

  .chat-error {
    margin: 8px 0 0;
    color: #b42318;
    font-size: 13px;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message {
    display: flex;
    margin-bottom: 12px;
  }

  .message.sent {
    justify-content: flex-end;
  }

  .message-content {
    max-width: 60%;
    padding: 10px 12px;
    border-radius: 8px;
    word-wrap: break-word;
  }

  .message.sent .message-content {
    background: #1971c2;
    color: white;
  }

  .message.received .message-content {
    background: #f0f0f0;
    color: #333;
  }

  .message-content p {
    margin: 0;
    font-size: 14px;
  }

  .timestamp {
    display: block;
    font-size: 11px;
    margin-top: 4px;
    opacity: 0.7;
  }

  .chat-input-section {
    padding: 16px;
    border-top: 1px solid #eee;
  }

  .intent-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .intent-actions button {
    padding: 8px 10px;
    border: 1px solid #cfe0d4;
    border-radius: 999px;
    background: #fff;
    color: #28603f;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
  }

  .intent-actions button.selected,
  .intent-actions button:hover {
    border-color: #16804b;
    background: #eaf7ee;
  }

  .templates {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }

  .templates h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #666;
  }

  .template-btn {
    display: inline-block;
    padding: 6px 8px;
    margin: 4px 4px 4px 0;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .template-btn:hover {
    background: #e0e0e0;
  }

  .chat-form {
    display: flex;
    gap: 8px;
  }

  textarea {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    height: 60px;
  }

  textarea:focus {
    outline: none;
    border-color: #1971c2;
    box-shadow: 0 0 4px rgba(25, 113, 194, 0.2);
  }

  .btn-send {
    padding: 10px 20px;
    background: #1971c2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .btn-send:hover {
    background: #1566a8;
  }
</style>
