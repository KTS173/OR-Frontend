import { documents, patients, users } from '../data/mockData.js'

// Keep page components independent from the data source. Replace these methods
// with fetch/axios calls when the backend contract is ready.
const wait = (data, delay = 180) =>
  new Promise((resolve) => window.setTimeout(() => resolve(structuredClone(data)), delay))

export const api = {
  getPatients: () => wait(patients),
  getPatient: (id) => wait(patients.find((patient) => patient.id === id) ?? patients[0]),
  getDocuments: () => wait(documents),
  getUsers: () => wait(users),
}
