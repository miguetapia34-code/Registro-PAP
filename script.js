const URL_FLOW = "https://script.google.com/macros/s/AKfycbwsyTjn1GJzlPAbiWaFK4jnelPfKepqKPBuFOO904KAPXzsXr-jTLKfn2wtEHb6VIS7/exec";

let dataGlobal = [];

// Selectores
const dep = document.getElementById("departamento");
const prov = document.getElementById("provincia");
const dist = document.getElementById("distrito");

// 🔥 Cargar JSON
fetch("ubigeo.json")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    dataGlobal = data;
    cargarDepartamentos();
  })
  .catch(function(error) {
    console.error("Error cargando ubigeo:", error);
  });

// 📍 Cargar departamentos
function cargarDepartamentos() {
  const departamentos = [...new Set(dataGlobal.map(function(d) {
    return d.departamento;
  }))];

  dep.innerHTML = '<option value="">Seleccione departamento</option>';

  departamentos.forEach(function(d) {
    dep.innerHTML += '<option value="' + d + '">' + d + '</option>';
  });
}

// 📍 Evento Departamento
dep.addEventListener("change", function() {
  const provincias = dataGlobal
    .filter(function(d) {
      return d.departamento === dep.value;
    })
    .map(function(d) {
      return d.provincia;
    });

  const provinciasUnicas = [...new Set(provincias)];

  prov.innerHTML = '<option value="">Seleccione provincia</option>';
  dist.innerHTML = "";

  provinciasUnicas.forEach(function(p) {
    prov.innerHTML += '<option value="' + p + '">' + p + '</option>';
  });
});

// 📍 Evento Provincia
prov.addEventListener("change", function() {
  const distritos = dataGlobal
    .filter(function(d) {
      return d.departamento === dep.value &&
             d.provincia === prov.value;
    })
    .map(function(d) {
      return d.distrito;
    });

  dist.innerHTML = '<option value="">Seleccione distrito</option>';

  distritos.forEach(function(d) {
    dist.innerHTML += '<option value="' + d + '">' + d + '</option>';
  });
});

// 📋 FORMULARIO
document.getElementById("formulario").addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    sot: document.getElementById("sot").value
  };

  document.getElementById("resultado").textContent =
    "✅ SOT registrado: " + data.sot;

  try {
    const res = await fetch(URL_FLOW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    console.log("Respuesta:", res);
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
