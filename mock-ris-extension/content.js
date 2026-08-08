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

const readOperationData = () => ({
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
  operation: {
    operationNo: valueOf('operationNo'),
    surgeon: valueOf('surgeon'),
    secondSurgeon: valueOf('secondSurgeon'),
    department: valueOf('operationDepartment'),
    location: valueOf('operationLocation'),
    operatingRoom: valueOf('operatingRoom'),
    urgency: valueOf('urgency'),
    operationType: valueOf('operationType'),
    preoperativeDiagnosis: valueOf('preoperativeDiagnosis'),
    procedureName: valueOf('procedureName'),
    procedureFreeText: valueOf('procedureFreeText'),
    primaryBodySite: valueOf('primaryBodySite'),
    laterality: valueOf('laterality'),
    secondaryOperation: valueOf('secondaryOperation'),
    startAt: bangkokDateTime('operationStartDate', 'operationStartTime'),
    endAt: bangkokDateTime('operationEndDate', 'operationEndTime'),
    durationMinutes: nullableNumber('operationDuration'),
    outcome: document.querySelector('input[name="operationOutcome"]:checked')?.value ?? '',
    reportTemplate: valueOf('operationReportTemplate'),
    status: valueOf('operationStatus')
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'READ_RIS_DATA') {
    sendResponse({ success: true, data: readOperationData() });
  }
  if (message.type === 'UPDATE_RIS_STATUS') {
    const status = document.querySelector('#extensionStatus');
    if (status) status.textContent = message.text;
    sendResponse({ success: true });
  }
});
