const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Tạo dữ liệu mẫu
async function createSampleData() {
  try {
    // Xóa dữ liệu cũ
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await User.deleteMany({});

    // Tạo các permission mẫu
    const permissions = await Permission.insertMany([
      { name: 'create_user' },
      { name: 'edit_user' },
      { name: 'delete_user' },
      { name: 'view_user' },
      { name: 'manage_roles' },
    ]);

    // Tạo các role mẫu với các quyền khác nhau
    const roles = await Role.insertMany([
      { name: 'Admin', permissions: [permissions[0]._id, permissions[1]._id, permissions[2]._id, permissions[3]._id, permissions[4]._id] },
      { name: 'Editor', permissions: [permissions[1]._id, permissions[3]._id] },
      { name: 'Viewer', permissions: [permissions[3]._id] },
      { name: 'Manager', permissions: [permissions[0]._id, permissions[4]._id] },
      { name: 'Supervisor', permissions: [permissions[1]._id, permissions[2]._id, permissions[3]._id] },
    ]);

    // Mã hóa mật khẩu trước khi lưu
    const saltRounds = 10; // Định nghĩa số vòng muối
    const usersData = [
      { username: 'user1', email: 'user1@example.com', password: 'password1', roles: [roles[0]._id] }, // Sửa ở đây
      { username: 'user2', email: 'user2@example.com', password: 'password2', roles: [roles[1]._id] },
      { username: 'user3', email: 'user3@example.com', password: 'password3', roles: [roles[2]._id] },
      { username: 'user4', email: 'user4@example.com', password: 'password4', roles: [roles[3]._id] },
      { username: 'user5', email: 'user5@example.com', password: 'password5', roles: [roles[4]._id] },
    ];

    // Mã hóa mật khẩu cho từng user
    const usersWithHashedPasswords = await Promise.all(usersData.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      return { ...user, password: hashedPassword };
    }));

    // Lưu các user vào cơ sở dữ liệu
    await User.insertMany(usersWithHashedPasswords);

    console.log('Dữ liệu mẫu đã được tạo thành công');
    mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
    mongoose.connection.close();
  }
}

createSampleData();
