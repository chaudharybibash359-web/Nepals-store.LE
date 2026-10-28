import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper: Domain Knowledge Fallback Engine for instant 24/7 gaming support
function generateSupportFallback(message: string, currentOrderContext?: any): string {
  const lower = (message || '').toLowerCase();

  // 1. Order Status & Tracking
  if (lower.includes('unp-') || lower.includes('order') || lower.includes('status') || lower.includes('track') || lower.includes('receipt')) {
    if (currentOrderContext && (currentOrderContext.orderNumber || (Array.isArray(currentOrderContext) && currentOrderContext.length > 0))) {
      const ord = Array.isArray(currentOrderContext) ? currentOrderContext[0] : currentOrderContext;
      return `Your recent order #${ord.orderNumber || 'UNP-2026-ACTIVE'} for ${ord.gameTitle || 'Game Top-up'} (${ord.denominationName || 'Voucher'}) is verified! Delivery completes within our guaranteed 2–3 minute SLA. You can view full details in the Live Order Tracker or Transaction History.`;
    }
    return 'All UniPin orders are processed automatically with a 2–3 minute SLA guarantee. You can track real-time fulfillment status by clicking "Transaction History" or checking the notification center bell at the top.';
  }

  // 2. Poppo Live Coins
  if (lower.includes('poppo') || lower.includes('coin') || lower.includes('stream')) {
    return 'For Poppo Live Coins: Enter your 7–9 digit Poppo ID (UID) found under your avatar in the Poppo Live app. Select from 7,000 up to 7,000,000 Coins and check out with 0% fee using UniPin Credits or your local wallet. Coins are credited to your host or user profile within seconds!';
  }

  // 3. Delivery Speed & SLA
  if (lower.includes('how fast') || lower.includes('delivery') || lower.includes('time') || lower.includes('sla') || lower.includes('delay')) {
    return 'UniPin utilizes direct API injection with gaming publishers. Most top-ups are fulfilled within 3 to 10 seconds, backed by an official 2–3 minute maximum SLA guarantee with real-time multi-channel alerts (Gmail, SMS, Telegram, Facebook, Twitter).';
  }

  // 4. UniPoints & VIP Loyalty Tiers
  if (lower.includes('unipoint') || lower.includes('point') || lower.includes('reward') || lower.includes('vip') || lower.includes('tier') || lower.includes('cashback')) {
    return 'With every top-up on UniPin, you earn UniPoints (e.g., 25–250 pts per purchase). Accumulate points to climb VIP tiers (Bronze, Silver, Gold, Platinum VIP) for higher discounts, and redeem points for free game vouchers, bonus credits, and exclusive loot items in the UniPoints Rewards modal!';
  }

  // 5. Payment Methods & Fees (NPR, IDR, e-wallets)
  if (lower.includes('payment') || lower.includes('qris') || lower.includes('dana') || lower.includes('gopay') || lower.includes('esewa') || lower.includes('khalti') || lower.includes('ime') || lower.includes('fee') || lower.includes('wallet')) {
    return 'UniPin supports regional and international payment channels: QRIS, DANA, GoPay, OVO, ShopeePay, Bank Virtual Accounts (BCA, Mandiri, BRI, BNI), Indomaret/Alfamart, and Nepal wallets (eSewa, Khalti, IME Pay, ConnectIPS). Paying with UniPin Credits incurs 0% admin fee!';
  }

  // 6. Voucher Redemption
  if (lower.includes('voucher') || lower.includes('redeem') || lower.includes('pin') || lower.includes('code')) {
    return 'To redeem a UniPin Voucher: 1) Click the "Redeem Voucher" tab in the top navigation, 2) Enter your 16-digit Serial/Code & 8-digit PIN, 3) Click "Redeem Now". UniPin Credits (UC) will be added to your balance instantly.';
  }

  // 7. Mobile Legends & Game UID Lookup
  if (lower.includes('mlbb') || lower.includes('mobile legends') || lower.includes('diamond') || lower.includes('zone') || lower.includes('uid')) {
    return 'For Mobile Legends, enter your 8–9 digit User ID and 4-digit Zone ID (found by clicking your avatar in-game). Our system automatically validates your In-Game Nickname (IGN) to ensure 100% accurate delivery before payment.';
  }

  // 8. Free Fire / PUBG / Genshin / Roblox / Valorant
  if (lower.includes('free fire') || lower.includes('ff') || lower.includes('pubg') || lower.includes('genshin') || lower.includes('roblox') || lower.includes('valorant')) {
    return 'We offer guaranteed lowest prices on Free Fire Diamonds, PUBG Mobile UC, Genshin Genesis Crystals, Roblox Robux, and Valorant Points. All orders feature automated IGN nickname verification and instant credit delivery.';
  }

  // 9. Refunds & Buyer Protection
  if (lower.includes('refund') || lower.includes('safe') || lower.includes('guarantee') || lower.includes('failed')) {
    return 'UniPin provides a 100% Buyer Protection Guarantee. If an order fails to deliver or an invalid voucher is received, our system automatically re-dispatches or credits a full replacement to your UniPin Credits balance.';
  }

  // 10. Multi-Channel Login & Notifications
  if (lower.includes('login') || lower.includes('social') || lower.includes('telegram') || lower.includes('sms') || lower.includes('notification')) {
    return 'You can link multiple identities to your UniPin account: Google/Gmail, Phone Number (SMS OTP), Telegram, Facebook, and Twitter/X. Receive live delivery receipts and tracking updates across all connected channels.';
  }

  return 'Welcome to UniPin 24/7 Support! I can assist you with game top-ups (Poppo Live, MLBB, Free Fire, PUBG, Genshin), UniPoints rewards, order tracking, payment methods (QRIS, DANA, eSewa, UniPin Credits 0% fee), and voucher redemption.';
}

