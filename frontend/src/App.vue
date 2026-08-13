<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useAuth } from './composables/useAuth.js'
  import { analytics } from './firebase.js'

  const { checkAuth } = useAuth()

  onMounted(() => {
    checkAuth()

    if (analytics) {
      console.log('Firebase Analytics inicializado')
    }
  })
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      sans-serif;
    background:
      radial-gradient(
        circle at top left,
        rgba(22, 163, 74, 0.16),
        transparent 28%
      ),
      linear-gradient(135deg, #f5fff7 0%, #eef8f0 100%);
    color: #0f172a;
  }

  #app {
    min-height: 100vh;
  }
</style>
