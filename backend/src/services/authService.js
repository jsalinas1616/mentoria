const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dynamodb, TABLES } = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

class AuthService {
  async registrarUsuario(usuario) {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(usuario.password, 10);

    const item = {
      id,
      email: usuario.email,
      nombre: usuario.nombre,
      password: hashedPassword,
      rol: usuario.rol || 'mentor',
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: TABLES.USUARIOS,
      Item: item,
    };

    await dynamodb.put(params).promise();

    // No retornar la contraseña
    delete item.password;
    return item;
  }

  async login(email, password) {
    // Buscar usuario por email
    const params = {
      TableName: TABLES.USUARIOS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };

    const result = await dynamodb.scan(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    const usuario = result.Items[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Retornar usuario sin contraseña
    delete usuario.password;

    return {
      token,
      user: usuario,
    };
  }

  async obtenerUsuario(id) {
    const params = {
      TableName: TABLES.USUARIOS,
      Key: { id },
    };

    const result = await dynamodb.get(params).promise();
    
    if (result.Item) {
      delete result.Item.password;
    }
    
    return result.Item;
  }
}

module.exports = new AuthService();