// 2. 24/7 AI Customer Support Chat
app.post('/api/chat', async (req, res) => {
  const { message, history, conversationHistory, currentOrderContext, orderContext } = req.body;
  const activeOrderCtx = currentOrderContext || orderContext;

  const systemPrompt = `You are "UniPin AI Assistant", an expert, friendly 24/7 customer support specialist for UniPin Low-Price Gaming Top-Up & Voucher Platform.
Your duty:
1. Help users top up games & live stream coins at the lowest guaranteed wholesale prices (Poppo Live Coins, Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Valorant, Roblox, Honor of Kings, Steam, UniPin Vouchers).
2. Assist with order status inquiries (e.g. format UNP-YYYYMMDD-XXXXX). Explain that orders are fulfilled within a 2-3 minute SLA guarantee automatically.
3. Help users find their User ID / Zone ID / Poppo ID UID across apps.
4. Explain payment channels: QRIS, DANA, GoPay, OVO, ShopeePay, BCA/Mandiri/BRI/BNI Virtual Accounts, Nepal wallets (eSewa, Khalti, IME Pay), Indomaret/Alfamart, UniPin Credits (0% fee), and UniPin Voucher Code direct redeem.
5. Provide refund policy guidance: 100% money-back or UniPin Credit replacement guarantee if any top-up fails.
6. Tone: Courteous, professional, responsive, gaming-savvy. Keep responses concise, clear, and action-oriented.`;

  const ai = getGeminiClient();

  if (ai) {
    // Attempt with primary model gemini-3.7-flash
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            text: `System Context: ${systemPrompt}\n\nCurrent Order Info context: ${JSON.stringify(activeOrderCtx || {})}\n\nUser Question: ${message}`,
          },
        ],
      });

      const replyText = response.text || generateSupportFallback(message, activeOrderCtx);
      return res.json({ reply: replyText, isAi: true });
    } catch (primaryError: any) {
      console.warn('Primary model (gemini-3.7-flash) capacity/error, attempting fallback model (gemini-flash-latest):', primaryError?.message);

      // Attempt with resilient fallback model
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [
            {
              text: `System Context: ${systemPrompt}\n\nCurrent Order Info context: ${JSON.stringify(activeOrderCtx || {})}\n\nUser Question: ${message}`,
            },
          ],
        });

        const fallbackReplyText = fallbackResponse.text || generateSupportFallback(message, activeOrderCtx);
        return res.json({ reply: fallbackReplyText, isAi: true });
      } catch (secondaryError: any) {
        console.warn('Secondary AI model fallback also encountered demand spike, using domain knowledge engine:', secondaryError?.message);
        const replyText = generateSupportFallback(message, activeOrderCtx);
        return res.json({ reply: replyText, isAi: false, fallback: true });
      }
    }
  }

  // When API client is not configured
  const replyText = generateSupportFallback(message, activeOrderCtx);
  return res.json({ reply: replyText, isAi: false });
});

