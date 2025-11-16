const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

exports.register = async (event) => {
  try {
    const { nombre, email, password } = JSON.parse(event.body);

    if (!nombre || !email || !password) {
      return response(400, {
        success: false,
        message: 'Nombre, email y password son requeridos'
      });
    }

    if (!email.endsWith('@utec.edu.pe')) {
      return response(403, {
        success: false,
        message: 'Solo se permiten correos institucionales @utec.edu.pe'
      });
    }

    const existingUser = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }
    }).promise();

    if (existingUser.Item) {
      return response(409, {
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      nombre,
      password: hashedPassword,
      fecha_registro: new Date().toISOString(),
      activo: true
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: newUser
    }).promise();

    const token = jwt.sign(
      { email, nombre },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return response(201, {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { email, nombre, token }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return response(500, {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return response(400, {
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { email }
    }).promise();

    if (!result.Item) {
      return response(401, {
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.Item;
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return response(401, {
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { email: user.email, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return response(200, {
      success: true,
      message: 'Login exitoso',
      data: { email: user.email, nombre: user.nombre, token }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return response(500, {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

exports.verifyToken = (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return decoded;
  } catch (error) {
    return null;
  }
};
