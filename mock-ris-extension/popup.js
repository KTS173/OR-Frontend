const preview = document.querySelector('#jsonPreview');
const status = document.querySelector('#status');
const readButton = document.querySelector('#readData');
const sendButton = document.querySelector('#sendData');
let payload = null;

const setStatus = (message, type = 'neutral') => {
  status.textContent = message;
  status.className = `status ${type}`;
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith('http://localhost:5173/')) {
    throw new Error('Open the RIS page at http://localhost:5173/ris-entry first.');
  }
  return tab;
};

const readDataFromPage = async () => {
  const tab = await getActiveTab();
  let response;
  try {
    response = await chrome.tabs.sendMessage(tab.id, { type: 'READ_RIS_DATA' });
  } catch (error) {
    if (!error.message.includes('Receiving end does not exist')) throw error;
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    response = await chrome.tabs.sendMessage(tab.id, { type: 'READ_RIS_DATA' });
  }
  if (!response?.success) throw new Error('The RIS form could not be read.');
  payload = response.data;
  preview.textContent = JSON.stringify(payload, null, 2);
  return payload;
};

const updatePageStatus = async (text) => {
  try {
    const tab = await getActiveTab();
    await chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_RIS_STATUS', text });
  } catch (_error) {
    // The popup status remains authoritative if the page was closed after reading.
  }
};

readButton.addEventListener('click', async () => {
  try {
    setStatus('Reading form data…', 'working');
    await readDataFromPage();
    setStatus('Data read successfully. Review it, then send.', 'success');
    await updatePageStatus('Extension status: form data read and ready to send');
  } catch (error) {
    payload = null;
    setStatus(error.message, 'error');
  }
});

sendButton.addEventListener('click', async () => {
  try {
    sendButton.disabled = true;
    setStatus('Reading and sending operation data…', 'working');
    await readDataFromPage();
    const response = await fetch('http://localhost:4000/api/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || `Backend returned HTTP ${response.status}.`);
    const message = `${result.message} (${result.data.operationNo})`;
    setStatus(message, 'success');
    await updatePageStatus(`Extension status: ${message}`);
  } catch (error) {
    setStatus(`Send failed: ${error.message}`, 'error');
    await updatePageStatus(`Extension status: send failed — ${error.message}`);
  } finally {
    sendButton.disabled = false;
  }
});
