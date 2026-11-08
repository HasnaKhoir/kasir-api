INSERT INTO categories(id,name,description) VALUES
(1,'Makanan','Makanan dan bahan pangan'),(2,'Minuman','Minuman kemasan'),(3,'Kebutuhan Harian','Perlengkapan rumah tangga') ON CONFLICT DO NOTHING;
INSERT INTO users(id,name,email,role) VALUES (1,'Admin Toko','admin@kasir.test','admin'),(2,'Siti Kasir','siti@kasir.test','kasir') ON CONFLICT DO NOTHING;
INSERT INTO customers(id,name,phone) VALUES (1,'Budi Santoso','081200000001'),(2,'Ani Wijaya','081200000002'),(3,'Pelanggan Umum',NULL) ON CONFLICT DO NOTHING;
INSERT INTO payment_methods(id,name) VALUES (1,'Tunai'),(2,'QRIS'),(3,'Debit') ON CONFLICT DO NOTHING;
INSERT INTO products(id,category_id,sku,name,price,stock) VALUES
(1,1,'MKN-001','Beras 5 kg',72000,30),(2,1,'MKN-002','Mi Instan',3500,100),(3,1,'MKN-003','Roti Tawar',18000,20),(4,1,'MKN-004','Gula 1 kg',16000,25),
(5,2,'MNM-001','Air Mineral 600 ml',4000,80),(6,2,'MNM-002','Teh Botol',6000,50),(7,2,'MNM-003','Kopi Kaleng',9000,35),
(8,3,'HRN-001','Sabun Mandi',5000,40),(9,3,'HRN-002','Deterjen 1 kg',22000,15),(10,3,'HRN-003','Tisu',12000,25) ON CONFLICT DO NOTHING;
INSERT INTO transactions(id,invoice_number,user_id,customer_id,payment_method_id,total_amount,paid_amount,change_amount,status,created_at) VALUES
(1,'INV-20261025-9001',2,1,1,79000,100000,21000,'selesai',now()),(2,'INV-20261025-9002',2,2,2,10000,10000,0,'selesai',now()),(3,'INV-20261025-9003',1,NULL,3,18000,20000,2000,'selesai',now()) ON CONFLICT DO NOTHING;
INSERT INTO transaction_items(transaction_id,product_id,quantity,unit_price,subtotal) VALUES
(1,1,1,72000,72000),(1,2,2,3500,7000),(2,5,1,4000,4000),(2,6,1,6000,6000),(3,3,1,18000,18000) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('categories','id'),GREATEST((SELECT max(id) FROM categories),1));
SELECT setval(pg_get_serial_sequence('users','id'),GREATEST((SELECT max(id) FROM users),1));
SELECT setval(pg_get_serial_sequence('customers','id'),GREATEST((SELECT max(id) FROM customers),1));
SELECT setval(pg_get_serial_sequence('payment_methods','id'),GREATEST((SELECT max(id) FROM payment_methods),1));
SELECT setval(pg_get_serial_sequence('products','id'),GREATEST((SELECT max(id) FROM products),1));
SELECT setval(pg_get_serial_sequence('transactions','id'),GREATEST((SELECT max(id) FROM transactions),1));
