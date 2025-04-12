require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Submit contact form
app.post('/submit-form', async (req, res) => {

  // Cấu hình Mailtrap transporter
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0dc621511bde79",
      pass: "cf5de7320e6381" // Điền đầy đủ pass ở đây
    }
  });

  const { name, email, message } = req.body;

  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `Thông tin liên hệ từ ${name}`,
    text: `Tên: ${name}\nEmail: ${email}\nTin nhắn: ${message}`
  };

  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Xác nhận đã nhận thông tin liên hệ',
    text: `Chào ${name},\n\nChúng tôi đã nhận được thông tin của bạn.\n\nCảm ơn bạn!`
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    // Lưu vào contacts.json
    const existingData = await fs.readFile('contacts.json', 'utf-8').catch(() => '[]');
    const contacts = JSON.parse(existingData);
    contacts.push({ name, email, message, date: new Date().toISOString() });
    await fs.writeFile('contacts.json', JSON.stringify(contacts, null, 2));

    res.status(200).send('Thông tin đã được gửi!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi gửi thông tin.');
  }
});

// Submit order form
app.post('/submit-order', async (req, res) => {
  // Cấu hình Mailtrap transporter
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0dc621511bde79",
      pass: "cf5de7320e6381"
    }
  });

  const { name, phone, address} = req.body; // thêm email khách hàng vào

  // Gửi cho Admin
  const adminMailOptions = {
    from: '"Shop Đẹp" <shop@example.com>',  // ghi rõ luôn
    to: "admin@example.com",                // địa chỉ mail admin nhận thông báo
    subject: `🛒 Đơn hàng mới từ khách ${name}`,
    text: `
    🔔 Bạn có đơn hàng mới!

    👤 Tên khách: ${name}
    📞 Số điện thoại: ${phone}
    🏠 Địa chỉ: ${address}

    Hãy liên hệ và xử lý đơn sớm nhất nhé!
    `
  };

  // Gửi xác nhận cho Khách
  const userMailOptions = {
    from: '"Shop Đẹp" <shop@example.com>',
    to: "test@example.com",    // phải là email khách
    subject: 'Xác nhận đơn hàng',
    text: `
    Chào ${name},

    Chúng tôi đã nhận đơn hàng của bạn:

    🛍️ Đơn hàng:
    💵 Tổng thanh toán: đ

    Cảm ơn bạn đã mua hàng tại Shop Đẹp!
    `
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    // Lưu vào orders.json
    const existingOrders = await fs.readFile('orders.json', 'utf-8').catch(() => '[]');
    const orders = JSON.parse(existingOrders);
    orders.push({ name, phone, address});
    await fs.writeFile('orders.json', JSON.stringify(orders, null, 2));

    res.status(200).send('Đơn hàng đã được gửi!');

  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi gửi đơn hàng.');
  }
});



// Xem tất cả liên hệ
app.get('/contacts', async (req, res) => {
  try {
    const data = await fs.readFile('contacts.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).send('Không thể đọc danh sách liên hệ.');
  }
});

// Server chạy
app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});

// Route mặc định trả về index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});
const sql = require('mssql');

// Cấu hình SQL Server
const config = {
  user: 'sa',            // hoặc user khác
  password: 'your_password',
  server: 'localhost',   // hoặc IP SQL Server
  database: 'your_database_name',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
const express = require('express');
// const app = express();
const sql = require('mssql');

app.use(express.json());

// Kết nối
sql.connect(config).then(pool => {
  console.log("Kết nối SQL thành công");

  // Đăng ký
  app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    try {
      await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query("INSERT INTO Users (username, password) VALUES (@username, @password)");
      res.json({ message: "Đăng ký thành công!" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi đăng ký", error: err.message });
    }
  });

  // Đăng nhập
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query("SELECT * FROM Users WHERE username = @username AND password = @password");

      if (result.recordset.length > 0) {
        res.json({ message: "Đăng nhập thành công!" });
      } else {
        res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
      }
    } catch (err) {
      res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
    }
  });

}).catch(err => console.error("Lỗi kết nối SQL:", err));

app.listen(3000, () => console.log("Server chạy tại http://localhost:3000"));