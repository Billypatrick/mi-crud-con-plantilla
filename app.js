document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 app.js cargado correctamente");


    document.getElementById('saveModalData').addEventListener('click', function () {
        const input1 = document.getElementById('modalInput1')?.value.trim();
        const input2 = document.getElementById('modalInput2')?.value.trim();
        const inputDNI = document.getElementById('modalInputDNI')?.value.trim();
        const inputRUC = document.getElementById('modalInputRUC')?.value.trim();
        const inputDireccion = document.getElementById('modalInputDireccion')?.value.trim();
        const inputReferencia = document.getElementById('modalInputReferencia')?.value.trim();
    
        const activeSection = document.querySelector('.content-section:not(.d-none)');
        if (!activeSection) {
            console.error("❌ No se pudo determinar la sección activa.");
            return;
        }
    
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
    
        let newData;
        if (activeTable === 'clientesData') {
            if (!inputDNI || !input1 || !input2 || !inputRUC || !inputDireccion || !inputReferencia) {
                alert("⚠️ Todos los campos son obligatorios para Clientes.");
                return;
            }
            newData = { dni: inputDNI, nombre: input1, telefono: input2, ruc: inputRUC, direccion: inputDireccion, referencia: inputReferencia };
        } else if (activeTable === 'almacenData') {
            if (!input1 || !input2) {
                alert("⚠️ Todos los campos son obligatorios para Almacén.");
                return;
            }
            newData = { producto: input1, cantidad: input2 };
        } else if (activeTable === 'trabajadoresData') {
            if (!input1 || !input2) {
                alert("⚠️ Todos los campos son obligatorios para Trabajadores.");
                return;
            }
            newData = { nombre: input1, cargo: input2 };
        } else if (activeTable === 'cajaData') {
            if (!input1 || !input2) {
                alert("⚠️ Todos los campos son obligatorios para Caja.");
                return;
            }
            newData = { concepto: input1, monto: input2 };
        }
    
        addDataToTable(activeTable, tableBodyId, newData);
    
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
            let rowContent;
    
            if (key === 'clientesData') {
                rowContent = `
                    <td>${index + 1}</td>
                    <td>${item.dni || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.telefono || ''}</td>
                    <td>${item.ruc || ''}</td>
                    <td>${item.direccion || ''}</td>
                    <td>${item.referencia || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                    </td>
                `;
            } else if (key === 'almacenData') {
                rowContent = `
                    <td>${item.producto || ''}</td>
                    <td>${item.cantidad || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                    </td>
                `;
            } else if (key === 'trabajadoresData') {
                rowContent = `
                    <td>${item.nombre || ''}</td>
                    <td>${item.cargo || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                    </td>
                `;
            } else if (key === 'cajaData') {
                rowContent = `
                    <td>${item.concepto || ''}</td>
                    <td>${item.monto || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">Eliminar</button>
                    </td>
                `;
            }
    
            newRow.innerHTML = rowContent;
            tableBody.appendChild(newRow);
        });
    
        console.log(`✅ Tabla renderizada para: ${key}`, data);
    }
    
    window.editRow = function (key, index, tableBodyId) {
        console.log(`✏️ Editando fila ${index} de: ${key}`);
        const data = loadDataFromLocalStorage(key);
        const item = data[index];
    
        const modalFieldMap = {
            'clientesData': [
                { id: 'editInputDNI', label: 'DNI', value: item.dni || '' },
                { id: 'editInputNombre', label: 'Nombre y Apellidos', value: item.nombre || '' },
                { id: 'editInputTelefono', label: 'Teléfono', value: item.telefono || '' },
                { id: 'editInputRUC', label: 'RUC', value: item.ruc || '' },
                { id: 'editInputDireccion', label: 'Dirección', value: item.direccion || '' },
                { id: 'editInputReferencia', label: 'Referencia', value: item.referencia || '' }
            ],
            'almacenData': [
                { id: 'editInputProducto', label: 'Producto', value: item.producto || '' },
                { id: 'editInputCantidad', label: 'Cantidad', value: item.cantidad || '' }
            ],
            'trabajadoresData': [
                { id: 'editInputNombre', label: 'Nombre y Apellidos', value: item.nombre || '' },
                { id: 'editInputCargo', label: 'Cargo', value: item.cargo || '' }
            ],
            'cajaData': [
                { id: 'editInputConcepto', label: 'Concepto', value: item.concepto || '' },
                { id: 'editInputMonto', label: 'Monto', value: item.monto || '' }
            ]
        };
    
        const fields = modalFieldMap[key];
        if (!fields) {
            console.error(`❌ No se encontraron campos para la tabla: ${key}`);
            return;
        }
    
        const editModalForm = document.getElementById('editDataForm');
        if (!editModalForm) {
            console.error("❌ No se encontró el formulario del modal de edición.");
            return;
        }
        editModalForm.innerHTML = '';
    
        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'mb-3';
    
            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.className = 'form-label';
            label.textContent = field.label;
    
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = field.id;
            input.value = field.value;
    
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            editModalForm.appendChild(fieldDiv);
        });
    
        document.getElementById('editRowIndex').value = index;
        document.getElementById('editTableKey').value = key;
    
        const editModal = new bootstrap.Modal(document.getElementById('editDataModal'));
        editModal.show();
    };
    
    function addDataToTable(key, tableBodyId, data) {
        console.log(`➕ Intentando agregar datos a la tabla: ${key}`, data);
    
        if (key === 'clientesData') {
            if (!data.dni?.trim() || !data.nombre?.trim() || !data.telefono?.trim() || !data.ruc?.trim() || !data.direccion?.trim() || !data.referencia?.trim()) {
                console.warn("⚠️ Todos los campos son obligatorios para Clientes.");
                return;
            }
        }
    
        const currentData = loadDataFromLocalStorage(key);
        currentData.push(data);
        saveDataToLocalStorage(key, currentData);
    
        renderTable(key, tableBodyId);
        console.log(`✅ Datos agregados y tabla renderizada para: ${key}`);
    }

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
                const data = loadDataFromLocalStorage(key);
                data.splice(index, 1);
                saveDataToLocalStorage(key, data);
                renderTable(key, tableBodyId);
                
                Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
            }
        });
    };
    

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

            this.reset();
        });
    }

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
    
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }
    
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
        container.classList.toggle('sidebar-hidden');
        if (container.classList.contains('sidebar-hidden')) {
            toggleButton.textContent = '☰';
        } else {
            toggleButton.textContent = '☰';
        }
    });


    document.getElementById('saveEditData').addEventListener('click', function () {
        const key = document.getElementById('editTableKey').value;
        const index = parseInt(document.getElementById('editRowIndex').value, 10);
    
        const modalFieldMap = {
            'clientesData': ['editInputDNI', 'editInputNombre', 'editInputTelefono', 'editInputRUC', 'editInputDireccion', 'editInputReferencia'],
            'almacenData': ['editInputProducto', 'editInputCantidad'],
            'trabajadoresData': ['editInputNombre', 'editInputCargo'],
            'cajaData': ['editInputConcepto', 'editInputMonto']
        };
    
        const fields = modalFieldMap[key];
        if (!fields) {
            console.error(`❌ No se encontraron campos para la tabla: ${key}`);
            return;
        }
    
        const updatedData = {};
        fields.forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                const fieldName = fieldId.replace('editInput', '').toLowerCase();
                updatedData[fieldName] = input.value.trim();
            }
        });
    
        const isValid = fields.every(fieldId => {
            const input = document.getElementById(fieldId);
            return input && input.value.trim() !== '';
        });
        if (!isValid) {
            alert("⚠️ Todos los campos son obligatorios.");
            return;
        }
    
        const data = loadDataFromLocalStorage(key);
        Object.assign(data[index], updatedData);
        saveDataToLocalStorage(key, data);
    
        const tableBodyId = `#${key.replace('Data', 'Body')}`;
        renderTable(key, tableBodyId);
    
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editDataModal'));
        editModal.hide();
    
        console.log(`✅ Fila ${index} actualizada en: ${key}`, data[index]);
    });
    
    function updateModalFields(sectionId) {
        const modalForm = document.getElementById('modalForm');
        if (!modalForm) {
            console.error("❌ No se encontró el formulario del modal.");
            return;
        }
    
        modalForm.innerHTML = '';
    
        const fields = modalFieldMap[sectionId];
        if (!fields) {
            console.error(`❌ No se encontraron campos para la sección: ${sectionId}`);
            return;
        }
    
        fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'mb-3';
    
            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.className = 'form-label';
            label.textContent = field.label;
    
            const input = document.createElement('input');
            input.type = field.type;
            input.className = 'form-control';
            input.id = field.id;
            if (field.required) {
                input.required = true;
            }
    
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            modalForm.appendChild(fieldDiv);
        });
    }

    document.querySelectorAll('[data-bs-target="#addDataModal"]').forEach(button => {
        button.addEventListener('click', function () {
            const activeSection = document.querySelector('.content-section:not(.d-none)');
            if (!activeSection) {
                console.error("❌ No se pudo determinar la sección activa.");
                return;
            }
    
            const sectionId = activeSection.id;
            updateModalFields(sectionId);
        });
    });

    const modalFieldMap = {
        'clientes': [
            { id: 'modalInputDNI', label: 'DNI', type: 'text', required: true },
            { id: 'modalInput1', label: 'Nombre y Apellidos', type: 'text', required: true },
            { id: 'modalInput2', label: 'Teléfono', type: 'text', required: true },
            { id: 'modalInputRUC', label: 'RUC', type: 'text', required: true },
            { id: 'modalInputDireccion', label: 'Dirección', type: 'text', required: true },
            { id: 'modalInputReferencia', label: 'Referencia', type: 'text', required: true }
        ],
        'almacen': [
            { id: 'modalInput1', label: 'Producto', type: 'text', required: true },
            { id: 'modalInput2', label: 'Cantidad', type: 'number', required: true }
        ],
        'trabajadores': [
            { id: 'modalInput1', label: 'Nombre y Apellidos', type: 'text', required: true },
            { id: 'modalInput2', label: 'Cargo', type: 'text', required: true }
        ],
        'caja': [
            { id: 'modalInput1', label: 'Concepto', type: 'text', required: true },
            { id: 'modalInput2', label: 'Monto', type: 'number', required: true }
        ]
    };
    

    setupForm('formClientes', '#clientesBody', 'clientesData');
    setupForm('formAlmacen', '#almacenBody', 'almacenData');
    setupForm('formTrabajadores', '#trabajadoresBody', 'trabajadoresData');
    setupForm('formCaja', '#cajaBody', 'cajaData');

    renderTable('clientesData', '#clientesBody');
    renderTable('almacenData', '#almacenBody');
    renderTable('trabajadoresData', '#trabajadoresBody');
    renderTable('cajaData', '#cajaBody');
});