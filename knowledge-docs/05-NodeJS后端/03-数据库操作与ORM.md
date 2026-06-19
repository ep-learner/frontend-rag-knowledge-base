# 数据库操作与 ORM

## 核心知识点

### 数据库类型

常见的数据库类型：

1. **关系型数据库**：MySQL, PostgreSQL, SQLite
2. **NoSQL 数据库**：MongoDB, Redis, Cassandra
3. **向量数据库**：Chroma, Pinecone, Milvus

### ORM 框架

ORM（对象关系映射）框架：
- **Sequelize**：MySQL, PostgreSQL, SQLite
- **Prisma**：多数据库支持
- **Mongoose**：MongoDB

### 查询优化

数据库查询优化策略：
- 索引优化
- 查询缓存
- 分页查询
- 避免 N+1 查询

## 代码示例

```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: true
    }
  }
});

async function init() {
  await sequelize.sync();
  
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  const users = await User.findAll({
    where: {
      name: {
        [Sequelize.Op.like]: '%John%'
      }
    },
    limit: 10,
    offset: 0
  });
  
  console.log(users);
}

init();
```

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user;
}

async function getUsers(page, limit) {
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  return users;
}
```

## 常见问题

### Q: ORM 和原生 SQL 哪个更好？

A: ORM 提高开发效率，原生 SQL 更灵活，可按需选择。

### Q: 如何处理数据库连接池？

A: 大多数 ORM 框架都内置了连接池管理。

## 参考链接

- [Sequelize](https://sequelize.org/)
- [Prisma](https://www.prisma.io/)
- [Mongoose](https://mongoosejs.com/)
