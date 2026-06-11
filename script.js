const URL_FLOW = "https://script.google.com/macros/s/AKfycbyZm2LqVST-WbLkrX8w5hzCIsNDVQigOyNSYegcDBsxT5DMEU2GTLZd8wTbXRPtZhFQ/exec";
navigator.geolocation

let dataGlobal = [];
let pdvData = [];

// Selectores
const dep = document.getElementById("departamento");
const prov = document.getElementById("provincia");
const dist = document.getElementById("distrito");
const pdvs = document.getElementById("pdv");

// 🔥 Cargar JSON
fetch("ubigeo.json")
  .then(response => response.json())
  .then(data => {
    dataGlobal = data;
    cargarDepartamentos();
  })
  .catch(error => {
    console.error("Error cargando ubigeo:", error);
  });
// 🔥 Cargar JSON PDV
fetch("pdv.json")
  .then(response => response.json())
  .then(data => {
    pdvData = data;
    restaurarDatos();
  })
  .catch(error => {
    console.error("Error cargando pdv:", error);
  });

// 📍 Departamentos
function cargarDepartamentos() {
  const departamentos = [...new Set(dataGlobal.map(d => d.departamento))];

  dep.innerHTML = '<option value="">Seleccione departamento</option>';

  departamentos.forEach(d => {
    dep.innerHTML += '<option value="' + d + '">' + d + '</option>';
  });
}

// 📍 Provincias
dep.addEventListener("change", function() {
  const provincias = dataGlobal
    .filter(d => d.departamento === dep.value)
    .map(d => d.provincia);

  const unicos = [...new Set(provincias)];

  prov.innerHTML = '<option value="">Seleccione provincia</option>';
  dist.innerHTML = "";

  unicos.forEach(p => {
    prov.innerHTML += '<option value="' + p + '">' + p + '</option>';
  });
  cargarPDV();
});

// 📍 Distritos
prov.addEventListener("change", function() {
  const distritos = dataGlobal
    .filter(d =>
      d.departamento === dep.value &&
      d.provincia === prov.value
    )
    .map(d => d.distrito);

  dist.innerHTML = '<option value="">Seleccione distrito</option>';

  distritos.forEach(d => {
    dist.innerHTML += '<option value="' + d + '">' + d + '</option>';
  });
});


function cargarPDV() {

  const filtrados = pdvData.filter(p =>
    p.departamento.trim().toUpperCase() === dep.value.trim().toUpperCase()
  );

  pdvs.innerHTML = '<option value="">Seleccione PDV</option>';

  filtrados.forEach(p => {
    pdvs.innerHTML += `
      <option value="${p.pdv}">
        ${p.pdv}
      </option>`;
  });

}

let linkMapa = "";

function obtenerUbicacion() {

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(posicion) {

      const lat = posicion.coords.latitude;
      const lon = posicion.coords.longitude;

      document.getElementById("coordenadas").value =
        `${lat}, ${lon}`;

      linkMapa = `https://www.google.com/maps?q=${lat},${lon}`;

    },
    function(error) {
      alert("No se pudo obtener la ubicación");
      console.error(error);
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );

}

// 📋 FORMULARIO
document.getElementById("formulario").addEventListener("submit", async function(e) {
  e.preventDefault();

  // ✅ Todos los datos para plantilla
  const data = {
    venta: document.getElementById("venta").value,
    sot: document.getElementById("sot").value,
    pdv: document.getElementById("pdv").value,
    coordinador: document.getElementById("coordinador").value,
    validacion: document.getElementById("validacion").value,
    coordenadas: document.getElementById("coordenadas").value,
    contacto: document.getElementById("contacto").value,
    autorizado: document.getElementById("autorizado").value,
    campania: document.getElementById("campania").value,
    biometrico: document.getElementById("biometrico").value,
    departamento: dep.value,
    provincia: prov.value,
    distrito: dist.value
  };

  // ✅ TU PLANTILLA COMPLETA
  const plantilla = `VENTA PAP NRO: ${data.venta}
✅VALIDACIÓN BIOMETRICA: ${data.biometrico}
✅SOT: ${data.sot}
✅PDV: ${data.pdv}
✅COORDENADOR: ${data.coordinador}
✅VALIDACION COMERCIAL: ${data.validacion}
✅COORDENADAS: ${data.coordenadas}
🗺️ MAPA: ${linkMapa}
✅Contacto: ${data.contacto}
✅AUTORIZADO: ${data.autorizado}
✅CAMPAÑA: ${data.campania}
✅ACCION: PROCEDER CON EL ENRUTAMIENTO A LA CUADRILLA DE INSTALACIONES PAP 
✅${data.departamento} – ${data.provincia} - ${data.distrito}`;

  // Mostrar plantilla
  document.getElementById("resultado").textContent = plantilla;

  try {
    // ✅ SOLO ENVÍA SOT AL GOOGLE SHEETS
    const formData = new FormData();
    formData.append("sot", data.sot);

    await fetch(URL_FLOW, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    // Guardar últimos datos usados
    localStorage.setItem("departamento", dep.value);
    localStorage.setItem("provincia", prov.value);
    localStorage.setItem("distrito", dist.value);
    localStorage.setItem("pdv", pdvs.value);
    localStorage.setItem("coordinador", document.getElementById("coordinador").value);
    alert("✅ Guardado correctamente");

  } catch (error) {
    alert("❌ Error al guardar");
    console.error(error);
  }
});

// 📋 Copiar
function copiar() {
  const texto = document.getElementById("resultado").textContent;
  navigator.clipboard.writeText(texto);
  alert("Copiado ✅");
}

function restaurarDatos() {

  const depGuardado = localStorage.getItem("departamento");
  const provGuardada = localStorage.getItem("provincia");
  const distGuardado = localStorage.getItem("distrito");
  const pdvGuardado = localStorage.getItem("pdv");
  const coordGuardado = localStorage.getItem("coordinador");

  if (!depGuardado) return;

  // Departamento
  dep.value = depGuardado;
  dep.dispatchEvent(new Event("change"));

  setTimeout(() => {

    // Provincia
    prov.value = provGuardada;
    prov.dispatchEvent(new Event("change"));

    setTimeout(() => {

      // Distrito
      dist.value = distGuardado;

      // PDV
      pdvs.value = pdvGuardado;

      // Coordinador
      document.getElementById("coordinador").value = coordGuardado;

    }, 200);

  }, 200);

}
