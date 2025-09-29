import { auth } from '../lib/supabase.js'

export class UserProfile {
  constructor() {
    this.user = null
    this.init()
  }

  async init() {
    // Check for existing session
    const session = await auth.getCurrentSession()
    if (session?.user) {
      this.user = session.user
      this.updateUI()
    }

    // Listen for auth changes
    auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.user = session.user
        this.updateUI()
      } else if (event === 'SIGNED_OUT') {
        this.user = null
        this.updateUI()
      }
    })
  }

  updateUI() {
    const navButtons = document.querySelector('.nav-buttons')
    
    if (this.user) {
      // User is signed in
      navButtons.innerHTML = `
        <div class="user-menu">
          <button class="user-avatar" id="userMenuToggle">
            <span>${this.getInitials(this.user.email)}</span>
          </button>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-info">
              <p class="user-email">${this.user.email}</p>
            </div>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="dashboardLink">
              <i class="fas fa-tachometer-alt"></i>
              Dashboard
            </a>
            <a href="#" class="dropdown-item" id="settingsLink">
              <i class="fas fa-cog"></i>
              Settings
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item sign-out-btn" id="signOutBtn">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      `

      // Add event listeners
      this.attachUserMenuListeners()
    } else {
      // User is not signed in
      navButtons.innerHTML = `
        <button class="btn-secondary" id="loginBtn">Log In</button>
        <button class="btn-primary" id="signupBtn">Sign Up</button>
      `

      // Add event listeners for auth buttons
      this.attachAuthButtonListeners()
    }
  }

  attachUserMenuListeners() {
    const menuToggle = document.getElementById('userMenuToggle')
    const dropdown = document.getElementById('userDropdown')
    const signOutBtn = document.getElementById('signOutBtn')

    // Toggle dropdown
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      dropdown.classList.toggle('active')
    })

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('active')
    })

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    // Sign out
    signOutBtn.addEventListener('click', async () => {
      await auth.signOut()
      dropdown.classList.remove('active')
    })
  }

  attachAuthButtonListeners() {
    const loginBtn = document.getElementById('loginBtn')
    const signupBtn = document.getElementById('signupBtn')

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.authModal.open('signin')
      })
    }

    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        window.authModal.open('signup')
      })
    }
  }

  getInitials(email) {
    return email.charAt(0).toUpperCase()
  }
}