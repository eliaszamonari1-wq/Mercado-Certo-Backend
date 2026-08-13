<template>
  <!-- cSpell:disable -->
  <div class="settings-page">
    <header class="settings-nav">
      <button class="btn-back" @click="goBack" aria-label="Voltar">
        ← Voltar
      </button>
      <div class="settings-brand">
        <span class="brand-icon">⚙️</span>
        <h1>Configurações</h1>
      </div>
      <div class="settings-spacer"></div>
    </header>

    <section class="settings-panel">
      <div class="settings-card">
        <div class="settings-summary">
          <div class="settings-avatar">👤</div>
          <div>
            <p class="summary-eyebrow">Perfil ativo</p>
            <h2>{{ user?.name || user?.username || 'Usuário' }}</h2>
            <p class="summary-copy">
              Ajustes rápidos para manter sua conta organizada.
            </p>
          </div>
        </div>

        <form @submit.prevent="handleAccountUpdate" novalidate>
          <div class="settings-row">
            <label for="settings-name" class="settings-label"> 👤 Nome </label>
            <input
              id="settings-name"
              type="text"
              v-model="settings.name"
              placeholder="Nome completo"
              autocomplete="name"
              :aria-invalid="!!nameError"
              @input="clearError('name')"
            />
            <p v-if="nameError" class="field-error">{{ nameError }}</p>
          </div>

          <div class="settings-row">
            <label for="settings-email" class="settings-label">
              ✉️ Email
            </label>
            <div class="email-display">
              <input
                id="settings-email"
                type="email"
                :value="userEmail"
                disabled
                aria-disabled="true"
              />
              <span class="email-hint">Email não pode ser alterado</span>
            </div>
          </div>

          <div class="settings-row">
            <label for="settings-password" class="settings-label">
              🔒 Nova senha
              <span class="optional-badge">Opcional</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="settings-password"
                :type="showPassword ? 'text' : 'password'"
                v-model="settings.password"
                placeholder="Deixe em branco para manter"
                autocomplete="new-password"
                :aria-invalid="!!passwordError"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
            <div
              v-if="settings.password && !passwordError"
              class="password-strength"
            >
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :class="passwordStrength.class"
                  :style="{ width: passwordStrength.percentage + '%' }"
                ></div>
              </div>
              <span class="strength-label">{{ passwordStrength.label }}</span>
            </div>
          </div>

          <div class="settings-actions">
            <button
              type="submit"
              class="btn-primary"
              :disabled="isUpdating || !isFormValid"
              :class="{ 'btn-loading': isUpdating }"
            >
              <span v-if="isUpdating" class="spinner"></span>
              <span v-else>💾 Salvar alterações</span>
            </button>
            <button
              type="button"
              class="btn-logout"
              @click="handleLogout"
              :disabled="isUpdating"
            >
              🚪 Sair da conta
            </button>
          </div>
        </form>

        <p v-if="updateSuccess" class="success-message">
          <span class="success-icon">✅</span>
          {{ updateSuccess }}
        </p>
        <p v-if="updateError" class="field-error">
          <span class="error-icon">❌</span>
          {{ updateError }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useAuth } from '../../composables/useAuth.js'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const { user, logout, getProfile, updateProfile } = useAuth()

  // Estado do formulário
  const settings = ref({
    name: '',
    password: '',
  })

  // Estado da UI
  const isUpdating = ref(false)
  const showPassword = ref(false)
  const updateError = ref('')
  const updateSuccess = ref('')
  const nameError = ref('')
  const passwordError = ref('')
  const formTouched = ref(false)

  // Computed
  const userEmail = computed(() => user.value?.email || '')

  const isFormValid = computed(() => {
    const nameValid = settings.value.name
      ? settings.value.name.length >= 2
      : true
    const passwordValid = settings.value.password
      ? settings.value.password.length >= 6
      : true
    return (
      nameValid && passwordValid && !nameError.value && !passwordError.value
    )
  })

  const passwordStrength = computed(() => {
    const password = settings.value.password
    if (!password) return { label: '', class: '', percentage: 0 }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const maxScore = 5
    const percentage = (score / maxScore) * 100

    const strengthMap = {
      0: { label: 'Muito fraca', class: 'strength-very-weak' },
      1: { label: 'Fraca', class: 'strength-weak' },
      2: { label: 'Média', class: 'strength-medium' },
      3: { label: 'Forte', class: 'strength-strong' },
      4: { label: 'Muito forte', class: 'strength-very-strong' },
      5: { label: 'Excelente', class: 'strength-excellent' },
    }

    const key = Math.min(score, 5)
    return {
      ...strengthMap[key],
      percentage,
    }
  })

  // Métodos
  const loadSettings = async () => {
    if (user.value) {
      settings.value.name = user.value.name || ''
      settings.value.password = ''
    }
  }

  const validateName = () => {
    const name = settings.value.name.trim()
    if (name && name.length < 2) {
      nameError.value = 'Nome deve ter pelo menos 2 caracteres.'
      return false
    }
    nameError.value = ''
    return true
  }

  const validatePassword = () => {
    const password = settings.value.password
    if (password && password.length < 6) {
      passwordError.value = 'Senha deve ter pelo menos 6 caracteres.'
      return false
    }
    passwordError.value = ''
    return true
  }

  const validateAll = () => {
    formTouched.value = true
    const isNameValid = validateName()
    const isPasswordValid = validatePassword()
    return isNameValid && isPasswordValid
  }

  const clearError = (field) => {
    if (field === 'name') nameError.value = ''
    if (field === 'password') passwordError.value = ''
    if (field === 'all') {
      nameError.value = ''
      passwordError.value = ''
      updateError.value = ''
      updateSuccess.value = ''
    }
  }

  const handleAccountUpdate = async () => {
    clearError('all')

    if (!validateAll()) {
      if (nameError.value) {
        document.getElementById('settings-name')?.focus()
      } else if (passwordError.value) {
        document.getElementById('settings-password')?.focus()
      }
      return
    }

    if (isUpdating.value) return

    isUpdating.value = true
    updateError.value = ''
    updateSuccess.value = ''

    try {
      const payload = {}

      if (settings.value.name.trim() !== user.value?.name) {
        payload.name = settings.value.name.trim()
      }

      if (settings.value.password) {
        payload.password = settings.value.password
      }

      if (Object.keys(payload).length === 0) {
        updateSuccess.value = 'Nenhuma alteração foi feita.'
        return
      }

      await updateProfile(payload)
      await getProfile()

      updateSuccess.value = '✅ Perfil atualizado com sucesso!'
      settings.value.password = ''
      formTouched.value = false

      setTimeout(() => {
        if (updateSuccess.value) updateSuccess.value = ''
      }, 5000)
    } catch (err) {
      updateError.value =
        typeof err === 'string'
          ? `❌ ${err}`
          : '❌ Erro ao atualizar perfil. Tente novamente.'
      console.error('Erro ao atualizar perfil:', err)
    } finally {
      isUpdating.value = false
    }
  }

  const handleLogout = async () => {
    if (isUpdating.value) return

    if (!confirm('Tem certeza que deseja sair da sua conta?')) return

    try {
      await logout()
      router.push('/')
    } catch (err) {
      updateError.value = '❌ Erro ao sair da conta.'
      console.error('Erro ao fazer logout:', err)
    }
  }

  const goBack = () => {
    router.push('/')
  }

  // Watchers
  watch(
    () => settings.value.name,
    () => {
      if (formTouched.value) validateName()
    },
  )

  watch(
    () => settings.value.password,
    () => {
      if (formTouched.value) validatePassword()
    },
  )

  // Lifecycle
  onMounted(async () => {
    await loadSettings()
  })
