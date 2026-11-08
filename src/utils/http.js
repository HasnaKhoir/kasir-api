export const ok = (res, message, data, status = 200) => res.status(status).json({ message, data });
export class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const mapping = { '23505': [409, 'Data duplikat: nilai harus unik'], '23503': [400, 'Referensi data tidak valid'], '23514': [400, 'Nilai tidak memenuhi aturan validasi'], '22P02': [400, 'Format data tidak valid'], '22007': [400, 'Format tanggal tidak valid'], '22008': [400, 'Tanggal di luar rentang yang valid'] };
  if (err.code === '23503' && (err.constraint || '').includes('transaction_items_product_id')) return res.status(409).json({error:'Produk sudah digunakan oleh item transaksi'});
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ error: 'Format JSON tidak valid' });
  const [status, message] = mapping[err.code] || [err.status || 500, err.status ? err.message : 'Terjadi kesalahan pada server'];
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
}
export const notFound = (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' });
export function positiveId(value) { const n = Number(value); if (!Number.isInteger(n) || n < 1) throw new ApiError(400, 'ID harus berupa bilangan bulat positif'); return n; }
