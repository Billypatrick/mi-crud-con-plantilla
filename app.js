document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 app.js cargado correctamente");

    // Función para guardar datos en localStorage
    function saveDataToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Guardado en localStorage: ${key}`, data);
    }

    // Función para cargar datos desde localStorage
    function loadDataFromLocalStorage(key) {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`📂 Cargando datos desde localStorage: ${key}`, data);
        return data;
    }

    // Función para renderizar la tabla
    function renderTable(key, tableBodyId) {
        const data = loadDataFromLocalStorage(key);
        const tableBody = document.querySelector(tableBodyId);
        tableBody.innerHTML = '';
        data.forEach((item, index) => {
            const newRow = document.createElement('tr');
            let rowContent = `<td>${item.nombre || item.producto || item.concepto}</td>`;
            rowContent += `<td>${item.telefono || item.cantidad || item.monto || item.cargo}</td>`;
            rowContent += `
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                </td>
            `;
            newRow.innerHTML = rowContent;
            tableBody.appendChild(newRow);
        });
    }

    // Función para editar una fila
    window.editRow = function (key, index, tableBodyId) {
        const data = loadDataFromLocalStorage(key);
        const item = data[index];
        const nombre = prompt("Editar Nombre/Producto/Concepto:", item.nombre || item.producto || item.concepto);
        const telefonoCantidadMontoCargo = prompt(
            "Editar Teléfono/Cantidad/Monto/Cargo:",
            item.telefono || item.cantidad || item.monto || item.cargo
        );
        if (nombre !== null && telefonoCantidadMontoCargo !== null) {
            if (item.nombre !== undefined) {
                item.nombre = nombre;
                item.telefono = telefonoCantidadMontoCargo;
            } else if (item.producto !== undefined) {
                item.producto = nombre;
                item.cantidad = telefonoCantidadMontoCargo;
            } else if (item.concepto !== undefined) {
                item.concepto = nombre;
                item.monto = telefonoCantidadMontoCargo;
            } else if (item.cargo !== undefined) {
                item.nombre = nombre;
                item.cargo = telefonoCantidadMontoCargo;
            }
            saveDataToLocalStorage(key, data);
            renderTable(key, tableBodyId);
        }
    };

    // Función para eliminar una fila
    window.deleteRow = function (key, index, tableBodyId) {
        const data = loadDataFromLocalStorage(key);
        data.splice(index, 1);
        saveDataToLocalStorage(key, data);
        renderTable(key, tableBodyId);
    };

    // Función para configurar formularios
    function setupForm(formId, tableBodyId, storageKey) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`❌ Formulario no encontrado: ${formId}`);
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log(`📥 Enviando datos desde el formulario: ${formId}`);

            // Capturar los valores de los campos del formulario
            const nombre = this.querySelector('input[name="nombre"]')?.value.trim() || '';
            const telefono = this.querySelector('input[name="telefono"]')?.value.trim() || '';
            const producto = this.querySelector('input[name="producto"]')?.value.trim() || '';
            const cantidad = this.querySelector('input[name="cantidad"]')?.value.trim() || '';
            const concepto = this.querySelector('input[name="concepto"]')?.value.trim() || '';
            const monto = this.querySelector('input[name="monto"]')?.value.trim() || '';
            const cargo = this.querySelector('input[name="cargo"]')?.value.trim() || '';

            // Determinar qué datos agregar según el formulario
            if (formId === 'formClientes') {
                addDataToTable(storageKey, tableBodyId, { nombre, telefono });
            } else if (formId === 'formAlmacen') {
                addDataToTable(storageKey, tableBodyId, { producto, cantidad });
            } else if (formId === 'formTrabajadores') {
                addDataToTable(storageKey, tableBodyId, { nombre, cargo });
            } else if (formId === 'formCaja') {
                addDataToTable(storageKey, tableBodyId, { concepto, monto });
            }

            // Limpiar el formulario después de agregar los datos
            this.reset();
        });
    }

    // Función para navegar entre secciones
    window.navigateTo = function (sectionId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.toggle('d-none', section.id !== sectionId);
        });
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }
    };

    // Configuración inicial de los formularios
    setupForm('formClientes', '#clientesBody', 'clientesData');
    setupForm('formAlmacen', '#almacenBody', 'almacenData');
    setupForm('formTrabajadores', '#trabajadoresBody', 'trabajadoresData');
    setupForm('formCaja', '#cajaBody', 'cajaData');

    // Renderizar las tablas al cargar la página
    renderTable('clientesData', '#clientesBody');
    renderTable('almacenData', '#almacenBody');
    renderTable('trabajadoresData', '#trabajadoresBody');
    renderTable('cajaData', '#cajaBody');
});