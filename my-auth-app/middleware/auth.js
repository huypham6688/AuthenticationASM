const jwt = require('jsonwebtoken');
const secretKey = 'secret-key';
const Role = require('../models/Role');


const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy token!' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ!' });
    }

    req.user = user; 
    next();
  });
};


const adminMiddleware = async (req, res, next) => {
  try {
    const userRoles = req.user.roles; 
    const adminRole = await Role.findOne({ name: 'Admin' });

    console.log('User roles from token:', userRoles); 
    console.log('Admin role ID:', adminRole._id); 

    if (userRoles.some(role => role.toString() === adminRole._id.toString())) {
      return next(); 
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập vào trang này!' });
    }
  } catch (error) {
    console.error('Admin middleware error:', error); 
    return res.status(500).json({ message: 'Lỗi server!' });
  }
};



module.exports = { authenticateToken, adminMiddleware };
