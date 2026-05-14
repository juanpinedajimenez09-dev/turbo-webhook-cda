const express = require('express');
const app = express();
app.use(express.json());

// Tarifas 2026 exactas del chatbot TURBO
// Rangos: [0-2 años, 3-7 años, 8-17 años, 17+ años]
const TARIFAS = {
  'moto 2t / 4t':                    [246900, 247200, 247500, 247200],
  'moto 2t':                         [246900, 247200, 247500, 247200],
  'moto 4t':                         [246900, 247200, 247500, 247200],
  'motocarro':                       [367500, 367800, 368100, 367800],
  'liviano particular':              [367500, 367800, 368100, 367800],
  'liviano publico':                 [368100, 368400, 368800, 368400],
  'liviano público':                 [368100, 368400, 368800, 368400],
  'electrico particular':            [275801, 276108, 276508, 276108],
  'eléctrico particular':            [275801, 276108, 276508, 276108],
  'electrico publico':               [275208, 275508, 275808, 275508],
  'eléctrico público':               [275208, 275508, 275808, 275508],
};

function calcularRango(anio) {
  const anioActual = new Date().getFullYear();
  const antiguedad = anioActual - parseInt(anio);
  if (antiguedad <= 2) return { index: 0, label: '0 a 2 años' };
  if (antiguedad <= 7) return { index: 1, label: '3 a 7 años' };
  if (antiguedad <= 17) return { index: 2, label: '8 a 17 años' };
  return { index: 3, label: 'más de 17 años' };
}

function formatPrecio(valor) {
  return '$' + valor.toLocaleString('es-CO');
}

// Endpoint principal
app.post('/calcular-tarifa', (req, res) => {
  const { tipo_vehiculo, anio_vehiculo } = req.body;

  if (!tipo_vehiculo || !anio_vehiculo) {
    return res.json({
      success: false,
      mensaje: '❌ Faltan datos. Se necesita tipo de vehículo y año.'
    });
  }

  const tipoKey = tipo_vehiculo.toLowerCase().trim();
  const tarifas = TARIFAS[tipoKey];

  if (!tarifas) {
    return res.json({
      success: false,
      mensaje: `❌ No encontré tarifas para "${tipo_vehiculo}". Verifica el tipo de vehículo.`
    });
  }

  const anio = parseInt(anio_vehiculo);
  if (isNaN(anio) || anio < 1990 || anio > new Date().getFullYear()) {
    return res.json({
      success: false,
      mensaje: '❌ Año inválido. Ingresa un año entre 1990 y el año actual.'
    });
  }

  const rango = calcularRango(anio);
  const valor = tarifas[rango.index];

  return res.json({
    success: true,
    tipo: tipo_vehiculo,
    anio: anio,
    antiguedad: rango.label,
    valor: formatPrecio(valor),
    mensaje: `✅ *Tarifa 2026 — CDA Barroblanco*\n\n🚗 Vehículo: ${tipo_vehiculo}\n📅 Año: ${anio} (${rango.label})\n💰 *Valor: ${formatPrecio(valor)}*\n\n💳 Incluye impuestos y derechos.\n\n¿Deseas agendar tu cita?`
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'TURBO Webhook activo ✅', version: '1.0' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TURBO Webhook corriendo en puerto ${PORT}`);
});
