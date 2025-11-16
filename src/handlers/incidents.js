const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('./auth');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const INCIDENTS_TABLE = process.env.INCIDENTS_TABLE;

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

const calcularNivelRiesgo = (tipo) => {
  const riesgosAltos = ['seguridad', 'infraestructura'];
  const riesgosMedios = ['equipamiento', 'limpieza'];
  
  if (riesgosAltos.includes(tipo.toLowerCase())) {
    return 'alto';
  } else if (riesgosMedios.includes(tipo.toLowerCase())) {
    return 'medio';
  }
  return 'bajo';
};

exports.create = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return response(401, {
        success: false,
        message: 'Token inválido o no proporcionado'
      });
    }

    const { titulo, descripcion, tipo, piso, lugar_especifico, foto } = JSON.parse(event.body);

    if (!titulo || !descripcion || !tipo || !piso || !lugar_especifico) {
      return response(400, {
        success: false,
        message: 'Todos los campos son requeridos: titulo, descripcion, tipo, piso, lugar_especifico'
      });
    }

    const tiposPermitidos = ['seguridad', 'infraestructura', 'limpieza', 'equipamiento', 'otro'];
    if (!tiposPermitidos.includes(tipo.toLowerCase())) {
      return response(400, {
        success: false,
        message: `Tipo inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`
      });
    }

    const incidentId = uuidv4();
    const fechaCreacion = new Date().toISOString();
    const nivelRiesgo = calcularNivelRiesgo(tipo);

    const incident = {
      id: incidentId,
      titulo,
      descripcion,
      tipo: tipo.toLowerCase(),
      piso: parseInt(piso),
      lugar_especifico,
      foto: foto || null,
      nivel_riesgo: nivelRiesgo,
      fecha_creacion: fechaCreacion,
      estado: 'pendiente',
      veces_reportado: 1,
      reportado_por: user.email,
      nombre_reportero: user.nombre
    };

    await dynamodb.put({
      TableName: INCIDENTS_TABLE,
      Item: incident
    }).promise();

    return response(201, {
      success: true,
      message: 'Incidente creado exitosamente',
      data: incident
    });

  } catch (error) {
    console.error('Error creando incidente:', error);
    return response(500, {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

exports.list = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return response(401, {
        success: false,
        message: 'Token inválido o no proporcionado'
      });
    }

    const result = await dynamodb.scan({
      TableName: INCIDENTS_TABLE
    }).promise();

    const incidents = result.Items.sort((a, b) => 
      new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
    );

    return response(200, {
      success: true,
      message: 'Incidentes obtenidos exitosamente',
      data: {
        total: incidents.length,
        incidents
      }
    });

  } catch (error) {
    console.error('Error listando incidentes:', error);
    return response(500, {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

exports.getById = async (event) => {
  try {
    const user = verifyToken(event);
    if (!user) {
      return response(401, {
        success: false,
        message: 'Token inválido o no proporcionado'
      });
    }

    const { id } = event.pathParameters;

    const result = await dynamodb.get({
      TableName: INCIDENTS_TABLE,
      Key: { id }
    }).promise();

    if (!result.Item) {
      return response(404, {
        success: false,
        message: 'Incidente no encontrado'
      });
    }

    return response(200, {
      success: true,
      message: 'Incidente obtenido exitosamente',
      data: result.Item
    });

  } catch (error) {
    console.error('Error obteniendo incidente:', error);
    return response(500, {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
