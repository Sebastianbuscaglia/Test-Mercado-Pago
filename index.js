const { app, BrowserWindow } = require('electron'); // Aplicación Electron
const mercadopago = require('mercadopago');
const express = require('express');
const expressApp = express(); // Aplicación Express
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Para hacer solicitudes HTTP

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false  
    }
  });

  win.loadFile('index.html');
}

// Configura tus credenciales de acceso
const mp = new mercadopago.MercadoPagoConfig({
  access_token: 'APP_USR-1069336669952081-052209-9fa64ea807043c53cedad2a04a9c600b-219117670'
});

// Configurar middleware y rutas
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(express.json());
expressApp.use(express.static(path.join(__dirname, "../client")));
expressApp.use(cors());

// Ruta para crear una preferencia de pago
expressApp.post('/create_preference', async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: req.body.title,
          unit_price: parseFloat(req.body.price),
          quantity: 1,
        }
      ],
      // Asegúrate de agregar cualquier configuración adicional necesaria
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Ruta para obtener los dispositivos Point
expressApp.get('/pos_devices', async (req, res) => {
  try {
    const response = await axios.get('https://api.mercadopago.com/pos', {
      headers: {
        'Authorization': `Bearer APP_USR-1069336669952081-052209-9fa64ea807043c53cedad2a04a9c600b-219117670`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Iniciar el servidor Express
const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
