const valueOf = (id) => document.querySelector(`#${id}`)?.value?.trim() ?? '';

const nullableNumber = (id) => {
  const value = valueOf(id);
  if (value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const bangkokDateTime = (dateId, timeId) => {
  const date = valueOf(dateId);
  const time = valueOf(timeId);
  return date && time ? `${date}T${time}:00+07:00` : '';
};

const readOperationRecords = () => {
  const serialized = valueOf('operationRecordsPayload');
  if (!serialized) return null;
  try {
    const records = JSON.parse(serialized);
    return Array.isArray(records) ? records : null;
  } catch {
    return null;
  }
};

const operationFieldValue = (name, index) => {
  const id = index === 0 ? name : `${name}-${index + 1}`;
  return valueOf(id);
};

const readOperationsFromFields = () => Array.from({ length: 3 }, (_, index) => ({
  operationNo: operationFieldValue('operationNo', index),
  surgeon: operationFieldValue('surgeon', index),
  secondSurgeon: operationFieldValue('secondSurgeon', index),
  thirdSurgeon: operationFieldValue('thirdSurgeon', index),
  anesthesiologist: operationFieldValue('anesthesiologist', index),
  anesthesiaType: operationFieldValue('anesthesiaType', index),
  specialEquipment: operationFieldValue('specialEquipment', index),
  scrubNurse: operationFieldValue('scrubNurse', index),
  circulatingNurse: operationFieldValue('circulatingNurse', index),
  anesthesiaNurse: operationFieldValue('anesthesiaNurse', index),
  implantPresent: operationFieldValue('implantPresent', index),
  implant: operationFieldValue('implant', index),
  operationDepartment: operationFieldValue('operationDepartment', index),
  operatingRoom: operationFieldValue('operatingRoom', index),
  urgency: operationFieldValue('urgency', index),
  operationType: operationFieldValue('operationType', index),
  preoperativeDiagnosis: operationFieldValue('preoperativeDiagnosis', index),
  procedureName: operationFieldValue('procedureName', index),
  procedureFreeText: operationFieldValue('procedureFreeText', index),
  primaryBodySite: operationFieldValue('primaryBodySite', index)
}));

const operationFromRecord = (record = {}) => ({
  operationNo: record.operationNo ?? valueOf('operationNo'),
  surgeon: record.surgeon ?? valueOf('surgeon'),
  secondSurgeon: record.secondSurgeon ?? valueOf('secondSurgeon'),
  thirdSurgeon: record.thirdSurgeon ?? valueOf('thirdSurgeon'),
  anesthesiologist: record.anesthesiologist ?? valueOf('anesthesiologist'),
  anesthesiaType: record.anesthesiaType ?? valueOf('anesthesiaType'),
  specialEquipment: record.specialEquipment ?? valueOf('specialEquipment'),
  scrubNurse: record.scrubNurse ?? valueOf('scrubNurse'),
  circulatingNurse: record.circulatingNurse ?? valueOf('circulatingNurse'),
  anesthesiaNurse: record.anesthesiaNurse ?? valueOf('anesthesiaNurse'),
  implantPresent: record.implantPresent === '' || record.implantPresent == null ? null : String(record.implantPresent) === 'true',
  implant: record.implant ?? valueOf('implant'),
  department: record.operationDepartment ?? valueOf('operationDepartment'),
  location: valueOf('operationLocation'),
  operatingRoom: record.operatingRoom ?? valueOf('operatingRoom'),
  urgency: record.urgency ?? valueOf('urgency'),
  operationType: record.operationType ?? valueOf('operationType'),
  preoperativeDiagnosis: record.preoperativeDiagnosis ?? valueOf('preoperativeDiagnosis'),
  procedureName: record.procedureName ?? valueOf('procedureName'),
  procedureFreeText: record.procedureFreeText ?? valueOf('procedureFreeText'),
  primaryBodySite: record.primaryBodySite ?? valueOf('primaryBodySite'),
  laterality: valueOf('laterality'),
  secondaryOperation: valueOf('secondaryOperation'),
  startAt: bangkokDateTime('operationStartDate', 'operationStartTime'),
  endAt: bangkokDateTime('operationEndDate', 'operationEndTime'),
  durationMinutes: nullableNumber('operationDuration'),
  outcome: valueOf('operationOutcome'),
  reportTemplate: valueOf('operationReportTemplate'),
  status: valueOf('operationStatus')
});

const readOperationData = () => {
  const storedRecords = readOperationRecords() || [];
  const fieldRecords = readOperationsFromFields();
  const records = fieldRecords.map((record, index) => ({ ...storedRecords[index], ...record }));
  const operations = records
    .filter((record, index) => index === 0 || String(record.operationNo || '').trim())
    .map(operationFromRecord);

  return {
  requestId: crypto.randomUUID(),
  eventType: 'OPERATION_CREATED',
  sourceSystem: 'RIS_EXTENSION',
  patient: {
    hn: valueOf('hn'),
    firstName: valueOf('firstName'),
    lastName: valueOf('lastName'),
    dateOfBirth: valueOf('dateOfBirth'),
    age: nullableNumber('age'),
    sex: valueOf('sex'),
    heightCm: nullableNumber('heightCm'),
    weightKg: nullableNumber('weightKg'),
    bmi: nullableNumber('bmi')
  },
  visit: {
    episodeNo: valueOf('episodeNo'),
    episodeDate: valueOf('episodeDate'),
    // Patient type is assigned later by nursing staff in the OR workflow.
    patientType: '',
    wardName: valueOf('wardName'),
    bedNo: valueOf('bedNo')
  },
  operation: operations[0] ?? operationFromRecord(),
  operations
  };
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'READ_RIS_DATA') {
    sendResponse({ success: true, data: readOperationData() });
  }
  if (message.type === 'UPDATE_RIS_STATUS') {
    const status = document.querySelector('#extensionStatus');
    if (status) status.textContent = message.text;
    if (message.operationUpdated) {
      const updatedAt = String(Date.now());
      localStorage.setItem('or-smart-ris-operation-updated', updatedAt);
      window.dispatchEvent(new CustomEvent('or-smart-ris-operation-updated', {
        detail: { updatedAt }
      }));
    }
    sendResponse({ success: true });
  }
});
