(function() {
  const css = `
    .dl-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }
    .dl-modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .dl-modal {
      background: #ffffff;
      border-radius: 16px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      position: relative;
      transform: translateY(20px);
      transition: transform 0.2s;
      font-family: inherit;
      color: #111111;
      text-align: left;
    }
    .dl-modal-overlay.active .dl-modal {
      transform: translateY(0);
    }
    .dl-close {
      position: absolute;
      top: 16px; right: 16px;
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #888888;
      width: 32px; height: 32px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .dl-close:hover {
      background: #f5f5f5;
      color: #111111;
    }
    .dl-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .dl-desc {
      font-size: 15px;
      color: #666666;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .dl-input-group {
      margin-bottom: 16px;
    }
    .dl-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dddddd;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
      box-sizing: border-box;
      color: #111;
      background: #fff;
    }
    .dl-input::placeholder {
      color: #999;
    }
    .dl-input:focus {
      border-color: #0071e3;
      box-shadow: 0 0 0 3px rgba(0,113,227,0.15);
    }
    .dl-error-msg {
      color: #ff3b30;
      font-size: 13px;
      margin-top: 6px;
      display: none;
    }
    .dl-input.error + .dl-error-msg {
      display: block;
    }
    .dl-btn {
      width: 100%;
      padding: 14px 20px;
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-sizing: border-box;
    }
    .dl-btn:hover:not(:disabled) {
      opacity: 0.85;
    }
    .dl-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    .dl-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .dl-btn.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .dl-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: dl-spin 0.8s linear infinite;
      display: none;
    }
    .dl-btn.loading .dl-spinner {
      display: block;
    }
    @keyframes dl-spin {
      to { transform: rotate(360deg); }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  let currentDownloadUrl = '';
  
  const getProductName = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('buffer')) return 'Buffer';
    if (path.includes('mesmer')) return 'Mesmer';
    if (path.includes('tempo')) return 'Tempo';
    return document.title.split('—')[0].trim() || 'Product';
  };

  const createModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'dl-modal-overlay';
    overlay.innerHTML = `
      <div class="dl-modal">
        <button class="dl-close">&times;</button>
        <div class="dl-title">Almost there!</div>
        <div class="dl-desc">Enter your email to download ${getProductName()} for free. We’ll only email you when we ship something new. NO SPAM!</div>
        <form id="dl-form">
          <div class="dl-input-group">
            <input type="email" class="dl-input" id="dl-email" placeholder="you@example.com" required autocomplete="email" />
            <div class="dl-error-msg">Please enter a valid email address.</div>
          </div>
          <button type="submit" class="dl-btn" id="dl-submit" disabled>
            <div class="dl-spinner"></div>
            <span>Start Download</span>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.dl-close');
    const form = overlay.querySelector('#dl-form');
    const input = overlay.querySelector('#dl-email');
    const submitBtn = overlay.querySelector('#dl-submit');
    const errorMsg = overlay.querySelector('.dl-error-msg');

    const closeModal = () => {
      overlay.classList.remove('active');
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    input.addEventListener('input', () => {
      const email = input.value.trim();
      const isValid = validateEmail(email);
      submitBtn.disabled = !isValid;
      
      if (isValid) {
        input.classList.remove('error');
      }
    });

    input.addEventListener('blur', () => {
      const email = input.value.trim();
      if (email.length > 0 && !validateEmail(email)) {
        input.classList.add('error');
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      
      if (!validateEmail(email)) {
        input.classList.add('error');
        return;
      }
      
      input.classList.remove('error');
      
      if (submitBtn.classList.contains('loading')) return;
      
      submitBtn.classList.add('loading');
      
      try {
        await fetch('https://tydqjslyoplbosvbzlxd.supabase.co/functions/v1/bright-endpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product: getProductName(),
            email: email
          })
        });
      } catch (err) {
        console.error('Failed to submit email:', err);
      } finally {
        submitBtn.classList.remove('loading');
        // Trigger download
        window.location.href = currentDownloadUrl;
        closeModal();
        
        // Mark as having entered email
        localStorage.setItem('email_entered_' + getProductName(), 'true');
      }
    });

    return { overlay, input, closeModal };
  };

  document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    
    // Find all download links (handles URLs ending with .dmg)
    const links = document.querySelectorAll('a[href$=".dmg"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        // Option: if user already entered email for this product, bypass form
        if (localStorage.getItem('email_entered_' + getProductName()) === 'true') return;
        
        e.preventDefault();
        currentDownloadUrl = link.href;
        
        if (!modal) {
          modal = createModal();
        }
        
        modal.overlay.classList.add('active');
        setTimeout(() => {
          modal.input.focus();
          modal.input.dispatchEvent(new Event('input'));
        }, 50);
      });
    });
  });
})();