// 3. Game ID Nickname Lookup Verification Simulator
app.post('/api/lookup-game-id', (req, res) => {
  const { gameId, userId, zoneId, server } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  const mockNames: Record<string, string[]> = {
    'poppo-live': ['PoppoStar_VIP✨', 'HostSophia_Live', 'DiamondQueen_Poppo', 'VIP_Agent_99', 'BellaLive_Host', 'PoppoAmbassador_ID'],
    mlbb: ['ViperSlayer_ID', 'MythicGlory99', 'KaguraMain_ID', 'ChouFreestyle', 'OnicFanBoy', 'LemonSquad'],
    freefire: ['GarenaSniper_Pro', 'BooyahMaster77', 'AlokLover_FF', 'HeadshotKing_ID'],
    pubgm: ['PochinkiLover', 'AWM_Headhunter', 'ConquerorPlayer', 'ChickenDinner99'],
    genshin: ['LumieKeqing', 'ArlecchinoMain', 'ZhongliShield', 'RaidenShogun_Asia'],
    valorant: ['JettDiff#SEA', 'ReynaSmurf#ID1', 'OmenDarkness#AP', 'VandalGod#1337'],
    hok: ['DragonSlayer_HOK', 'LuBuDominance', 'AngelaMidMaster', 'GuanYuRider'],
    roblox: ['BloxBuilder2026', 'RobuxTycoon', 'AvatarStylist_ID'],
  };

  const pool = mockNames[gameId] || ['GamerMaster_VIP', 'ProUniPinUser', 'AcePlayer2026'];
  // Deterministic pick based on userId
  const charCodeSum = userId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  const picked = pool[charCodeSum % pool.length];

  return res.json({
    success: true,
    ign: picked,
    verified: true,
    region: server || (zoneId ? `Zone ${zoneId}` : 'Global Server'),
    message: `Account verified: ${picked}`,
  });
});

// 4. Automated Email Receipt Simulation & Dispatch
app.post('/api/email-receipt', (req, res) => {
  const { order, recipientEmail } = req.body;

  if (!order || !recipientEmail) {
    return res.status(400).json({ success: false, message: 'Order details and recipient email are required' });
  }

  // Simulated email dispatch log
  const emailPayload = {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@unipin-receipts.com`,
    to: recipientEmail,
    subject: `[UniPin Receipt] Order #${order.orderNumber} - ${order.gameTitle} (${order.denominationName})`,
    sentAt: new Date().toISOString(),
    status: 'DELIVERED',
    smtpResponse: '250 2.0.0 OK: message queued 100% delivered',
  };

  console.log(`[UniPin SMTP] Dispatched automated e-receipt for Order ${order.orderNumber} to ${recipientEmail}`);

  return res.json({
    success: true,
    emailPayload,
    message: `Official UniPin e-receipt successfully delivered to ${recipientEmail}`,
  });
});

