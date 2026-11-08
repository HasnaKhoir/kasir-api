import { pool } from '../config/db.js';
import { ApiError } from '../utils/http.js';

export async function createTransaction(input) {
  const { user_id, customer_id = null, payment_method_id, paid_amount, items } = input;
  for (const [key, value] of [['user_id', user_id], ['payment_method_id', payment_method_id]]) if (!Number.isInteger(value) || value < 1) throw new ApiError(400, `${key} wajib berupa ID positif`);
  if (customer_id !== null && (!Number.isInteger(customer_id) || customer_id < 1)) throw new ApiError(400, 'customer_id harus berupa ID positif atau null');
  if (!Number.isSafeInteger(paid_amount) || paid_amount < 0) throw new ApiError(400, 'paid_amount wajib berupa bilangan bulat >= 0');
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'Items transaksi tidak boleh kosong');
  const quantities = new Map();
  for (const item of items) { if (!Number.isInteger(item.product_id) || item.product_id < 1 || !Number.isInteger(item.quantity) || item.quantity < 1) throw new ApiError(400, 'Setiap item harus memiliki product_id dan quantity positif'); quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + item.quantity); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ids = [...quantities.keys()].sort((a, b) => a - b);
    const locked = await client.query('SELECT id,name,price,stock,is_active FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE', [ids]);
    const byId = new Map(locked.rows.map(p => [p.id, p]));
    for (const [id, quantity] of quantities) { const p = byId.get(id); if (!p) throw new ApiError(400, `Produk dengan ID ${id} tidak ditemukan`); if (!p.is_active) throw new ApiError(400, `Produk ${p.name} tidak aktif`); if (p.stock < quantity) throw new ApiError(400, `Stok produk ${p.name} tidak mencukupi`); }
    const total = [...quantities].reduce((sum, [id, qty]) => sum + Number(byId.get(id).price) * qty, 0);
    if (paid_amount < total) throw new ApiError(400, 'Pembayaran kurang dari total belanja');
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const seq = await client.query("SELECT nextval('invoice_number_seq') AS n");
    const invoice = `INV-${date}-${String(seq.rows[0].n).padStart(4, '0')}`;
    const trx = await client.query(`INSERT INTO transactions(invoice_number,user_id,customer_id,payment_method_id,total_amount,paid_amount,change_amount)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [invoice,user_id,customer_id,payment_method_id,total,paid_amount,paid_amount-total]);
    for (const [id, qty] of quantities) { const p = byId.get(id); await client.query('INSERT INTO transaction_items(transaction_id,product_id,quantity,unit_price,subtotal) VALUES($1,$2,$3,$4,$5)', [trx.rows[0].id,id,qty,p.price,Number(p.price)*qty]); await client.query('UPDATE products SET stock=stock-$1,updated_at=now() WHERE id=$2', [qty,id]); }
    await client.query('COMMIT');
    return trx.rows[0];
  } catch (err) { await client.query('ROLLBACK'); throw err; } finally { client.release(); }
}
export async function cancelTransaction(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM transactions WHERE id=$1 FOR UPDATE', [id]);
    if (!result.rowCount) throw new ApiError(404, 'Transaksi tidak ditemukan');
    if (result.rows[0].status === 'dibatalkan') throw new ApiError(409, 'Transaksi sudah dibatalkan');
    const items = await client.query('SELECT product_id,quantity FROM transaction_items WHERE transaction_id=$1 ORDER BY product_id', [id]);
    for (const item of items.rows) await client.query('UPDATE products SET stock=stock+$1,updated_at=now() WHERE id=$2', [item.quantity,item.product_id]);
    const updated = await client.query("UPDATE transactions SET status='dibatalkan' WHERE id=$1 RETURNING *", [id]);
    await client.query('COMMIT'); return updated.rows[0];
  } catch (err) { await client.query('ROLLBACK'); throw err; } finally { client.release(); }
}
