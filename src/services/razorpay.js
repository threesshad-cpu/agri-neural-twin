const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiatePayment({ amount, planKey, planLabel, userName, userEmail, userPhone, onSuccess, onFailure }) {
  const loaded = await loadScript();
  if (!loaded) { onFailure?.('Razorpay SDK failed to load. Check your connection.'); return; }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) { onFailure?.('Razorpay key not configured.'); return; }

  const options = {
    key: keyId,
    amount: amount * 100, // paise
    currency: 'INR',
    name: 'Agri Neural Twin',
    description: `${planLabel} Plan — Monthly Subscription`,
    image: '/logo.png',
    prefill: {
      name: userName || '',
      email: userEmail || '',
      contact: userPhone || '',
    },
    notes: { plan: planKey },
    theme: { color: planKey === 'government' ? '#003366' : '#1D4ED8' },
    config: {
      display: {
        blocks: {
          utib: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
          other: { name: 'Other Methods', instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }] },
        },
        sequence: ['block.utib', 'block.other'],
        preferences: { show_default_blocks: false },
      },
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
      emi: false,
      paylater: false,
    },
    handler(response) {
      onSuccess?.({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || null,
        razorpay_signature: response.razorpay_signature || null,
        plan: planKey,
      });
    },
    modal: {
      ondismiss() { onFailure?.('Payment cancelled.'); },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (resp) => {
    onFailure?.(resp.error?.description || 'Payment failed.');
  });
  rzp.open();
}
