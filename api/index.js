import 'dotenv/config';
import app from '../src/app.js';

// Menyalakan server hanya saat dijalankan di laptop (bukan di Vercel)
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
}

export default app;