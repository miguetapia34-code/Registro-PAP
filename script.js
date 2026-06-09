const URL_FLOW = "https://script.google.com/macros/s/AKfycbwAyeIvfKHvyqukzpeGPaU5mebPIEDssH_qlUgFpLTanS1gIeaj0jLuIOlcDM1Qt2uN/exec";

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

  dep.innerHTML = '<option value="">Seleccione departamento</option>';

  departamentos.forEach(d => {
    dep.innerHTML += '<option value="' + d + '">' + d + '</option>';
  });
}

// 📍 Evento Departamento
dep.addEventListener("change", function() {
  const provincias = dataGlobal
    .filter(d => d.departamento === dep.value)
    .map(d => d.provincia);

  const provinciasUnicas = [...new Set(provincias)];

  prov.innerHTML = '<option value="">Seleccione provincia</option>';
  dist.innerHTML = "";

  provinciasUnicas.forEach(p => {
    prov.innerHTML += '<option value="' + p + '">' + p + '</option>';
  });
});

// 📍 Evento Provincia
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

// 📋 FORMULARIO
document.getElementById("formulario").addEventListener("submit", async function(e) {
  e.preventDefault();

  // ✅ SOLO ENVIAMOS SOT
  const data = {
    sot: document.getElementById("sot").value
  };

  document.getElementById("resultado").textContent =
    "✅ SOT registrado: " + data.sot;

  try {

    // ✅ FORMATO CORRECTO PARA GOOGLE SCRIPT
    const formData = new FormData();
    formData.append("sot", data.sot);

    await fetch(URL_FLOW, {
      method: "POST",
      mode: "no-cors",
      body: formData
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
