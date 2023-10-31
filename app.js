const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Express uygulamasını yapılandırın
app.use(bodyParser.json());

// CORS ayarlarını uygulamaya ekleyin
app.use(cors());
app.use(express.static('public'));

// API kullanıcı adı ve şifresi
const apiUsername = 'apitest';
const apiPassword = 'test123';

let authToken; // Token'ı saklamak için değişken

// Ana sayfa için HTML dosyasını sunma
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Token alma işlemi
app.post('/get-token', async (req, res) => {
  try {
    // Token alma isteği için gerekli ayarları yapın
    const tokenRequestConfig = {
      method: 'POST',
      url: 'https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/sessions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`
      },
      data: {}
    };

    // SSL sertifikası hatasını geçici olarak devre dışı bırakın (DİKKAT: Geliştirme amaçları için kullanın)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // Token alma isteğini gerçekleştirin
    const tokenResponse = await axios(tokenRequestConfig);

    // Token'ı saklayın
    authToken = tokenResponse.data.response.token;

    res.json({ token: authToken });
  } catch (error) {
    console.error('Token alma hatası:', error);
    res.status(500).json({ error: 'Token alınamadı' });
  }
});

// Veri çekme işlemi
app.post('/get-data', async (req, res) => {
  try {
    if (!authToken) {
      res.status(401).json({ error: 'Token yok. Önce token almalısınız.' });
      return;
    }

    // Veri çekme isteği için gerekli ayarları yapın
// Veri çekme isteği için gerekli ayarları yapın
const dataRequestConfig = {
  method: 'PATCH',
  url: 'https://efatura.etrsoft.com/fmi/data/v1/databases/testdb/layouts/testdb/records/1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  data: {
    fieldData: {},
    script: 'getData'
  }
};

    // Veri çekme isteğini gerçekleştirin
    const dataResponse = await axios(dataRequestConfig);

    // İstenilen veriyi işleyin
    const scriptResult = JSON.parse(dataResponse.data.response.scriptResult);
    
    // Dönen veriyi uygun hale getirip istenilen tablolama işlemini yapın
    // Burada scriptResult'ı kullanarak işlem yapabilirsiniz.

    res.json(scriptResult);
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Veri alınamadı' });
  }
});
app.listen(port, () => {
  console.log(`Uygulama ${port} portunda çalışıyor`);
});

