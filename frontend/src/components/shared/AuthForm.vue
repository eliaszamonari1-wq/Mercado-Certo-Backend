<template>
  <!-- cSpell:disable -->
  <div class="auth-form" :class="{ 'register-mode': isRegister }">
    <div class="auth-container">
      <!-- Header com logo -->
      <div class="auth-header">
        <div class="auth-logo">
          <span class="logo-icon">🌿</span>
          <span class="logo-text">Mercado Certo</span>
        </div>
        <div class="auth-tabs">
          <button
            class="tab-btn"
            :class="{ active: !isRegister }"
            @click="setMode('login')"
          >
            Sign In
          </button>
          <button
            class="tab-btn"
            :class="{ active: isRegister }"
            @click="setMode('register')"
          >
            Sign Up
          </button>
        </div>
      </div>

      <Transition name="slide-fade" mode="out-in">
        <div :key="isRegister ? 'register' : 'login'" class="auth-body">
          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Campo Nome (apenas registro) -->
            <div v-if="isRegister" class="form-group">
              <label class="form-label">Full Name</label>
              <div class="input-wrapper" :class="{ 'has-error': errors.name }">
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="John Doe"
                  autocomplete="name"
                  :aria-invalid="!!errors.name"
                  @blur="validateField('name')"
                  @input="clearFieldError('name')"
                />
              </div>
              <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
            </div>

            <!-- Campo Email (apenas registro) -->
            <div v-if="isRegister" class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper" :class="{ 'has-error': errors.email }">
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  :aria-invalid="!!errors.email"
                  @blur="validateField('email')"
                  @input="clearFieldError('email')"
                />
              </div>
              <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            </div>

            <!-- Campo de login ou usuário -->
            <div class="form-group">
              <label class="form-label">{{
                isRegister ? 'Username' : 'Email'
              }}</label>
              <div
                class="input-wrapper"
                :class="{ 'has-error': errors.username }"
              >
                <input
                  v-model="form.username"
                  type="text"
                  :placeholder="isRegister ? 'johndoe' : 'you@example.com'"
                  :autocomplete="isRegister ? 'username' : 'username'"
                  :aria-invalid="!!errors.username"
                  @blur="validateField('username')"
                  @input="clearFieldError('username')"
                />
              </div>
              <p v-if="errors.username" class="field-error">
                {{ errors.username }}
              </p>
            </div>

            <!-- Campo Senha -->
            <div class="form-group">
              <label class="form-label">Password</label>
              <div
                class="input-wrapper"
                :class="{ 'has-error': errors.password }"
              >
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  :aria-invalid="!!errors.password"
                  @blur="validateField('password')"
                  @input="clearFieldError('password')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <p v-if="errors.password" class="field-error">
                {{ errors.password }}
              </p>

              <!-- Indicador de força da senha (apenas registro) -->
              <div
                v-if="
                  isRegister && !errors.password && form.password.length > 0
                "
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

            <!-- Confirmar Senha (apenas registro) -->
            <div v-if="isRegister" class="form-group">
              <label class="form-label">Confirm Password</label>
              <div class="input-wrapper" :class="{ 'has-error': confirmError }">
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :aria-invalid="!!confirmError"
                  @input="validateConfirmPassword"
                />
              </div>
              <p v-if="confirmError" class="field-error">{{ confirmError }}</p>
            </div>

            <!-- Mensagem de erro geral -->
            <div v-if="error" class="error-message" role="alert">
              <span class="error-icon">⚠️</span>
              {{ error }}
            </div>

            <!-- Link "Forgot Password" (apenas login) -->
            <div v-if="!isRegister" class="forgot-row">
              <a
                class="forgot-link"
                href="#"
                @click.prevent="handleForgotPassword"
              >
                Forgot your password?
              </a>
            </div>

            <!-- Botão Submit -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="btn-submit"
              :class="{ 'btn-loading': loading }"
            >
              <span v-if="loading" class="spinner"></span>
              <span v-else>
                {{ isRegister ? 'Create Account' : 'Sign In' }}
              </span>
            </button>

            <!-- Divisor com "OR" -->
            <div class="divider">
              <span>OR</span>
            </div>

            <!-- Botão Social -->
            <button type="button" class="btn-social" @click="handleGoogleLogin">
              <span>G</span>
              {{ isRegister ? 'Sign up with Google' : 'Continue with Google' }}
            </button>
          </form>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
  import { computed, reactive, ref, watch, nextTick } from 'vue'
  import { useAuth } from '../../composables/useAuth.js'

  const props = defineProps({
    mode: {
      type: String,
      default: 'login',
      validator: (value) => ['login', 'register'].includes(value),
    },
  })

  const emit = defineEmits(['switchMode', 'authSuccess', 'error'])

  const {
    login,
    register,
    loginWithGoogle,
    resetPassword,
    loading,
    error: authError,
  } = useAuth()

  // Estado do formulário
  const form = reactive({
    username: '',
    name: '',
    email: '',
    password: '',
  })

  const confirmPassword = ref('')
  const showPassword = ref(false)
  const isSubmitting = ref(false)
  const confirmError = ref('')

  // Estado de erros
  const errors = reactive({
    username: '',
    name: '',
    email: '',
    password: '',
  })

  const touched = reactive({
    username: false,
    name: false,
    email: false,
    password: false,
  })

  // Computed
  const isRegister = computed(() => props.mode === 'register')

  const isFormValid = computed(() => {
    const hasErrors = Object.values(errors).some((error) => error !== '')
    const hasConfirmError = isRegister.value && confirmError.value !== ''

    const hasEmptyFields = isRegister.value
      ? !form.username ||
        !form.name ||
        !form.email ||
        !form.password ||
        !confirmPassword.value
      : !form.username || !form.password

    return !hasErrors && !hasConfirmError && !hasEmptyFields
  })

  const passwordStrength = computed(() => {
    const password = form.password
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
      0: { label: 'Very Weak', class: 'strength-very-weak' },
      1: { label: 'Weak', class: 'strength-weak' },
      2: { label: 'Medium', class: 'strength-medium' },
      3: { label: 'Strong', class: 'strength-strong' },
      4: { label: 'Very Strong', class: 'strength-very-strong' },
      5: { label: 'Excellent', class: 'strength-excellent' },
    }

    const key = Math.min(score, 5)
    return {
      ...strengthMap[key],
      percentage,
    }
  })

  // Validação
  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const validateConfirmPassword = () => {
    if (isRegister.value) {
      confirmError.value =
        form.password === confirmPassword.value ? '' : 'Passwords do not match.'
    }
  }

  const validateField = (field) => {
    touched[field] = true

    switch (field) {
      case 'username':
        if (!form.username.trim()) {
          errors.username = isRegister.value
            ? 'Username is required.'
            : 'Email is required.'
        } else if (!isRegister.value && !validateEmail(form.username.trim())) {
          errors.username = 'Please enter a valid email.'
        } else {
          errors.username = ''
        }
        break

      case 'name':
        if (isRegister.value) {
          errors.name = form.name.trim() ? '' : 'Full name is required.'
        }
        break

      case 'email':
        if (isRegister.value) {
          errors.email = form.email.trim()
            ? validateEmail(form.email)
              ? ''
              : 'Please enter a valid email.'
            : 'Email is required.'
        }
        break

      case 'password':
        if (form.password.length === 0) {
          errors.password = 'Password is required.'
        } else if (form.password.length < 6) {
          errors.password = 'Password must be at least 6 characters.'
        } else {
          errors.password = ''
        }
        if (isRegister.value && confirmPassword.value) {
          validateConfirmPassword()
        }
        break
    }
  }

  const clearFieldError = (field) => {
    if (errors[field]) {
      errors[field] = ''
    }
  }

  const validateAll = () => {
    const fields = isRegister.value
      ? ['username', 'name', 'email', 'password']
      : ['username', 'password']

    fields.forEach((field) => validateField(field))

    if (isRegister.value) {
      validateConfirmPassword()
    }

    return (
      !Object.values(errors).some((error) => error !== '') &&
      !confirmError.value
    )
  }

  // Handlers
  const setMode = (mode) => {
    emit('switchMode', mode)
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      const firstErrorField = Object.keys(errors).find(
        (key) => errors[key] !== '',
      )
      if (firstErrorField) {
        const element = document.querySelector(`input[aria-invalid="true"]`)
        if (element) {
          await nextTick()
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
      let result
      if (isRegister.value) {
        result = await register({
          username: form.username.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        })
      } else {
        const loginUsername = form.username.trim()
        result = await login({
          email: loginUsername,
          password: form.password,
        })
      }

      emit('authSuccess', result)
    } catch (error) {
      emit('error', error)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleForgotPassword = async () => {
    const email = form.username.trim()

    if (!email) {
      alert('Informe seu email para recuperar a senha.')
      return
    }

    try {
      await resetPassword(email)
      alert(
        'Se esse e-mail estiver cadastrado, um link de recuperação foi enviado.',
      )
    } catch (error) {
      alert(error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle()
      emit('authSuccess', result)
    } catch (error) {
      emit('error', error)
    }
  }

  // Watchers
  watch(
    () => props.mode,
    () => {
      form.username = ''
      form.name = ''
      form.email = ''
      form.password = ''
      confirmPassword.value = ''
      errors.username = ''
      errors.name = ''
      errors.email = ''
      errors.password = ''
      confirmError.value = ''
      touched.username = false
      touched.name = false
      touched.email = false
      touched.password = false
      isSubmitting.value = false
    },
  )

  watch(
    () => form.password,
    () => {
      if (isRegister.value && confirmPassword.value) {
        validateConfirmPassword()
      }
    },
  )

  watch(
    () => confirmPassword.value,
    () => {
      if (isRegister.value) {
        validateConfirmPassword()
      }
    },
  )

  defineExpose({
    form,
    errors,
    validateField,
    validateAll,
    isFormValid,
  })
</script>

<style scoped>
  .auth-form {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    animation: fadeUp 0.6s ease;
  }

  .auth-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px 28px 28px;
    border: 1px solid rgba(22, 163, 74, 0.08);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.06);
  }

  /* Header */
  .auth-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(22, 163, 74, 0.06);
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 800;
    color: #14532d;
    letter-spacing: -0.02em;
  }

  .auth-tabs {
    display: flex;
    gap: 4px;
    background: rgba(22, 163, 74, 0.04);
    padding: 4px;
    border-radius: 12px;
  }

  .tab-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tab-btn:hover {
    color: #14532d;
  }

  .tab-btn.active {
    background: white;
    color: #16a34a;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.08);
  }

  /* Body */
  .auth-body {
    animation: fadeIn 0.4s ease;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .input-wrapper {
    position: relative;
    border: 2px solid rgba(22, 163, 74, 0.08);
    border-radius: 12px;
    background: #fafcfa;
    transition: all 0.3s ease;
  }

  .input-wrapper:focus-within {
    border-color: #16a34a;
    background: white;
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.06);
  }

  .input-wrapper.has-error {
    border-color: #dc2626;
    background: #fef8f8;
  }

  .input-wrapper.has-error:focus-within {
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.06);
  }

  .input-wrapper input {
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #0f172a;
    outline: none;
  }

  .input-wrapper input::placeholder {
    color: #94a3b8;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s ease;
    opacity: 0.5;
  }

  .password-toggle:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.04);
  }

  .field-error {
    font-size: 12px;
    color: #dc2626;
    margin: 6px 0 0;
    animation: fadeIn 0.2s ease;
  }

  /* Password Strength */
  .password-strength {
    margin-top: 8px;
  }

  .strength-bar {
    width: 100%;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition:
      width 0.6s ease,
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
  }

  /* Forgot Row */
  .forgot-row {
    text-align: right;
    margin: -8px 0 20px;
  }

  .forgot-link {
    color: #16a34a;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .forgot-link:hover {
    color: #15803d;
    text-decoration: underline;
  }

  /* Submit Button */
  .btn-submit {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.2);
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(22, 163, 74, 0.3);
  }

  .btn-submit:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-submit.btn-loading {
    color: transparent;
  }

  .spinner {
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

  /* Divider */
  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 20px 0 16px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(22, 163, 74, 0.08);
  }

  .divider span {
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  /* Social Button */
  .btn-social {
    width: 100%;
    padding: 12px;
    border: 2px solid rgba(22, 163, 74, 0.08);
    border-radius: 12px;
    background: white;
    color: #14532d;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .btn-social:hover {
    background: #f8fdf5;
    border-color: rgba(22, 163, 74, 0.15);
    transform: translateY(-1px);
  }

  .btn-social span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f1f5f9;
    font-weight: 700;
    font-size: 14px;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #dc2626;
    padding: 10px 14px;
    background: #fef2f2;
    border-radius: 10px;
    border: 1px solid #fecaca;
    margin: -4px 0 16px;
    font-size: 13px;
    animation: fadeIn 0.3s ease;
  }

  .error-icon {
    font-size: 16px;
  }

  /* Transitions */
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }

  .slide-fade-enter-to,
  .slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Responsive */
  @media (max-width: 480px) {
    .auth-container {
      padding: 24px 16px 20px;
      border-radius: 18px;
    }

    .auth-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .auth-logo {
      justify-content: center;
    }

    .auth-tabs {
      justify-content: center;
    }

    .tab-btn {
      flex: 1;
      text-align: center;
    }

    .logo-text {
      font-size: 18px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  :focus-visible {
    outline: 2px solid #16a34a;
    outline-offset: 2px;
  }
</style>
