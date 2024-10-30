const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); 
const secretKey = 'secret-key'; 

const saltRounds = 10;

exports.register = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body; 
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send('Email đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    
 
    const userRole = await Role.findOne({ name: roles });

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      roles: userRole ? [userRole._id] : [] 
    });

    await newUser.save();
    res.redirect('/auth/login'); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Có lỗi xảy ra: ' + error.message);
  }
};




exports.login = async (req, res) => { 
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu không đúng!' });
    }

    const token = jwt.sign({ userId: user._id, roles: user.roles }, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.json({ message: 'Đăng nhập thành công!' });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
