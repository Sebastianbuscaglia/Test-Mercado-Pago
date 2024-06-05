const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

// Requerir MercadoPagoConfig y Preference
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configura tus credenciales de acceso
const mp = new MercadoPagoConfig({
  access_token: 'APP_USR-1069336669952081-052209-9fa64ea807043c53cedad2a04a9c600b-219117670'
});

// Inicializar Express
const expressApp = express();

// Configurar middleware y rutas
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(express.json());
expressApp.use(express.static(path.join(__dirname, "../client")));
expressApp.use(cors());

// Ruta para crear una preferencia de pago
expressApp.post('/create_preference', async (req, res) => {
  try {
    console.log('Creating preference with:', req.body);

    const preference = new Preference({
      items: [
        {
          title: req.body.title,
          unit_price: parseFloat(req.body.price),
          quantity: 1,
        }
      ],
    });

    const response = await mp.createPreference(preference);
    console.log('Preference created:', response);
    res.json({
      id: response.id,
      init_point: response.init_point
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).send(error.message);
  }
});

// Ruta para obtener los dispositivos Point
expressApp.get('/pos_devices', async (req, res) => {
  try {
    const response = await mp.pos.get();
    res.json(response.response);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Ruta para obtener dispositivos usando el endpoint de integración con axios
expressApp.get('/devices', async (req, res) => {
  try {
    const response = await axios.get('https://api.mercadopago.com/point/integration-api/devices', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer APP_USR-1069336669952081-052209-9fa64ea807043c53cedad2a04a9c600b-219117670`
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ruta para realizar un pago con un dispositivo Point
expressApp.post('/devices/:deviceid/payment-intents', async (req, res) => {
  const { deviceid } = req.params;
  const { amount, external_reference, print_on_terminal, ticket_number } = req.body;

  try {
    const response = await axios.post(`https://api.mercadopago.com/point/integration-api/devices/${deviceid}/payment-intents`, {
      amount,
      additional_info: {
        external_reference,
        print_on_terminal,
        ticket_number
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer APP_USR-1069336669952081-052209-9fa64ea807043c53cedad2a04a9c600b-219117670`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send(error.message);
  }
});

// Iniciar el servidor Express
const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});


// "devices": [
//   {
//       "id": "PAX_A910__SMARTPOS1491307350",
//       "pos_id": 101159411,
//       "store_id": "61421177",
//       "external_pos_id": "",
//       "operating_mode": "STANDALONE"
//   }
// ],