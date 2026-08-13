import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { computed, ref } from 'vue'
import { auth } from '../firebase.js'

const user = ref(null)
const loading = ref(false)
const error = ref(null)

const adminEmails = new Set(['elias@test.com'])

const isAuthenticated = computed(() => !!user.value)

const authPersistencePromise = setPersistence(auth, browserLocalPersistence)

// Load user from localStorage on init
const savedUser = localStorage.getItem('user')
if (savedUser) {
  try {
    user.value = JSON.parse(savedUser)
  } catch (e) {
    console.warn('Failed to load saved user', e)
  }
}

function persistSession(firebaseUser) {
  const isAdmin = adminEmails.has(firebaseUser.email?.toLowerCase())
  const userData = {
    id: firebaseUser.uid,
    name:
      firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    username: firebaseUser.email?.split('@')[0] || 'user',
    email: firebaseUser.email,
    is_admin: isAdmin,
  }

  localStorage.setItem('token', firebaseUser.accessToken)
  localStorage.setItem('user', JSON.stringify(userData))
  user.value = userData
  return userData
}

export function useAuth() {
  const getAuthErrorMessage = (authError, fallback) => {
    const messages = {
      'auth/invalid-email': 'Digite um email válido para entrar.',
      'auth/invalid-credential': 'Email ou senha incorretos.',
      'auth/user-not-found': 'Não existe uma conta com este email.',
      'auth/wrong-password': 'Email ou senha incorretos.',
      'auth/operation-not-allowed':
        'Login por email está desativado no Firebase Authentication.',
      'auth/network-request-failed':
        'Não foi possível conectar ao Firebase. Verifique sua internet.',
      'auth/popup-closed-by-user': 'Login com Google cancelado.',
      'auth/unauthorized-domain':
        'Este domínio não está autorizado no Firebase Authentication.',
      'auth/too-many-requests':
        'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    }

    return messages[authError.code] || authError.message || fallback
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      await authPersistencePromise
      const email = (credentials.email || credentials.username)
        .trim()
        .toLowerCase()

      // Firebase email/password login
      const firebaseResult = await signInWithEmailAndPassword(
        auth,
        email,
        credentials.password,
      )

      persistSession(firebaseResult.user)
      return { user: user.value, token: firebaseResult.user.accessToken }
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Erro ao fazer login')
      error.value = message
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null

    try {
      // Create user with Firebase Auth
      const firebaseResult = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      )

      // Update profile with display name
      if (userData.name) {
        await firebaseUpdateProfile(firebaseResult.user, {
          displayName: userData.name,
        })
      }

      persistSession(firebaseResult.user)
      return { user: user.value, token: firebaseResult.user.accessToken }
    } catch (err) {
      const message = err.message || 'Erro ao registrar'
      error.value = message
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null

    try {
      await authPersistencePromise
      const provider = new GoogleAuthProvider()
      const firebaseResult = await signInWithPopup(auth, provider)
      persistSession(firebaseResult.user)
      return { user: user.value, token: firebaseResult.user.accessToken }
    } catch (err) {
      const message = err.message || 'Erro ao fazer login com Google'
      error.value = message
      throw message
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    if (!email) {
      throw new Error('Informe um email para recuperar a senha.')
    }

    try {
      await sendPasswordResetEmail(auth, email)
      return { message: 'E-mail de recuperação enviado.' }
    } catch (err) {
      const message = err.message || 'Não foi possível enviar o e-mail.'
      error.value = message
      throw message
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
  }

  const checkAuth = async () => {
    await authPersistencePromise

    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        unsubscribe()

        if (firebaseUser) {
          persistSession(firebaseUser)
          resolve(true)
        } else {
          user.value = null
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          resolve(false)
        }
      })
    })
  }

  const getProfile = async () => {
    const firebaseUser = auth.currentUser

    if (!firebaseUser) {
      user.value = null
      return null
    }

    persistSession(firebaseUser)
    return { user: user.value }
  }

  const updateProfile = async (profileData) => {
    loading.value = true
    error.value = null

    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) throw new Error('Not authenticated')

      // Update Firebase profile if name changed
      if (profileData.name && profileData.name !== firebaseUser.displayName) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: profileData.name,
        })
      }

      persistSession(firebaseUser)
      return { user: user.value }
    } catch (err) {
      error.value = err.message || 'Erro ao atualizar perfil'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    logout,
    checkAuth,
    getProfile,
    updateProfile,
  }
}
