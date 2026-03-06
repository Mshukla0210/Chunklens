import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const chunkDocument = async ({ text, method, chunkSize = 300, overlap = 50 }) => {
  const { data } = await api.post('/chunk', {
    text,
    method,
    chunk_size: chunkSize,
    overlap,
  })
  return data
}

export const retrieveAndAnswer = async ({ text, query, method, chunkSize = 300, overlap = 50, topK = 3 }) => {
  const { data } = await api.post('/retrieve', {
    text,
    query,
    method,
    chunk_size: chunkSize,
    overlap,
    top_k: topK,
  })
  return data
}

export const compareAll = async ({ text, query, chunkSize = 300, overlap = 50, topK = 3 }) => {
  const { data } = await api.post('/compare', {
    text,
    query,
    method: 'fixed', // default, backend overrides per method
    chunk_size: chunkSize,
    overlap,
    top_k: topK,
  })
  return data
}
