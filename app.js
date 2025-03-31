document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 app.js cargado correctamente");


    document.getElementById('saveModalData').addEventListener('click', function () {
        const input1 = document.getElementById('modalInput1').value.trim();
        const input2 = document.getElementById('modalInput2').value.trim();
    
        if (!input1 || !input2) {
            alert("⚠️ Ambos campos son obligatorios.");
            return;
        }

        // Mapeo de etiquetas dinámicas para cada tabla
    const labelMap = {
        'clientes': { label1: 'Nombre y Apellidos', label2: 'Teléfono' },
        'almacen': { label1: 'Producto', label2: 'Cantidad' },
        'trabajadores': { label1: 'Nombre y Apellidos', label2: 'Cargo' },
        'caja': { label1: 'Concepto', label2: 'Monto' }
    };

    // Actualizar las etiquetas del modal dinámicamente
    document.querySelectorAll('[data-bs-target="#addDataModal"]').forEach(button => {
        button.addEventListener('click', function () {
            // Detectar la sección activa usando el atributo data-section del botón
            const activeSection = this.closest('.content-section').id;

            // Obtener las etiquetas correspondientes
            const { label1, label2 } = labelMap[activeSection] || {};

            // Actualizar las etiquetas del modal
            document.querySelector('label[for="modalInput1"]').textContent = label1 || 'Campo 1';
            document.querySelector('label[for="modalInput2"]').textContent = label2 || 'Campo 2';

            // Limpiar los campos del modal
            document.getElementById('modalInput1').value = '';
            document.getElementById('modalInput2').value = '';
        });
    });
    
        // Detectar la sección activa dinámicamente
        const activeSection = document.querySelector('.content-section:not(.d-none)');
        if (!activeSection) {
            console.error("❌ No se pudo determinar la sección activa.");
            return;
        }
    
        // Mapear las secciones a las claves de almacenamiento y cuerpos de tabla
        const sectionMap = {
            'clientes': { key: 'clientesData', tableBodyId: '#clientesBody' },
            'almacen': { key: 'almacenData', tableBodyId: '#almacenBody' },
            'trabajadores': { key: 'trabajadoresData', tableBodyId: '#trabajadoresBody' },
            'caja': { key: 'cajaData', tableBodyId: '#cajaBody' }
        };
    
        const sectionId = activeSection.id;
        const { key: activeTable, tableBodyId } = sectionMap[sectionId] || {};
    
        if (!activeTable || !tableBodyId) {
            console.error(`❌ No se encontró configuración para la sección: ${sectionId}`);
            return;
        }
    
        const newData = { nombre: input1, telefono: input2 }; // Ajusta según la tabla
    
        // Agregar datos a la tabla
        addDataToTable(activeTable, tableBodyId, newData);
    
        // Renderizar la tabla inmediatamente después de agregar los datos
        renderTable(activeTable, tableBodyId);
    
        // Cerrar el modal después de agregar
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDataModal'));
        modal.hide();
    
        // Limpiar los campos del modal
        document.getElementById('modalForm').reset();
    });


    // Función para guardar datos en localStorage
    function saveDataToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`✅ Guardado en localStorage: ${key}`, data);
        } catch (error) {
            console.error("❌ Error al guardar en localStorage:", error);
        }
    }

    // Función para cargar datos desde localStorage
    function loadDataFromLocalStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key)) || [];
            console.log(`📂 Cargando datos desde localStorage: ${key}`, data);
            return data;
        } catch (error) {
            console.error("❌ Error al cargar datos desde localStorage:", error);
            return [];
        }
    }

    // Función para renderizar la tabla
    function renderTable(key, tableBodyId) {
        console.log(`🔄 Intentando renderizar tabla para: ${key}`);
        const data = loadDataFromLocalStorage(key);
        const tableBody = document.querySelector(tableBodyId);
        if (!tableBody) {
            console.error(`❌ No se encontró el tbody para: ${tableBodyId}`);
            return;
        }
        tableBody.innerHTML = '';
    
        data.forEach((item, index) => {
            const newRow = document.createElement('tr');
            let rowContent = `
                <td>${item.nombre || item.producto || item.concepto}</td>
                <td>${item.telefono || item.cantidad || item.monto || item.cargo}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                </td>
            `;
            newRow.innerHTML = rowContent;
            tableBody.appendChild(newRow);
        });
    
        console.log(`✅ Tabla renderizada para: ${key}`, data);
    }
    
    window.editRow = function (key, index, tableBodyId) {
        console.log(`✏️ Editando fila ${index} de: ${key}`);
        const data = loadDataFromLocalStorage(key);
        const item = data[index];
    
        // Mapeo de etiquetas dinámicas
        const labelMap = {
            'clientesData': { label1: 'Nombre y Apellidos', label2: 'Teléfono' },
            'almacenData': { label1: 'Producto', label2: 'Cantidad' },
            'trabajadoresData': { label1: 'Nombre y Apellidos', label2: 'Cargo' },
            'cajaData': { label1: 'Concepto', label2: 'Monto' }
        };
    
        // Obtener las etiquetas correspondientes
        const { label1, label2 } = labelMap[key] || { label1: 'Campo 1', label2: 'Campo 2' };
    
        // Actualizar las etiquetas del modal
        document.querySelector('label[for="editInput1"]').textContent = label1;
        document.querySelector('label[for="editInput2"]').textContent = label2;
    
        // Rellenar los campos del modal con los datos existentes
        document.getElementById('editInput1').value = item.nombre || item.producto || item.concepto || '';
        document.getElementById('editInput2').value = item.telefono || item.cantidad || item.monto || item.cargo || '';
        document.getElementById('editRowIndex').value = index;
        document.getElementById('editTableKey').value = key;
    
        // Mostrar el modal
        const editModal = new bootstrap.Modal(document.getElementById('editDataModal'));
        editModal.show();
    };
    // Función para agregar datos a la tabla y localStorage
    function addDataToTable(key, tableBodyId, data) {
        console.log(`➕ Intentando agregar datos a la tabla: ${key}`, data);
        if (!data.nombre?.trim() && !data.producto?.trim() && !data.concepto?.trim()) {
            console.warn("⚠️ No se pueden agregar datos vacíos");
            return;
        }
        const currentData = loadDataFromLocalStorage(key);
        currentData.push(data);
        saveDataToLocalStorage(key, currentData);
    
        // Renderizar la tabla después de guardar los datos
        renderTable(key, tableBodyId);
        console.log(`✅ Datos agregados y tabla renderizada para: ${key}`);
    }

    // Función para eliminar una fila
    window.deleteRow = function (key, index, tableBodyId) {
        console.log(`🗑️ Intentando eliminar fila ${index} de: ${key}`);
    
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminarlo",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                // Si el usuario confirma, eliminar la fila
                const data = loadDataFromLocalStorage(key);
                data.splice(index, 1);
                saveDataToLocalStorage(key, data);
                renderTable(key, tableBodyId);
                
                Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
            }
        });
    };
    

    // Configuración de formularios
    function setupForm(formId, tableBodyId, storageKey) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`❌ Formulario no encontrado: ${formId}`);
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const nombre = this.querySelector('input[name="nombre"]')?.value.trim() || '';
            const telefono = this.querySelector('input[name="telefono"]')?.value.trim() || '';
            const producto = this.querySelector('input[name="producto"]')?.value.trim() || '';
            const cantidad = this.querySelector('input[name="cantidad"]')?.value.trim() || '';
            const concepto = this.querySelector('input[name="concepto"]')?.value.trim() || '';
            const monto = this.querySelector('input[name="monto"]')?.value.trim() || '';
            const cargo = this.querySelector('input[name="cargo"]')?.value.trim() || '';

            console.log("📥 Capturando datos del formulario:", { nombre, telefono, producto, cantidad, concepto, monto, cargo });

            if (formId === 'formClientes') {
                addDataToTable(storageKey, tableBodyId, { nombre, telefono });
            } else if (formId === 'formAlmacen') {
                addDataToTable(storageKey, tableBodyId, { producto, cantidad });
            } else if (formId === 'formTrabajadores') {
                addDataToTable(storageKey, tableBodyId, { nombre, cargo });
            } else if (formId === 'formCaja') {
                addDataToTable(storageKey, tableBodyId, { concepto, monto });
            }

            this.reset(); // Limpia el formulario después de agregar
        });
    }

    // Función para navegar entre secciones
    window.navigateTo = function (sectionId) {
        console.log(`🔄 Navegando a la sección: ${sectionId}`);
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('d-none');
            } else {
                section.classList.add('d-none');
            }
        });
    
        // Cambiar el título de la sección
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }
    
        // Resaltar el botón activo
        const buttons = document.querySelectorAll('.sidebar button');
        buttons.forEach(button => button.classList.remove('btn-active'));
        document.querySelector(`button[onclick="navigateTo('${sectionId}')"]`).classList.add('btn-active');
    };

   
    const toggleButton = document.getElementById('toggleSidebar');
    const container = document.querySelector('.container-fluid');

    if (!toggleButton) {
        console.error("❌ No se encontró el botón con id 'toggleSidebar'");
    }
    if (!container) {
        console.error("❌ No se encontró el contenedor con clase 'container-fluid'");
    }

    toggleButton.addEventListener('click', function () {
        console.log("✅ Botón clickeado");
        container.classList.toggle('sidebar-hidden'); // Alterna la clase
        if (container.classList.contains('sidebar-hidden')) {
            toggleButton.textContent = '☰'; // Cambia el texto del botón
        } else {
            toggleButton.textContent = '☰'; // Cambia el texto del botón
        }
    });


    document.getElementById('saveEditData').addEventListener('click', function () {
        const key = document.getElementById('editTableKey').value;
        const index = parseInt(document.getElementById('editRowIndex').value, 10);
        const input1 = document.getElementById('editInput1').value.trim();
        const input2 = document.getElementById('editInput2').value.trim();
    
        if (!input1 || !input2) {
            alert("⚠️ Ambos campos son obligatorios.");
            return;
        }
    
        const data = loadDataFromLocalStorage(key);
        const item = data[index];
    
        // Actualizar los valores en el objeto
        if (item.nombre !== undefined) {
            item.nombre = input1;
            item.telefono = input2;
        } else if (item.producto !== undefined) {
            item.producto = input1;
            item.cantidad = input2;
        } else if (item.concepto !== undefined) {
            item.concepto = input1;
            item.monto = input2;
        } else if (item.cargo !== undefined) {
            item.nombre = input1;
            item.cargo = input2;
        }
    
        // Guardar los datos actualizados en localStorage
        saveDataToLocalStorage(key, data);
    
        // Obtener el tableBodyId correspondiente al key
        const sectionMap = {
            'clientesData': '#clientesBody',
            'almacenData': '#almacenBody',
            'trabajadoresData': '#trabajadoresBody',
            'cajaData': '#cajaBody'
        };
        const tableBodyId = sectionMap[key];
    
        // Volver a renderizar la tabla
        renderTable(key, tableBodyId);
    
        // Cerrar el modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editDataModal'));
        editModal.hide();
    
        console.log(`✅ Fila ${index} actualizada en: ${key}`, item);
    });
    


    // Configuración inicial
    setupForm('formClientes', '#clientesBody', 'clientesData');
    setupForm('formAlmacen', '#almacenBody', 'almacenData');
    setupForm('formTrabajadores', '#trabajadoresBody', 'trabajadoresData');
    setupForm('formCaja', '#cajaBody', 'cajaData');

    // Renderizar tablas al cargar la página
    renderTable('clientesData', '#clientesBody');
    renderTable('almacenData', '#almacenBody');
    renderTable('trabajadoresData', '#trabajadoresBody');
    renderTable('cajaData', '#cajaBody');
});