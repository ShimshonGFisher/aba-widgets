# ABA Therapy Lead Capture Chat Widget

A beautiful, customizable chat widget for ABA therapy companies that captures leads through natural AI conversation.

## Features

- 🎨 Eye-catching popup design (fully customizable colors)
- 💬 AI-powered conversational intake (not just forms)
- 📍 Auto-detects user's state via IP geolocation
- 🔘 Button-based quick responses + free text chat
- 📱 Mobile responsive
- 📧 Sends complete lead info via email
- ⚡ Lightweight, no dependencies

## What It Collects

- Parent's name
- Phone number
- Email address
- Insurance provider
- Child diagnosis status (yes/no)
- State (auto-detected + confirmed)

## Quick Start

### 1. Preview the Widget

Open `demo.html` in your browser to see the widget in action.

### 2. Set Up n8n Workflow

Follow `N8N_WORKFLOW_SETUP.md` to create the backend workflow that:
- Receives chat messages
- Calls Claude API with your custom prompt
- Extracts lead information
- Sends formatted emails to ABA owner

### 3. Configure the Widget

Edit the `CONFIG` object at the top of `widget.js`:

```javascript
const CONFIG = {
  webhookUrl: 'YOUR_N8N_WEBHOOK_URL',  // Required!
  companyName: 'Your ABA Company',
  primaryColor: '#E67E22',              // Brand color
  secondaryColor: '#2C3E50',            // Header color
  agentName: 'Sarah',                   // Bot's name
  agentAvatar: 'URL_TO_AGENT_PHOTO',    // Agent image
  position: 'right',                    // 'left' or 'right'
  greeting: 'Hi! 👋 Are you exploring ABA therapy?'
};
```

### 4. Deploy to Client Website

**Option A: Self-hosted**
1. Host `widget.js` on your server (or client's)
2. Add to their website before `</body>`:
```html
<script src="https://yourserver.com/widget.js"></script>
```

**Option B: Inline embed**
1. Copy entire contents of `widget.js`
2. Add to their website:
```html
<script>
// Paste widget.js contents here
</script>
```

**Option C: CDN hosting (recommended)**
1. Upload to GitHub and use jsDelivr
2. Or use Cloudflare Pages, Vercel, Netlify (all free)
3. Single script tag for client

## File Structure

```
aba-chat-widget/
├── widget.js                  # Main widget code (customize & deploy)
├── demo.html                  # Test page to preview widget
├── N8N_WORKFLOW_SETUP.md      # Complete n8n workflow guide
└── README.md                  # This file
```

## Customizing Per Client

For each ABA company:

1. **Colors**: Match their brand
2. **Agent name/photo**: Personalize the bot
3. **Service areas**: Update in n8n prompt (which states they serve)
4. **Email recipient**: Route to their inbox
5. **Greeting message**: Customize opening line

## Cost Breakdown

- **Widget hosting**: Free (static JS file)
- **n8n cloud**: ~$20/month (your existing account)
- **Claude API**: ~$0.01-0.05 per conversation
- **Total**: Under $25/month for unlimited clients

## No PHI Collected

This version intentionally does NOT collect:
- Insurance member IDs
- Medical record numbers
- Detailed diagnosis information

This keeps you outside HIPAA requirements. The ABA company collects sensitive PHI during their follow-up call.

## Future Enhancements

When ready to add HIPAA compliance:
1. Self-host n8n on HIPAA-compliant infrastructure
2. Add encryption
3. Collect insurance member ID
4. Push directly to CRM

## Support

Questions? Issues? The widget is self-contained JavaScript - check browser console for errors, and n8n execution logs for workflow issues.
