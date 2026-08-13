import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyAK8rbsT7gwFGI2jEJK6f08YD19sGix0RE',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'betastore-18b12.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'betastore-18b12',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'betastore-18b12.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '611691043433',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:611691043433:web:88f5adb05dd91cca8a20f8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8Z75VDDLFP',
}

const app = initializeApp(firebaseConfig)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
const auth = getAuth(app)
const db = getFirestore(app)

export { analytics, app, auth, db }
