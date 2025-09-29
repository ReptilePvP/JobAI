import { auth } from '../lib/supabase.js'

export class AuthModal {
  constructor() {
    this.isOpen = false
    this.mode = 'signin' // 'signin' or 'signup'
    this.init()
  }

  init() {
    this.createModal()
    this.attachEventListeners()
  }

  createModal() {
    const modalHTML = `
      <div class="auth-modal-overlay" id="authModalOverlay">
        <div class="auth-modal">
          <div class="auth-modal-header">
            <h2 id="authModalTitle">Sign In to JobAI</h2>
            <button class="auth-modal-close" id="authModalClose">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="auth-modal-content">
            <form id="authForm" class="auth-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
              </div>
              <button type="submit" class="btn-primary btn-large auth-submit-btn" id="authSubmitBtn">
                Sign In
              </button>
            </form>
            <div class="auth-divider">
              <span>or</span>
            </div>
            <div class="auth-switch">
              <p id="authSwitchText">Don't have an account?</p>
              <button type="button" class="auth-switch-btn" id="authSwitchBtn">Sign Up</button>
            </div>
          </div>
          <div class="auth-loading" id="authLoading">
            <div class="spinner"></div>
            <p>Processing...</p>
          </div>
          <div class="auth-error" id="authError"></div>
          <div class="auth-success" id="authSuccess"></div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
  }

  attachEventListeners() {
    const overlay = document.getElementById('authModalOverlay')
    const closeBtn = document.getElementById('authModalClose')
    const form = document.getElementById('authForm')
    const switchBtn = document.getElementById('authSwitchBtn')

    // Close modal events
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close()
    })
    closeBtn.addEventListener('click', () => this.close())

    // Form submission
    form.addEventListener('submit', (e) => this.handleSubmit(e))

    // Switch between signin/signup
    switchBtn.addEventListener('click', () => this.toggleMode())

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close()
    })
  }

  open(mode = 'signin') {
    this.mode = mode
    this.updateModalContent()
    document.getElementById('authModalOverlay').style.display = 'flex'
    document.body.style.overflow = 'hidden'
    this.isOpen = true
    this.clearMessages()
  }

  close() {
    document.getElementById('authModalOverlay').style.display = 'none'
    document.body.style.overflow = 'auto'
    this.isOpen = false
    this.clearForm()
    this.clearMessages()
  }

  toggleMode() {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin'
    this.updateModalContent()
    this.clearMessages()
  }

  updateModalContent() {
    const title = document.getElementById('authModalTitle')
    const submitBtn = document.getElementById('authSubmitBtn')
    const switchText = document.getElementById('authSwitchText')
    const switchBtn = document.getElementById('authSwitchBtn')

    if (this.mode === 'signin') {
      title.textContent = 'Sign In to JobAI'
      submitBtn.textContent = 'Sign In'
      switchText.textContent = "Don't have an account?"
      switchBtn.textContent = 'Sign Up'
    } else {
      title.textContent = 'Create Your JobAI Account'
      submitBtn.textContent = 'Create Account'
      switchText.textContent = 'Already have an account?'
      switchBtn.textContent = 'Sign In'
    }
  }

  async handleSubmit(e) {
    e.preventDefault()
    
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    if (!email || !password) {
      this.showError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters')
      return
    }

    this.showLoading(true)
    this.clearMessages()

    try {
      let result
      if (this.mode === 'signin') {
        result = await auth.signIn(email, password)
      } else {
        result = await auth.signUp(email, password)
      }

      if (result.error) {
        this.showError(result.error.message)
      } else {
        if (this.mode === 'signup') {
          this.showSuccess('Account created successfully! You can now sign in.')
          setTimeout(() => {
            this.mode = 'signin'
            this.updateModalContent()
            this.clearMessages()
          }, 2000)
        } else {
          this.showSuccess('Signed in successfully!')
          setTimeout(() => {
            this.close()
            window.location.reload()
          }, 1000)
        }
      }
    } catch (error) {
      this.showError('An unexpected error occurred. Please try again.')
    } finally {
      this.showLoading(false)
    }
  }

  showLoading(show) {
    const loading = document.getElementById('authLoading')
    const form = document.getElementById('authForm')
    
    if (show) {
      loading.style.display = 'flex'
      form.style.opacity = '0.5'
      form.style.pointerEvents = 'none'
    } else {
      loading.style.display = 'none'
      form.style.opacity = '1'
      form.style.pointerEvents = 'auto'
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('authError')
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
      errorDiv.style.display = 'none'
    }, 5000)
  }

  showSuccess(message) {
    const successDiv = document.getElementById('authSuccess')
    successDiv.textContent = message
    successDiv.style.display = 'block'
    setTimeout(() => {
      successDiv.style.display = 'none'
    }, 5000)
  }

  clearForm() {
    document.getElementById('authForm').reset()
  }

  clearMessages() {
    document.getElementById('authError').style.display = 'none'
    document.getElementById('authSuccess').style.display = 'none'
  }
}