</script>

<style scoped>
  /* === SCROLLBAR INVISÍVEL === */
  .settings-page::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
  }
  .settings-page {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .settings-page {
    max-width: 1080px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
    background: linear-gradient(135deg, #eefaf1 0%, #d8f7dd 100%);
  }

  /* === NAVBAR SETTINGS === */
  .settings-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(22, 163, 74, 0.08);
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  }

  .settings-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    font-size: 28px;
  }

  .settings-nav h1 {
    margin: 0;
    color: #14532d;
    font-size: 22px;
    font-weight: 800;
  }

  .btn-back {
    padding: 8px 18px;
    border: 1px solid rgba(22, 163, 74, 0.12);
    border-radius: 999px;
    background: white;
    color: #14532d;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-back:hover {
    background: rgba(22, 163, 74, 0.04);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  }

  .settings-spacer {
    flex: 1;
  }

  /* === PANEL === */
  .settings-panel {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(22, 163, 74, 0.1);
    border-radius: 28px;
    padding: 32px;
    box-shadow: 0 20px 48px rgba(22, 163, 74, 0.06);
  }

  .settings-card {
    display: grid;
    gap: 24px;
  }

  /* === SUMMARY === */
  .settings-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 18px;
    background: rgba(22, 163, 74, 0.04);
    border: 1px solid rgba(22, 163, 74, 0.08);
  }

  .settings-avatar {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    border-radius: 18px;
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.12);
  }

  .summary-eyebrow {
    margin: 0 0 4px;
    color: #16a34a;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .settings-summary h2 {
    margin: 0;
    color: #14532d;
    font-size: 20px;
    font-weight: 800;
  }

  .summary-copy {
    margin: 4px 0 0;
    color: #4b5563;
    font-size: 13px;
  }

  /* === FORM === */
  .settings-row {
    display: grid;
    gap: 6px;
  }

  .settings-label {
    color: #14532d;
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .optional-badge {
    font-size: 10px;
    font-weight: 400;
    color: #6b7280;
    background: rgba(22, 163, 74, 0.06);
    padding: 2px 10px;
    border-radius: 999px;
  }

  .settings-row input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(22, 163, 74, 0.12);
    border-radius: 14px;
    background: rgba(248, 255, 249, 0.8);
    color: #0f172a;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .settings-row input:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08);
    outline: none;
    background: white;
  }

  .settings-row input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(241, 245, 249, 0.5);
  }

  .settings-row input::placeholder {
    color: #94a3b8;
  }

  /* Email Display */
  .email-display {
    position: relative;
  }

  .email-hint {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }

  /* Password Input */
  .password-input-wrapper {
    position: relative;
  }

  .password-input-wrapper input {
    padding-right: 48px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.3s ease;
    opacity: 0.6;
  }

  .password-toggle:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.04);
    transform: translateY(-50%) scale(1.1);
  }

  /* Password Strength */
  .password-strength {
    margin-top: 4px;
  }

  .strength-bar {
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 4px;
    transition:
      width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.6s ease;
  }

  .strength-fill.strength-very-weak {
    background: #ef4444;
  }
  .strength-fill.strength-weak {
    background: #f59e0b;
  }
  .strength-fill.strength-medium {
    background: #eab308;
  }
  .strength-fill.strength-strong {
    background: #22c55e;
  }
  .strength-fill.strength-very-strong {
    background: #16a34a;
  }
  .strength-fill.strength-excellent {
    background: #059669;
  }

  .strength-label {
    display: block;
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
    animation: fadeIn 0.3s ease;
  }

  /* === ACTIONS === */
  .settings-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .btn-primary {
    padding: 12px 28px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    min-width: 160px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50px;
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.2);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(22, 163, 74, 0.3);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-primary.btn-loading {
    color: transparent;
  }

  .btn-primary .spinner {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-logout {
    padding: 12px 28px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    min-width: 160px;
    min-height: 50px;
    box-shadow: 0 4px 16px rgba(220, 38, 38, 0.2);
  }

  .btn-logout:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(220, 38, 38, 0.3);
  }

  .btn-logout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* === MESSAGES === */
  .success-message {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #15803d;
    font-size: 14px;
    padding: 14px 18px;
    background: rgba(22, 163, 74, 0.06);
    border-radius: 14px;
    border: 1px solid rgba(22, 163, 74, 0.12);
    animation: fadeIn 0.3s ease;
    font-weight: 600;
  }

  .field-error {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #dc2626;
    font-size: 13px;
    margin: 0;
    padding: 10px 16px;
    background: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
    animation: fadeIn 0.3s ease;
  }

  .success-icon,
  .error-icon {
    font-size: 16px;
  }

  /* === ANIMATIONS === */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* === RESPONSIVE === */
  @media (max-width: 640px) {
    .settings-page {
      padding: 16px;
    }

    .settings-nav {
      flex-wrap: wrap;
      padding: 12px 16px;
      border-radius: 16px;
    }

    .settings-nav h1 {
      font-size: 18px;
    }

    .settings-panel {
      padding: 20px 16px;
      border-radius: 20px;
    }

    .settings-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-logout {
      width: 100%;
      min-width: unset;
    }

    .settings-summary {
      flex-direction: column;
      text-align: center;
      padding: 16px;
    }

    .settings-avatar {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  :focus-visible {
    outline: 2px solid #16a34a;
    outline-offset: 2px;
  }
</style>