// 5. Multi-Channel Order Notification Dispatch Engine (Gmail, Phone SMS, Telegram, FB, TW)
app.post('/api/notifications/dispatch', (req, res) => {
  const { order, channels = ['gmail', 'phone_sms', 'telegram', 'facebook', 'twitter'] } = req.body;

  if (!order) {
    return res.status(400).json({ success: false, message: 'Order object is required' });
  }

  const timestamp = new Date().toISOString();
  const dispatchResults: Array<{
    channel: string;
    target: string;
    status: string;
    messageId: string;
    messageText: string;
  }> = [];

  // 1. Gmail
  if (channels.includes('gmail')) {
    const target = order.customerEmail || 'chaudharybibash359@gmail.com';
    dispatchResults.push({
      channel: 'gmail',
      target,
      status: 'DELIVERED',
      messageId: `gmail_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      messageText: `[UniPin Delivery Confirmed] Order #${order.orderNumber} for ${order.gameTitle} (${order.denominationName}) was credited to ${order.ignValidated || order.userId}. Serial: ${order.serialNumber || 'SN-AUTO-2026'}. +${order.uniPointsEarned || 25} UniPoints earned.`,
    });
  }

  // 2. Phone SMS
  if (channels.includes('phone_sms')) {
    const target = order.customerPhone || '+977 9801234567';
    dispatchResults.push({
      channel: 'phone_sms',
      target,
      status: 'DELIVERED',
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      messageText: `[UniPin Alert] Order #${order.orderNumber} delivered in 2.8s. ${order.gameTitle} ${order.denominationName} added to UID ${order.userId}. Help: unipin.com/support`,
    });
  }

  // 3. Telegram Bot
  if (channels.includes('telegram')) {
    const target = order.customerTelegram || '@bibash_gamer';
    dispatchResults.push({
      channel: 'telegram',
      target,
      status: 'DELIVERED',
      messageId: `tg_bot_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      messageText: `🤖 UniPin Dispatcher Bot: Order ${order.orderNumber} successfully completed! ${order.gameTitle} [${order.denominationName}] delivered to ${order.ignValidated || order.userId}. Thank you for using UniPin!`,
    });
  }

  // 4. Facebook Gaming
  if (channels.includes('facebook')) {
    const target = order.customerFacebook || 'fb.com/bibash.gaming';
    dispatchResults.push({
      channel: 'facebook',
      target,
      status: 'DELIVERED',
      messageId: `fb_msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      messageText: `[UniPin Gaming] Order #${order.orderNumber} delivered! Your top-up is live. +${order.uniPointsEarned || 25} UniPoints credited to your VIP profile.`,
    });
  }

  // 5. Twitter / X Direct Message
  if (channels.includes('twitter')) {
    const target = order.customerTwitter || '@bibash_c';
    dispatchResults.push({
      channel: 'twitter',
      target,
      status: 'DELIVERED',
      messageId: `x_dm_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      messageText: `[UniPin X-Bot] Delivery Verified for Order ${order.orderNumber}. Game: ${order.gameTitle}. Verified ID: ${order.userId}.`,
    });
  }

  console.log(`[UniPin Multi-Channel Dispatcher] Dispatched ${dispatchResults.length} notifications for Order ${order.orderNumber}`);

  return res.json({
    success: true,
    orderNumber: order.orderNumber,
    deliveredAt: timestamp,
    dispatches: dispatchResults,
    message: `Delivery alerts dispatched to ${dispatchResults.length} channels (Gmail, SMS, Telegram, FB, TW) successfully`,
  });
});

// 6. Social Identity Login & Account Verification API
app.post('/api/auth/social-login', (req, res) => {
  const { provider, identifier, token } = req.body;

  if (!provider || !identifier) {
    return res.status(400).json({ success: false, message: 'Provider and identifier are required' });
  }

  const profile = {
    id: `usr_${Math.random().toString(36).substring(2, 8)}`,
    provider,
    identifier,
    name: provider === 'google' ? identifier.split('@')[0].toUpperCase() : `${provider.toUpperCase()}_User`,
    email: provider === 'google' ? identifier : 'chaudharybibash359@gmail.com',
    authenticatedAt: new Date().toISOString(),
    status: 'ACTIVE',
  };

  return res.json({
    success: true,
    profile,
    message: `Successfully authenticated with ${provider}`,
  });
});

// 7. QR Scan Verification & Detection Engine
app.post('/api/payment/verify-qr-scan', (req, res) => {
  const { orderNumber, paymentMethodId, paymentCategory, amountIDR } = req.body;

  // Determine detected wallet application based on method
  let appName = 'Mobile Banking / QRIS Scanner';
  let networkDetails = 'National QR Gateway';
  let deviceType = 'Mobile Phone Camera';

  if (paymentMethodId === 'bnb-smart-chain' || paymentCategory === 'crypto_web3') {
    appName = 'Binance / Trust Wallet (BEP-20 Web3 Scanner)';
    networkDetails = 'BNB Smart Chain (Chain ID: 56)';
    deviceType = 'Crypto Mobile Wallet';
  } else if (paymentCategory === 'nepal_wallet' || paymentMethodId?.includes('esewa') || paymentMethodId?.includes('khalti')) {
    const isKhalti = paymentMethodId?.includes('khalti');
    appName = isKhalti ? 'Khalti Digital Wallet App' : 'eSewa Nepal App';
    networkDetails = 'Merchant ID: 9765741629 (Bibash Chaudhary)';
    deviceType = 'Nepalese PSP Mobile Client';
  } else if (paymentMethodId === 'qris') {
    appName = 'GoPay / DANA / BCA Mobile QRIS';
    networkDetails = 'ASPI QRIS Interoperability Rail';
    deviceType = 'Smartphone E-Wallet Scanner';
  }

  const detectedAt = new Date().toISOString();
  const scanSessionId = `SCAN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  console.log(`[UniPin Gateway] QR Scan detected for Order ${orderNumber || 'UNKNOWN'} via ${appName}`);

  return res.json({
    success: true,
    scanned: true,
    scanSessionId,
    detectedAt,
    appName,
    networkDetails,
    deviceType,
    orderNumber,
    message: 'Payment QR has been successfully scanned and detected by the gateway rail.',
  });
});

// Vite middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniPin Top-up Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
