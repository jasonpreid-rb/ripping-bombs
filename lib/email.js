export async function sendRegistrationNotification(org) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'registration', org }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendApprovalEmail(org) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'approval', org }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
