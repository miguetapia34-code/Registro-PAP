const URL_FLOW = "https://script.google.com/macros/s/AKfycbxDKcZZ_LHQZOyvSFzB9W47brw2ggINVAywsdVSGdKo9YVR5iT4BT0sMOg18mOI763e/exec";

let dataGlobal = [];

// Selectores
const dep = document.getElementById("departamento");
const prov = document.getElementById("provincia");
const dist = document.getElementById("distrito");

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

// 📍 Cargar departamentos
function cargarDepartamentos() {
  const departamentos = [...new Set(dataGlobal.map(d => d.departamento))];

  dep.innerHTML = `<option value="">Seleccione departamento</option>`;

  departamentos.forEach(d => {
    dep.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

// 📍 Evento Departamento
dep.addEventListener("change", () => {
  const provincias = dataGlobal
    .filter(d => d.departamento === dep.value)
    .map(d => d.provincia);

  const provinciasUnicas = [...new Set(provincias)];

  prov.innerHTML = `<option value="">Seleccione provincia</option>`;
  dist.innerHTML = "";

  provinciasUnicas.forEach(p => {
    prov.innerHTML += `<option value="${p}">${p}</option>`;
  });
});

// 📍 Evento Provincia
prov.addEventListener("change", () => {
  const distritos = dataGlobal
    .filter(d =>
      d.departamento === dep.value &&
      d.provincia === prov.value
    )
    .map(d => d.distrito);

  dist.innerHTML = `<option value="">Seleccione distrito</option>`;

  distritos.forEach(d => {
    dist.innerHTML += `<option value="${d}">${d}</option>`;
  });
});

// 📋 FORMULARIO
document.getElementById("formulario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    venta: document.getElementById("venta").value,
    sot: document.getElementById("sot").value,
    pdv: document.getElementById("pdv").value,
    coordinador: document.getElementById("coordinador").value,
    contacto: document.getElementById("contacto").value,
    departamento: dep.value,
    provincia: prov.value,
    distrito: dist.value
  };

  const plantilla = `VENTA PAP NRO: ${data.venta}
✅VALIDACIÓN BIOMETRICA: OK
✅SOT: ${data.sot}
✅PDV: ${data.pdv}
✅COORDENADOR: ${data.coordinador}
✅VALIDACION COMERCIAL: FILTRO DEUDA CLIENTE
✅COORDENADAS: 
✅Contacto: ${data.contacto}
✅AUTORIZADO: 
✅CAMPAÑA: PAP
✅ACCION: PROCEDER CON EL ENRUTAMIENTO A LA CUADRILLA DE INSTALACIONES PAP 
✅${data.departamento} – ${data.provincia} - ${data.distrito}`;

  document.getElementById("resultado").textContent = plantilla;

  try {
    await fetch(URL_FLOW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

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