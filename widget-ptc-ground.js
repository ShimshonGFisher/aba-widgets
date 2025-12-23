(function() {
  'use strict';

  // Configuration - PTC Ground Luxury Transport
  const CONFIG = {
    webhookUrl: 'https://shimshongf.app.n8n.cloud/webhook/74edd3bf-5d90-4963-ae24-3bb619a385f8', // PTC Ground n8n webhook
    companyName: 'PTC Ground', 
    primaryColor: '#1a1a1a', // Sophisticated dark - can be changed to match their brand
    agentName: 'Sarah', // Change if they prefer different name
    agentAvatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=faces', // Professional woman
    position: 'right',
    greeting: 'Welcome to PTC Ground! How can we assist with your luxury transport needs today?',
    autoOpenDelay: 4000, // Slightly longer for premium feel
    privacyNotice: 'Your inquiry will be handled confidentially. We typically respond within 1 hour during business hours.',
    collectFields: ['name', 'email', 'phone', 'country', 'service_type', 'date', 'passengers']
  };

  // State management
  let state = {
    stage: 'small',
    messages: [],
    collectedData: {},
    conversationId: generateId(),
    userLocation: null,
    isTyping: false,
    detectedColor: '#1a1a1a'
  };

  // Generate unique ID
  function generateId() {
    return 'conv_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Detect website's primary color
  function detectPrimaryColor() {
    if (CONFIG.primaryColor) {
      state.detectedColor = CONFIG.primaryColor;
      return;
    }

    const colorSources = [
      () => getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
      () => getComputedStyle(document.documentElement).getPropertyValue('--brand-color'),
      () => getComputedStyle(document.documentElement).getPropertyValue('--main-color'),
      () => {
        const btn = document.querySelector('button, .btn, [class*="button"]');
        if (btn) {
          const bg = getComputedStyle(btn).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        }
        return null;
      },
      () => {
        const link = document.querySelector('a');
        if (link) {
          const color = getComputedStyle(link).color;
          if (color && color !== 'rgb(0, 0, 0)') return color;
        }
        return null;
      },
      () => {
        const header = document.querySelector('header, nav, .header, .navbar');
        if (header) {
          const bg = getComputedStyle(header).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'rgb(255, 255, 255)') return bg;
        }
        return null;
      }
    ];

    for (const source of colorSources) {
      try {
        const color = source();
        if (color && color.trim()) {
          state.detectedColor = color.trim();
          console.log('Detected primary color:', state.detectedColor);
          return;
        }
      } catch (e) {
        // Continue to next source
      }
    }

    console.log('Using default color:', state.detectedColor);
  }

  // Detect user's location via IP geolocation
  async function detectLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      state.userLocation = {
        city: data.city,
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region
      };
      state.collectedData.detectedCountry = data.country_name;
      state.collectedData.detectedCity = data.city;
    } catch (error) {
      console.log('Could not detect location:', error);
    }
  }

  function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || 'direct',
      medium: urlParams.get('utm_medium') || 'none',
      campaign: urlParams.get('utm_campaign') || 'none',
      referrer: document.referrer || 'direct',
      landingPage: window.location.href
    };
  }

  // Inject styles
  function injectStyles() {
    const styles = `
      #ptc-chat-widget * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      /* Stage 1: Small circle launcher - slightly larger for premium feel */
      #ptc-chat-launcher {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        z-index: 999998;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        padding: 3px;
        border: 2px solid #f0f0f0;
      }

      #ptc-chat-launcher:hover {
        transform: scale(1.08);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      }

      #ptc-chat-launcher img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        object-position: center 20%;
      }

      #ptc-chat-launcher .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: gentlePulse 3s infinite;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      @keyframes gentlePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Stage 2: Medium popup with question */
      #ptc-medium-popup {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 360px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
        z-index: 999999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border: 1px solid #e0e0e0;
      }

      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.7) translateY(30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      #ptc-medium-popup.open {
        display: flex;
      }

      .ptc-medium-header {
        display: flex;
        justify-content: flex-end;
        padding: 14px 18px 0;
      }

      .ptc-medium-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 22px;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }

      .ptc-medium-close:hover {
        color: #6b7280;
      }

      .ptc-medium-content {
        padding: 0 24px 24px;
        text-align: center;
      }

      .ptc-medium-avatar {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center 20%;
        margin-bottom: 10px;
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .ptc-medium-name {
        font-weight: 600;
        font-size: 17px;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .ptc-medium-time {
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 18px;
      }

      .ptc-medium-message {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 14px 18px;
        border-radius: 18px;
        font-size: 15px;
        color: #374151;
        margin-bottom: 18px;
        text-align: left;
        line-height: 1.5;
      }

      .ptc-medium-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 14px;
      }

      .ptc-medium-button {
        background: white;
        border: 2px solid var(--ptc-primary-color, #1a1a1a);
        color: var(--ptc-primary-color, #1a1a1a);
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .ptc-medium-button:hover {
        background: var(--ptc-primary-color, #1a1a1a);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .ptc-medium-input {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
        background: #f3f4f6;
        border-radius: 28px;
        padding: 5px 5px 5px 18px;
        border: 1px solid #e5e7eb;
      }

      .ptc-medium-input input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        outline: none;
        padding: 10px 0;
      }

      .ptc-medium-input button {
        background: var(--ptc-primary-color, #1a1a1a);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .ptc-medium-input button:hover {
        transform: scale(1.1);
      }

      .ptc-medium-input button svg {
        width: 16px;
        height: 16px;
        fill: white;
      }

      /* Stage 3: Full chat window */
      #ptc-chat-window {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 420px;
        height: 640px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 12px 56px rgba(0, 0, 0, 0.3);
        z-index: 999999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: expandIn 0.4s ease;
        border: 1px solid #e0e0e0;
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: scale(0.85);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      #ptc-chat-window.open {
        display: flex;
      }

      .ptc-chat-header {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        color: white;
        padding: 18px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ptc-chat-header-title {
        font-weight: 600;
        font-size: 17px;
        letter-spacing: 0.3px;
      }

      .ptc-chat-close {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        cursor: pointer;
        padding: 6px 10px;
        font-size: 20px;
        line-height: 1;
        border-radius: 8px;
        transition: background 0.2s;
      }

      .ptc-chat-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .ptc-agent-intro {
        text-align: center;
        padding: 24px;
        background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
        border-bottom: 1px solid #e5e7eb;
      }

      .ptc-agent-intro img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center 20%;
        margin-bottom: 12px;
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .ptc-agent-intro .agent-name {
        font-weight: 600;
        font-size: 18px;
        color: #1f2937;
      }

      .ptc-privacy-notice {
        background: #fafafa;
        padding: 12px 18px;
        font-size: 11px;
        color: #6b7280;
        line-height: 1.5;
        border-bottom: 1px solid #e5e7eb;
        text-align: center;
      }

      .ptc-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: white;
      }

      .ptc-message {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .ptc-message.bot {
        flex-direction: row;
      }

      .ptc-message.user {
        flex-direction: row-reverse;
      }

      .ptc-message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center 20%;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .ptc-message.user .ptc-message-avatar {
        display: none;
      }

      .ptc-message-content {
        display: flex;
        flex-direction: column;
        max-width: 75%;
      }

      .ptc-message.user .ptc-message-content {
        align-items: flex-end;
      }

      .ptc-message-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.6;
        word-wrap: break-word;
      }

      .ptc-message.bot .ptc-message-bubble {
        background: #f3f4f6;
        color: #374151;
        border-bottom-left-radius: 6px;
      }

      .ptc-message.user .ptc-message-bubble {
        background: var(--ptc-primary-color, #1a1a1a);
        color: white;
        border-bottom-right-radius: 6px;
      }

      .ptc-quick-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }

      .ptc-quick-button {
        background: var(--ptc-primary-color, #1a1a1a);
        border: none;
        color: white;
        padding: 11px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      }

      .ptc-quick-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        filter: brightness(1.15);
      }

      .ptc-typing-indicator {
        display: flex;
        gap: 5px;
        padding: 12px 16px;
        background: #f3f4f6;
        border-radius: 18px;
        border-bottom-left-radius: 6px;
        width: fit-content;
      }

      .ptc-typing-dot {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite;
      }

      .ptc-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .ptc-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }

      .ptc-chat-input-area {
        padding: 18px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      .ptc-chat-input-wrapper {
        display: flex;
        gap: 12px;
        align-items: center;
        background: #f3f4f6;
        border-radius: 28px;
        padding: 5px 5px 5px 18px;
        border: 1px solid #e5e7eb;
      }

      .ptc-chat-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 11px 0;
        font-size: 14px;
        outline: none;
      }

      .ptc-chat-input::placeholder {
        color: #9ca3af;
      }

      .ptc-chat-send {
        background: var(--ptc-primary-color, #1a1a1a);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, filter 0.2s;
        flex-shrink: 0;
      }

      .ptc-chat-send:hover {
        transform: scale(1.08);
        filter: brightness(1.15);
      }

      .ptc-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .ptc-chat-send svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      @media (max-width: 480px) {
        #ptc-chat-window {
          width: calc(100% - 20px);
          height: calc(100% - 90px);
          bottom: 10px;
          ${CONFIG.position}: 10px;
          border-radius: 16px;
        }

        #ptc-medium-popup {
          width: calc(100% - 40px);
          ${CONFIG.position}: 20px;
        }

        #ptc-chat-launcher {
          bottom: 18px;
          ${CONFIG.position}: 18px;
          width: 65px;
          height: 65px;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Apply dynamic color
  function applyDynamicColor() {
    document.documentElement.style.setProperty('--ptc-primary-color', state.detectedColor);
  }

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'ptc-chat-widget';
    
    widget.innerHTML = `
      <!-- Stage 1: Small circle -->
      <div id="ptc-chat-launcher">
        <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}">
        <div class="notification-badge">1</div>
      </div>

      <!-- Stage 2: Medium popup -->
      <div id="ptc-medium-popup">
        <div class="ptc-medium-header">
          <button class="ptc-medium-close">✕</button>
        </div>
        <div class="ptc-medium-content">
          <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="ptc-medium-avatar">
          <div class="ptc-medium-name">${CONFIG.agentName}</div>
          <div class="ptc-medium-time">Available now</div>
          <div class="ptc-medium-message">${CONFIG.greeting}</div>
          <div class="ptc-medium-buttons">
            <button class="ptc-medium-button" data-value="airport">Airport Transfer</button>
            <button class="ptc-medium-button" data-value="hourly">Hourly Service</button>
            <button class="ptc-medium-button" data-value="multi-day">Multi-Day</button>
            <button class="ptc-medium-button" data-value="quote">Get Quote</button>
          </div>
          <div class="ptc-medium-input">
            <input type="text" placeholder="Or ask a question..." id="ptc-medium-input-field">
            <button id="ptc-medium-send">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Stage 3: Full chat window -->
      <div id="ptc-chat-window">
        <div class="ptc-chat-header">
          <div class="ptc-chat-header-title">${CONFIG.companyName} Transport</div>
          <button class="ptc-chat-close">✕</button>
        </div>

        <div class="ptc-agent-intro">
          <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}">
          <div class="agent-name">${CONFIG.agentName}</div>
        </div>

        <div class="ptc-privacy-notice">
          ${CONFIG.privacyNotice}
        </div>
        
        <div class="ptc-chat-messages" id="ptc-messages-container">
        </div>

        <div class="ptc-chat-input-area">
          <div class="ptc-chat-input-wrapper">
            <input type="text" class="ptc-chat-input" id="ptc-user-input" placeholder="Type your message..." />
            <button class="ptc-chat-send" id="ptc-send-button">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  // Switch between stages
  function setStage(newStage) {
    const launcher = document.getElementById('ptc-chat-launcher');
    const mediumPopup = document.getElementById('ptc-medium-popup');
    const fullWindow = document.getElementById('ptc-chat-window');
    const badge = document.querySelector('.notification-badge');

    // Hide all first
    launcher.style.display = 'none';
    mediumPopup.classList.remove('open');
    fullWindow.classList.remove('open');

    state.stage = newStage;

    switch (newStage) {
      case 'small':
        launcher.style.display = 'block';
        badge.style.display = 'flex';
        break;
      case 'medium':
        mediumPopup.classList.add('open');
        badge.style.display = 'none';
        break;
      case 'full':
        fullWindow.classList.add('open');
        badge.style.display = 'none';
        break;
    }
  }

  // Add message to chat
  function addMessage(text, isBot = true, buttons = null) {
    const container = document.getElementById('ptc-messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ptc-message ${isBot ? 'bot' : 'user'}`;

    let html = '';
    
    if (isBot) {
      html += `<img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="ptc-message-avatar">`;
    }
    
    html += `<div class="ptc-message-content">`;
    html += `<div class="ptc-message-bubble">${text}</div>`;

    if (buttons && isBot) {
      html += '<div class="ptc-quick-buttons">';
      buttons.forEach(btn => {
        html += `<button class="ptc-quick-button" data-value="${btn.value}">${btn.label}</button>`;
      });
      html += '</div>';
    }
    
    html += '</div>';

    messageDiv.innerHTML = html;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    // Store message
    state.messages.push({
      role: isBot ? 'assistant' : 'user',
      content: text,
      timestamp: Date.now()
    });
  }

  // Show typing indicator
  function showTyping() {
    state.isTyping = true;
    const container = document.getElementById('ptc-messages-container');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ptc-message bot';
    typingDiv.id = 'ptc-typing';
    typingDiv.innerHTML = `
      <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="ptc-message-avatar">
      <div class="ptc-message-content">
        <div class="ptc-typing-indicator">
          <div class="ptc-typing-dot"></div>
          <div class="ptc-typing-dot"></div>
          <div class="ptc-typing-dot"></div>
        </div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    state.isTyping = false;
    const typing = document.getElementById('ptc-typing');
    if (typing) typing.remove();
  }

  // Send message to n8n webhook
  async function sendToWebhook(userMessage) {
    // Prevent spam - rate limiting
    if (state.isTyping) {
      return; // Already processing a message
    }

    showTyping();

    try {
      // Add timeout to fetch request (10 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const payload = {
        conversationId: state.conversationId,
        message: userMessage,
        messages: state.messages,
        collectedData: state.collectedData,
        userLocation: state.userLocation,
        trafficSource: getTrafficSource(),  
        timestamp: Date.now()
      };

      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      hideTyping();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // Update collected data if returned
      if (data.collectedData) {
        state.collectedData = { ...state.collectedData, ...data.collectedData };
      }

      // Add bot response
      if (data.response) {
        setTimeout(() => {
          addMessage(data.response, true, data.buttons || null);
        }, 300);
      } else {
        // No response field - show generic message
        addMessage("Thank you for your message. We'll get back to you shortly.", true);
      }

    } catch (error) {
      console.error('Webhook error:', error);
      hideTyping();

      // Different error messages based on error type
      let errorMessage = "I apologize for the inconvenience. Please try again or contact us directly.";

      if (error.name === 'AbortError') {
        errorMessage = "The request is taking longer than expected. Please check your connection and try again.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Unable to connect. Please check your internet connection and try again.";
      } else if (error.message.includes('status')) {
        errorMessage = "We're experiencing technical difficulties. Please try again in a moment.";
      }

      addMessage(errorMessage, true);
    }
  }

  // Handle user input
  function handleUserInput(text) {
    if (!text.trim()) return;
    
    addMessage(text, false);
    document.getElementById('ptc-user-input').value = '';
    sendToWebhook(text);
  }

  // Open full chat from medium popup
  function openFullChat(initialMessage) {
    setStage('full');
    
    // Add the greeting as first bot message
    addMessage(CONFIG.greeting, true);
    
    // Add user's response
    addMessage(initialMessage, false);
    
    // Send to webhook
    sendToWebhook(initialMessage);
  }

  // Initialize event listeners
  function initEventListeners() {
    // Small launcher click -> open medium popup
    document.getElementById('ptc-chat-launcher').addEventListener('click', () => {
      setStage('medium');
    });

    // Medium popup close -> back to small
    document.querySelector('.ptc-medium-close').addEventListener('click', () => {
      setStage('small');
    });

    // Medium popup button clicks -> open full chat
    document.querySelectorAll('.ptc-medium-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const label = e.target.textContent;
        openFullChat(label);
      });
    });

    // Medium popup text input
    document.getElementById('ptc-medium-send').addEventListener('click', () => {
      const input = document.getElementById('ptc-medium-input-field');
      if (input.value.trim()) {
        openFullChat(input.value.trim());
      }
    });

    document.getElementById('ptc-medium-input-field').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        openFullChat(e.target.value.trim());
      }
    });

    // Full chat close -> back to small
    document.querySelector('.ptc-chat-close').addEventListener('click', () => {
      setStage('small');
    });

    // Full chat send button
    document.getElementById('ptc-send-button').addEventListener('click', () => {
      const input = document.getElementById('ptc-user-input');
      handleUserInput(input.value);
    });

    // Full chat enter key
    document.getElementById('ptc-user-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserInput(e.target.value);
      }
    });

    // Full chat quick button clicks (delegated)
    document.getElementById('ptc-messages-container').addEventListener('click', (e) => {
      if (e.target.classList.contains('ptc-quick-button')) {
        const label = e.target.textContent;
        
        // Remove buttons after click
        const buttonsContainer = e.target.closest('.ptc-quick-buttons');
        if (buttonsContainer) buttonsContainer.remove();
        
        handleUserInput(label);
      }
    });
  }

  // Auto-open medium popup after delay
  function setupAutoOpen() {
    if (CONFIG.autoOpenDelay > 0) {
      setTimeout(() => {
        if (state.stage === 'small') {
          setStage('medium');
        }
      }, CONFIG.autoOpenDelay);
    }
  }

  // Initialize widget
  async function init() {
    detectPrimaryColor();
    injectStyles();
    applyDynamicColor();
    createWidget();
    initEventListeners();
    await detectLocation();
    setupAutoOpen();
    
    console.log('PTC Ground Chat Widget initialized');
    console.log('Detected location:', state.userLocation);
    console.log('Primary color:', state.detectedColor);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
