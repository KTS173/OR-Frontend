const preview = document.querySelector('#jsonPreview');
const status = document.querySelector('#status');
const readButton = document.querySelector('#readData');
const sendButton = document.querySelector('#sendData');
let payload = null;
let apiEndpoint = null;

const setStatus = (message, type = 'neutral') => {
  status.textContent = message;
  status.className = `status ${type}`;
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    throw new Error('The active browser tab could not be read.');
  }

  let pageUrl;
  try {
    pageUrl = new URL(tab.url);
  } catch (_error) {
    throw new Error('Open the RIS Entry page on the OR SMART SSI server first.');
  }

  if (!['http:', 'https:'].includes(pageUrl.protocol) || !pageUrl.pathname.startsWith('/ris-entry')) {
    throw new Error('Open the /ris-entry page on the OR SMART SSI server first.');
  }

  return { tab, pageUrl };
};

const readDataFromPage = async () => {
  const { tab, pageUrl } = await getActiveTab();
  apiEndpoint = `${pageUrl.origin}/api/operations`;
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

  // Read the React-managed operation list directly as well. A RIS tab can keep
  // an older content-script instance alive after the extension is reloaded;
  // using the hidden form value here ensures Operations 2 and 3 are not lost.
  const [operationResult] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const serialized = document.querySelector('#operationRecordsPayload')?.value;
      if (!serialized) return null;
      try {
        const records = JSON.parse(serialized);
        return Array.isArray(records) ? records : null;
      } catch {
        return null;
      }
    }
  });
  const operationRecords = operationResult?.result;
  if (Array.isArray(operationRecords)) {
    payload.operations = operationRecords
      .map((record, index) => ({ ...record, operationNo: String(index + 1) }))
      .filter((record) => Object.entries(record).some(([key, value]) => key !== 'operationNo' && String(value ?? '').trim()))
      .map((record) => ({
        ...payload.operation,
        operationNo: record.operationNo || '',
        surgeon: record.surgeon || '',
        secondSurgeon: record.secondSurgeon || '',
        thirdSurgeon: record.thirdSurgeon || '',
        anesthesiologist: record.anesthesiologist || '',
        anesthesiaType: record.anesthesiaType || '',
        specialEquipment: record.specialEquipment || '',
        scrubNurse: record.scrubNurse || '',
        circulatingNurse: record.circulatingNurse || '',
        anesthesiaNurse: record.anesthesiaNurse || '',
        implantPresent: record.implantPresent === '' || record.implantPresent == null ? null : String(record.implantPresent) === 'true',
        implant: record.implant || '',
        department: record.operationDepartment || '',
        operatingRoom: record.operatingRoom || '',
        urgency: record.urgency || '',
        operationType: record.operationType || '',
        preoperativeDiagnosis: record.preoperativeDiagnosis || '',
        procedureName: record.procedureName || '',
        procedureFreeText: record.procedureFreeText || '',
        primaryBodySite: record.primaryBodySite || ''
      }));
    payload.operation = payload.operations[0] || payload.operation;
  }
  preview.textContent = JSON.stringify(payload, (key, value) => {
    if (key === 'operationNo') return undefined;
    return value;
  }, 2);
  return payload;
};

const updatePageStatus = async (text, operationUpdated = false) => {
  try {
    const { tab } = await getActiveTab();
    await chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_RIS_STATUS', text, operationUpdated });
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
    const operations = Array.isArray(payload.operations) ? payload.operations : [payload.operation];
    if (!operations.length) throw new Error('กรุณากรอกข้อมูลอย่างน้อย 1 Operation');
    if (!payload.patient?.hn?.trim() || !payload.visit?.episodeNo?.trim()) throw new Error('กรุณากรอก HN และ EN');
    if (operations.some((item) => !item.procedureName?.trim())) throw new Error('Operation / Procedure Name is required for every entered operation.');

    const requests = operations.map((operation) => {
      const requestPayload = { ...payload, requestId: crypto.randomUUID(), operation };
      delete requestPayload.operations;
      return requestPayload;
    });
    const response = await fetch(`${apiEndpoint}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: requests })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.message || `Backend returned HTTP ${response.status}.`);
    const message = `${result.message}: ${result.data.count} operation(s)`;
    setStatus(message, 'success');
    await updatePageStatus(`Extension status: ${message}`, true);
  } catch (error) {
    setStatus(`Send failed: ${error.message}`, 'error');
    await updatePageStatus(`Extension status: send failed — ${error.message}`);
  } finally {
    sendButton.disabled = false;
  }
});
