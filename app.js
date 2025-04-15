document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 app.js cargado correctamente");


    document.getElementById('saveEditData').addEventListener('click', function () {
        const key = document.getElementById('editTableKey').value;
        const index = parseInt(document.getElementById('editRowIndex').value, 10);
        const data = loadDataFromLocalStorage(key);
        
        // Mapeo de campos por sección
        const fieldMap = {
            'clientesData': [
                { field: 'dni', id: 'editInputDNI' },
                { field: 'nombre', id: 'editInputNombre' },
                { field: 'telefono', id: 'editInputTelefono' },
                { field: 'ruc', id: 'editInputRUC' },
                { field: 'direccion', id: 'editInputDireccion' },
                { field: 'referencia', id: 'editInputReferencia' }
            ],
            'almacenData': [
                { field: 'producto', id: 'editInputProducto' },
                { field: 'descripcion', id: 'editInputDescripcion' },
                { field: 'precio', id: 'editInputPrecio', isNumber: true, decimals: 2 },
                { field: 'entrada', id: 'editInputEntrada', isNumber: true },
                { field: 'salida', id: 'editInputSalida', isNumber: true }
            ],
            'trabajadoresData': [
                { field: 'nombre', id: 'editInputNombre' },
                { field: 'cargo', id: 'editInputCargo' },
                { field: 'area', id: 'editInputArea' },
                { field: 'sexo', id: 'editInputSexo' },
                { field: 'edad', id: 'editInputEdad', isNumber: true }
            ],
            'cajaData': [
                { field: 'descripcion', id: 'editInputDescripcion' },
                { field: 'montoApertura', id: 'editInputMontoApertura', isNumber: true, decimals: 2 },
                { field: 'montoDisponible', id: 'editInputMontoDisponible', isNumber: true, decimals: 2 },
                { field: 'montoCierre', id: 'editInputMontoCierre', isNumber: true, decimals: 2 },
                { field: 'estado', id: 'editInputEstado' }
            ]
        };
    
        // Validaciones específicas para almacén
        if (key === 'almacenData') {
            const entrada = parseInt(document.getElementById('editInputEntrada').value) || 0;
            const salida = parseInt(document.getElementById('editInputSalida').value) || 0;
            const stockActual = parseInt(data[index].stock) || 0;
            
            if (salida > stockActual + entrada) {
                Swal.fire('Error', 'La salida no puede ser mayor al stock disponible', 'error');
                return;
            }
        }
    
        // Actualizar los datos
        fieldMap[key].forEach(fieldConfig => {
            const input = document.getElementById(fieldConfig.id);
            if (input) {
                if (fieldConfig.isNumber) {
                    const value = parseFloat(input.value) || 0;
                    data[index][fieldConfig.field] = fieldConfig.decimals ? 
                        value.toFixed(fieldConfig.decimals) : 
                        value;
                } else {
                    data[index][fieldConfig.field] = input.value.trim();
                }
            }
        });
    
        // Cálculos adicionales para almacén
        if (key === 'almacenData') {
            const entrada = parseInt(document.getElementById('editInputEntrada').value) || 0;
            const salida = parseInt(document.getElementById('editInputSalida').value) || 0;
            data[index].stock = (parseInt(data[index].stock) + entrada - salida).toString();
        }
    
        // Guardar cambios
        saveDataToLocalStorage(key, data);
        renderTable(key, `#${key.replace('Data', 'Body')}`);
        
        // Cerrar modal y mostrar confirmación
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editDataModal'));
        editModal.hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Los cambios se guardaron correctamente',
            timer: 1500,
            showConfirmButton: false
        });
    });


    function createModalInput(field) {
        let input;
        
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-control';
            input.id = field.id;
            input.value = field.value || '';
            input.rows = 3;
        } 
        else if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            input.id = field.id;
            
            // Agregar opción vacía si no es requerido
            if (!field.required) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- Seleccione --';
                input.appendChild(emptyOption);
            }
            
            // Agregar opciones
            field.options.forEach(option => {
                const optElement = document.createElement('option');
                optElement.value = option;
                optElement.textContent = option;
                input.appendChild(optElement);
            });
            
            if (field.value) input.value = field.value;
        }
        else {
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.className = 'form-control';
            input.id = field.id;
            input.value = field.value || '';
        }
        
        if (field.required) {
            input.required = true;
        }
        
        if (field.validation) {
            field.validation(input);
        }
        
        return input;
    }

    // Migración para códigos únicos (solo se ejecutará una vez)
    const hasMigratedCodes = localStorage.getItem('migration_codes_v1');
    if (!hasMigratedCodes) {
        const cajaData = JSON.parse(localStorage.getItem('cajaData')) || [];
        const existingCodes = [];
        
        const migratedData = cajaData.map(item => {
            if (!item.codigo || item.codigo.startsWith('CO')) {
                return {
                    ...item,
                    codigo: generarCodigoUnico(existingCodes)
                };
            }
            existingCodes.push(item.codigo);
            return item;
        });
        
        localStorage.setItem('cajaData', JSON.stringify(migratedData));
        localStorage.setItem('migration_codes_v1', 'true');
        console.log('✅ Migración de códigos completada');
    }

    // Migración para números de trabajador únicos
    const hasMigratedTrabajadores = localStorage.getItem('migration_trabajadores_v1');
    if (!hasMigratedTrabajadores) {
        const trabajadoresData = JSON.parse(localStorage.getItem('trabajadoresData')) || [];
        const existingNumbers = [];
        
        const migratedData = trabajadoresData.map(item => {
            if (!item.numeroTrabajador || !item.numeroTrabajador.startsWith('TR')) {
                return {
                    ...item,
                    numeroTrabajador: generarNumeroTrabajadorUnico(existingNumbers)
                };
            }
            existingNumbers.push(item.numeroTrabajador);
            return item;
        });
        
        localStorage.setItem('trabajadoresData', JSON.stringify(migratedData));
        localStorage.setItem('migration_trabajadores_v1', 'true');
        console.log('✅ Migración de números de trabajador completada');
    }
    
        // --- MIGRACIÓN DE DATOS (COLOCAR JUSTO AQUÍ) ---
        const hasMigrated = localStorage.getItem('migration_v1');
        if (!hasMigrated) {
            const cajaData = JSON.parse(localStorage.getItem('cajaData')) || [];
            
            const migratedData = cajaData.map(item => {
                if ('monto' in item && !('montoApertura' in item)) {
                    return {
                        ...item,
                        montoApertura: item.monto,
                        monto: undefined // Opcional: elimina el campo antiguo
                    };
                }
                return item;
            });
            
            localStorage.setItem('cajaData', JSON.stringify(migratedData));
            localStorage.setItem('migration_v1', 'true');
            console.log('✅ Migración de datos completada');
        }


        // Migración de datos existentes para agregar montoDisponible
        const hasMigratedCaja = localStorage.getItem('migration_caja_v2');
        if (!hasMigratedCaja) {
            const cajaData = JSON.parse(localStorage.getItem('cajaData')) || [];
            
            const migratedData = cajaData.map(item => {
                // Si no existe montoDisponible, lo inicializamos con el montoApertura
                if (!('montoDisponible' in item)) {
                    return {
                        ...item,
                        montoDisponible: item.montoApertura || '0.00'
                    };
                }
                return item;
            });
            
            localStorage.setItem('cajaData', JSON.stringify(migratedData));
            localStorage.setItem('migration_caja_v2', 'true');
            console.log('✅ Migración de datos de caja completada (v2)');
        }
        

        // Migración de datos existentes para agregar montoCierre
const hasMigratedCajaV3 = localStorage.getItem('migration_caja_v3');
if (!hasMigratedCajaV3) {
    const cajaData = JSON.parse(localStorage.getItem('cajaData')) || [];
    
    const migratedData = cajaData.map(item => {
        if (!('montoCierre' in item)) {
            return {
                ...item,
                montoCierre: item.estado === 'Cerrado' ? 
    (item.montoCierre || item.montoDisponible || item.montoApertura || '0.00') : 
    '0.00'
            };
        }
        return item;
    });
    
    localStorage.setItem('cajaData', JSON.stringify(migratedData));
    localStorage.setItem('migration_caja_v3', 'true');
    console.log('✅ Migración de datos de caja completada (v3) - Monto Cierre añadido');
}


window.cerrarCaja = function(index) {
    const cajaData = loadDataFromLocalStorage('cajaData');
    const registro = cajaData[index];
    
    if (!registro) {
        console.error('Registro de caja no encontrado');
        return;
    }

    if (registro.estado === 'Cerrado') {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Esta caja ya está cerrada',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    Swal.fire({
        title: 'Cerrar Caja',
        html: `
            <p>Monto Disponible: S/ ${registro.montoDisponible || registro.montoApertura}</p>
            <input id="swalMontoCierre" type="number" class="swal2-input" 
                   placeholder="Monto Cierre" value="${registro.montoDisponible || registro.montoApertura}" 
                   step="0.01" min="0" required>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Cierre',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: () => {
            const input = document.getElementById('swalMontoCierre');
            const montoCierre = parseFloat(input.value);
            
            if (isNaN(montoCierre)) {
                Swal.showValidationMessage('Ingrese un monto válido');
                return false;
            }
            if (montoCierre < 0) {
                Swal.showValidationMessage('El monto no puede ser negativo');
                return false;
            }
            if (montoCierre > parseFloat(registro.montoDisponible || registro.montoApertura)) {
                Swal.showValidationMessage('El monto de cierre no puede ser mayor al disponible');
                return false;
            }
            
            return montoCierre.toFixed(2);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Actualizar los datos
            registro.montoCierre = result.value;
            registro.estado = 'Cerrado';
            registro.montoDisponible = result.value;
            
            // Guardar cambios
            saveDataToLocalStorage('cajaData', cajaData);
            
            // Actualizar la tabla
            renderTable('cajaData', '#cajaBody');
            
            // Mostrar confirmación
            Swal.fire({
                icon: 'success',
                title: '¡Caja Cerrada!',
                text: `Monto de cierre: S/ ${registro.montoCierre}`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
};

window.verDetalleCaja = function(index) {
    const cajaData = loadDataFromLocalStorage('cajaData');
    const registro = cajaData[index];
    
    if (!registro) {
        console.error('Registro de caja no encontrado');
        return;
    }

    Swal.fire({
        title: `Detalles de Caja: ${registro.codigo || ''}`,
        html: `
            <div class="text-start">
                <p><strong>Fecha:</strong> ${registro.fecha || ''}</p>
                <p><strong>Descripción:</strong> ${registro.descripcion || ''}</p>
                <p><strong>Estado:</strong> <span class="badge ${registro.estado === 'Cerrado' ? 'bg-danger' : 'bg-success'}">${registro.estado || 'Abierto'}</span></p>
                <p><strong>Monto Apertura:</strong> S/ ${registro.montoApertura || '0.00'}</p>
                <p><strong>Monto Disponible:</strong> S/ ${registro.montoDisponible || '0.00'}</p>
                ${registro.estado === 'Cerrado' ? `<p><strong>Monto Cierre:</strong> S/ ${registro.montoCierre || '0.00'}</p>` : ''}
            </div>
        `,
        confirmButtonText: 'Cerrar',
        width: '600px'
    });
};


    document.getElementById('saveModalData').addEventListener('click', function () {
        // Obtener la sección activa
        const activeSection = document.querySelector('.content-section:not(.d-none)');
        if (!activeSection) {
            console.error("❌ No se pudo determinar la sección activa.");
            return;
        }
    
        const sectionId = activeSection.id;
    
        // Configuración específica para cada tabla
        const sectionMap = {
            'clientes': {
                key: 'clientesData',
                tableBodyId: '#clientesBody',
                validate: function () {
                    const inputDNI = document.getElementById('modalInputDNI')?.value.trim();
                    const inputNombre = document.getElementById('modalInput1')?.value.trim();
                    const inputTelefono = document.getElementById('modalInput2')?.value.trim();
                    const inputRUC = document.getElementById('modalInputRUC')?.value.trim();
                    const inputDireccion = document.getElementById('modalInputDireccion')?.value.trim();
                    const inputReferencia = document.getElementById('modalInputReferencia')?.value.trim();

                    if (!inputDNI || !inputNombre || !inputTelefono || !inputDireccion || !inputReferencia) {
                        alert("⚠️ Todos los campos obligatorios deben ser completados.");
                        return false;
                    }

                    return {
                        dni: inputDNI,
                        nombre: inputNombre,
                        telefono: inputTelefono,
                        ruc: inputRUC, // Puede estar vacío
                        direccion: inputDireccion,
                        referencia: inputReferencia
                    };
                }
            },
            'almacen': {
                key: 'almacenData',
                tableBodyId: '#almacenBody',
                validate: function () {
                    const inputProducto = document.getElementById('modalInputProducto')?.value.trim();
                    const inputDescripcion = document.getElementById('modalInputDescripcion')?.value.trim();
                    const inputStock = parseInt(document.getElementById('modalInputStock')?.value || 0);
                    const inputPrecio = parseFloat(document.getElementById('modalInputPrecio')?.value || 0);
                    const inputEntrada = parseInt(document.getElementById('modalInputEntrada')?.value || 0);
                    const inputSalida = parseInt(document.getElementById('modalInputSalida')?.value || 0);

                    if (!inputProducto || isNaN(inputStock) || isNaN(inputPrecio) || isNaN(inputEntrada) || isNaN(inputSalida)) {
                        Swal.fire('Error', 'Todos los campos obligatorios deben ser completados correctamente', 'error');
                        return false;
                    }

                    // Calcular stock final
                    const stockFinal = inputStock + inputEntrada - inputSalida;
                    
                    if (stockFinal < 0) {
                        Swal.fire('Error', 'La salida no puede ser mayor que el stock disponible', 'error');
                        return false;
                    }

                    return {
                        producto: inputProducto,
                        descripcion: inputDescripcion,
                        stock: stockFinal,
                        precio: inputPrecio.toFixed(2),
                        entrada: inputEntrada,
                        salida: inputSalida
                    };
                }
            },
            'trabajadores': {
                key: 'trabajadoresData',
                tableBodyId: '#trabajadoresBody',
                validate: function() {
                    const inputNombre = document.getElementById('modalInputNombre')?.value.trim();
                    const inputCargo = document.getElementById('modalInputCargo')?.value.trim();
                    const inputArea = document.getElementById('modalInputArea')?.value;
                    const inputSexo = document.getElementById('modalInputSexo')?.value;
                    const inputEdad = parseInt(document.getElementById('modalInputEdad')?.value);

                    if (!inputNombre || !inputCargo || isNaN(inputEdad)) {
                        Swal.fire('Error', 'Nombre, Cargo y Edad son campos obligatorios', 'error');
                        return false;
                    }

                    if (inputEdad < 18 || inputEdad > 100) {
                        Swal.fire('Error', 'La edad debe estar entre 18 y 100 años', 'error');
                        return false;
                    }

                    // Obtener números existentes
                    const existingData = loadDataFromLocalStorage('trabajadoresData') || [];
                    const existingNumbers = existingData.map(item => item.numeroTrabajador);

                    return {
                        nombre: inputNombre,
                        cargo: inputCargo,
                        area: inputArea || '',
                        sexo: inputSexo || '',
                        edad: inputEdad,
                        numeroTrabajador: generarNumeroTrabajadorUnico(existingNumbers)
                    };
                }
            },
            'caja': {
                key: 'cajaData',
                tableBodyId: '#cajaBody',
                validate: function() {
                    const inputDescripcion = document.getElementById('modalInput1')?.value.trim();
                    const inputMontoApertura = document.getElementById('modalInput2')?.value.trim();
                    
                    if (!inputDescripcion || !inputMontoApertura) {
                        alert("⚠️ Todos los campos son obligatorios.");
                        return false;
                    }
                    
                    // Obtener códigos existentes para asegurar unicidad
                    const existingData = loadDataFromLocalStorage('cajaData') || [];
                    const existingCodes = existingData.map(item => item.codigo);
                    
                    return {
                        fecha: new Date().toLocaleString('es-PE'),
                        codigo: generarCodigoUnico(existingCodes),
                        descripcion: inputDescripcion,
                        montoApertura: parseFloat(inputMontoApertura).toFixed(2),
                        montoDisponible: parseFloat(inputMontoApertura).toFixed(2),
                        montoCierre: '0.00',
                        estado: 'Abierto'
                    };
                }
            }
        };

        function actualizarMontoDisponible(key, index, nuevoMonto) {
            const data = loadDataFromLocalStorage(key);
            if (data[index]) {
                data[index].montoDisponible = parseFloat(nuevoMonto).toFixed(2);
                saveDataToLocalStorage(key, data);
                renderTable(key, `#${key.replace('Data', 'Body')}`);
            }
        }
    
        const config = sectionMap[sectionId];
        if (!config) {
            console.error(`❌ No se encontró configuración para la sección: ${sectionId}`);
            return;
        }
    
        // Validar los datos
        const newData = config.validate();
        if (!newData) {
            return; // Si la validación falla, no continuar
        }
    
        // Guardar los datos en la tabla y en localStorage
        addDataToTable(config.key, config.tableBodyId, newData);
    
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
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            } else if (key === 'almacenData') {
                const importeInventario = (item.stock * parseFloat(item.precio || 0)).toFixed(2);
                
                rowContent = `
                    <td>${index + 1}</td>
                    <td>${item.producto || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>${item.stock || '0'}</td>
                    <td>S/ ${parseFloat(item.precio || 0).toFixed(2)}</td>
                    <td>${item.entrada || '0'}</td>
                    <td>${item.salida || '0'}</td>
                    <td>S/ ${importeInventario}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            } else if (key === 'trabajadoresData') {
                rowContent = `
                    <td>${index + 1}</td> <!-- Generar el ID automáticamente -->
                    <td>${item.numeroTrabajador || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.cargo || ''}</td>
                    <td>${item.area || ''}</td>
                    <td>${item.sexo || ''}</td>
                    <td>${item.edad || ''}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            } else if (key === 'cajaData') {
                rowContent = `
                    <td>${index + 1}</td>
                    <td>${item.codigo || ''}</td>
                    <td>${item.fecha || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>S/ ${item.montoApertura || '0.00'}</td>
                    <td>S/ ${item.montoDisponible || item.montoApertura || '0.00'}</td>
                    <td>S/ ${item.montoCierre || '0.00'}</td>
                    <td class="text-white fw-bold ${item.estado === 'Cerrado' ? 'bg-danger' : 'bg-success'}">
                    ${item.estado || 'Abierto'}
                    </td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="verDetalleCaja(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-primary btn-sm mt-1 ms-1" onclick="cargarCaja(${index})" ${item.estado === 'Cerrado' ? 'disabled' : ''}>
                            <svg class="svg-inline--fa fa-plus" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em">
                                <path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${key}', ${index}, '${tableBodyId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm mt-1 ${item.estado === 'Cerrado' ? 'btn-secondary opacity-50' : 'btn-dark'}" 
                            onclick="${item.estado === 'Cerrado' ? '' : 'cerrarCaja(' + index + ')'}" 
                            ${item.estado === 'Cerrado' ? 'disabled' : ''}>
                            <svg class="svg-inline--fa fa-lock" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em">
                                <path fill="currentColor" d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"></path>
                            </svg>
                        </button>
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
                { 
                    id: 'editInputDNI', 
                    label: 'DNI', 
                    value: item.dni || '', 
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8)")
                },
                { 
                    id: 'editInputNombre', 
                    label: 'Nombre y Apellidos', 
                    value: item.nombre || '', 
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]/g, '').slice(0, 30)")
                },
                { 
                    id: 'editInputTelefono', 
                    label: 'Teléfono', 
                    value: item.telefono || '', 
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9)")
                },
                { 
                    id: 'editInputRUC', 
                    label: 'RUC', 
                    value: item.ruc || '', 
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11)")
                },
                { id: 'editInputDireccion', label: 'Dirección', value: item.direccion || '' },
                { id: 'editInputReferencia', label: 'Referencia', value: item.referencia || '' }
            ],
            'almacenData': [
                { id: 'editInputProducto', label: 'Producto', value: item.producto || '' },
                { id: 'editInputDescripcion', label: 'Descripción', type: 'textarea', value: item.descripcion || '' },
                { 
                    id: 'editInputPrecio', 
                    label: 'Precio', 
                    value: item.precio || '0.00',
                    validation: (input) => {
                        input.type = 'number';
                        input.step = '0.01';
                        input.min = '0';
                    }
                },
                { 
                    id: 'editInputEntrada', 
                    label: 'Entrada', 
                    value: '0',
                    validation: (input) => {
                        input.type = 'number';
                        input.min = '0';
                        input.step = '1';
                    }
                },
                { 
                    id: 'editInputSalida', 
                    label: 'Salida', 
                    value: '0',
                    validation: (input) => {
                        input.type = 'number';
                        input.min = '0';
                        input.step = '1';
                    }
                }
            ],
            'trabajadoresData': [
                { 
                    id: 'editInputNombre', 
                    label: 'Nombre y Apellidos', 
                    value: item.nombre || '',
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]/g, '')")
                },
                { 
                    id: 'editInputCargo', 
                    label: 'Cargo', 
                    value: item.cargo || '' 
                },
                {
                    id: 'editInputArea',
                    label: 'Área',
                    type: 'select',
                    options: ['Ventas', 'Logística', 'Administración', 'Recursos Humanos', 'Producción'],
                    value: item.area || ''
                },
                {
                    id: 'editInputSexo',
                    label: 'Sexo',
                    type: 'select',
                    options: ['Masculino', 'Femenino', 'Otro'],
                    value: item.sexo || ''
                },
                { 
                    id: 'editInputEdad', 
                    label: 'Edad', 
                    value: item.edad || '',
                    validation: (input) => {
                        input.type = 'number';
                        input.min = '18';
                        input.max = '100';
                    }
                }
            ],
            'cajaData': [
                { id: 'editInputDescripcion', label: 'Descripcion', value: item.descripcion || '' },
                { 
                    id: 'editInputMontoApertura', 
                    label: 'Monto Apertura', 
                    value: item.montoApertura || '',
                    validation: (input) => {
                        input.type = 'number';
                        input.step = '0.01';
                        input.min = '0';
                        input.readOnly = item.estado === 'Cerrado'; // Solo lectura si el estado es "Cerrado"
                    }
                },
                {
                    id: 'editInputMontoDisponible',
                    label: 'Monto Disponible',
                    value: item.montoDisponible || item.montoApertura || '',
                    validation: (input) => {
                        input.type = 'number';
                        input.step = '0.01';
                        input.min = '0';
                        input.readOnly = true; // Solo lectura ya que se calcula
                        input.style.backgroundColor = '#f8f9fa'; // Fondo gris claro para indicar que es solo lectura
                    }
                },
                {
                    id: 'editInputMontoCierre',
                    label: 'Monto Cierre',
                    value: item.montoCierre || '0.00',
                    validation: (input) => {
                        input.type = 'number';
                        input.step = '0.01';
                        input.min = '0';
                        input.readOnly = item.estado !== 'Cerrado'; // Solo editable al cerrar caja
                    }
                }
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
        
            const input = createModalInput(field);
            
            if (field.id.includes('Precio')) {
                const currencyWrapper = document.createElement('div');
                currencyWrapper.className = 'currency-input';
                currencyWrapper.appendChild(input);
                fieldDiv.appendChild(label);
                fieldDiv.appendChild(currencyWrapper);
            } else {
                fieldDiv.appendChild(label);
                fieldDiv.appendChild(input);
            }
            
            editModalForm.appendChild(fieldDiv);
        });
    
        document.getElementById('editRowIndex').value = index;
        document.getElementById('editTableKey').value = key;
    
        const editModal = new bootstrap.Modal(document.getElementById('editDataModal'));
        editModal.show();
    };

    window.cargarCaja = function(index) {
        const cajaData = loadDataFromLocalStorage('cajaData');
        const registro = cajaData[index];
        
        Swal.fire({
            title: 'Cargar Monto a Caja',
            html: `
                <p>Monto Actual: S/ ${registro.montoDisponible || '0.00'}</p>
                <input id="swalMontoCarga" type="number" class="swal2-input" 
                       placeholder="Monto a cargar" 
                       step="0.01" min="0.01" required>
            `,
            showCancelButton: true,
            confirmButtonText: 'Cargar',
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            preConfirm: () => {
                const input = document.getElementById('swalMontoCarga');
                const montoCarga = parseFloat(input.value);
                
                if (isNaN(montoCarga)) {
                    Swal.showValidationMessage('Ingrese un monto válido');
                    return false;
                }
                if (montoCarga <= 0) {
                    Swal.showValidationMessage('El monto debe ser mayor a cero');
                    return false;
                }
                
                return montoCarga.toFixed(2);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Actualizar el monto disponible
                const montoActual = parseFloat(registro.montoDisponible) || 0;
                registro.montoDisponible = (montoActual + parseFloat(result.value)).toFixed(2);
                
                // Guardar cambios
                saveDataToLocalStorage('cajaData', cajaData);
                
                // Actualizar la tabla
                renderTable('cajaData', '#cajaBody');
                
                // Mostrar confirmación
                Swal.fire({
                    icon: 'success',
                    title: '¡Carga Exitosa!',
                    text: `Nuevo monto disponible: S/ ${registro.montoDisponible}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    function generarCodigoUnico(existingCodes = []) {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Eliminamos caracteres ambiguos
        let codigo;
        let intentos = 0;
        const maxIntentos = 100;
        
        do {
            codigo = 'CAJ-';
            for (let i = 0; i < 4; i++) {
                codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            intentos++;
            
            if (intentos >= maxIntentos) {
                // Fallback si por alguna razón no se genera un código único
                codigo += Date.now().toString().slice(-3);
                break;
            }
        } while (existingCodes.includes(codigo));
        
        return codigo;
    }

    function generarNumeroTrabajadorUnico(existingNumbers = []) {
        const prefix = 'TR-';
        let numero;
        let intentos = 0;
        const maxIntentos = 100;
        
        do {
            // Genera 4 dígitos aleatorios (1000-9999)
            numero = prefix + Math.floor(1000 + Math.random() * 9000);
            intentos++;
            
            if (intentos >= maxIntentos) {
                // Fallback con timestamp si no se encuentra único
                numero = prefix + Date.now().toString().slice(-4);
                break;
            }
        } while (existingNumbers.includes(numero));
        
        return numero;
    }
    
    function addDataToTable(key, tableBodyId, data) {
        console.log(`➕ Intentando agregar datos a la tabla: ${key}`, data);
    
        const currentData = loadDataFromLocalStorage(key);
        const newData = { ...data }; // Copia el objeto para no modificar el original
    
        // Validaciones específicas para cada tabla
        if (key === 'clientesData') {
            if (!newData.dni?.trim() || !newData.nombre?.trim() || !newData.telefono?.trim() || 
                !newData.direccion?.trim() || !newData.referencia?.trim()) {
                console.warn("⚠️ Todos los campos obligatorios deben ser completados para Clientes.");
                alert("⚠️ Todos los campos obligatorios deben ser completados.");
                return;
            }
        }
    
        // Generar número único para trabajadores si no existe
        if (key === 'trabajadoresData' && !newData.numeroTrabajador) {
            const existingNumbers = currentData.map(item => item.numeroTrabajador);
            newData.numeroTrabajador = generarNumeroTrabajadorUnico(existingNumbers);
        }
    
        // Solo genera nuevo código si no existe uno (para ediciones)
        if (key === 'cajaData' && !newData.codigo) {
            const existingCodes = currentData.map(item => item.codigo);
            newData.codigo = generarCodigoUnico(existingCodes);
        }
    
        currentData.push(newData);
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
            const stock = this.querySelector('input[name="stock"]')?.value.trim() || '';
            const descripcion = this.querySelector('input[name="descripcion"]')?.value.trim() || '';
            const monto = this.querySelector('input[name="monto"]')?.value.trim() || '';
            const cargo = this.querySelector('input[name="cargo"]')?.value.trim() || '';

            console.log("📥 Capturando datos del formulario:", { nombre, telefono, producto, stock, descripcion, monto, cargo });

            if (formId === 'formClientes') {
                addDataToTable(storageKey, tableBodyId, { nombre, telefono });
            } else if (formId === 'formAlmacen') {
                addDataToTable(storageKey, tableBodyId, { producto, stock });
            } else if (formId === 'formTrabajadores') {
                addDataToTable(storageKey, tableBodyId, { nombre, cargo });
            } else if (formId === 'formCaja') {
                addDataToTable(storageKey, tableBodyId, { descripcion, monto });
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
    
            const input = createModalInput(field);
    
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
            { 
                id: 'modalInputDNI', 
                label: 'DNI', 
                type: 'text', 
                required: true,
                validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8)")
            },
            { 
                id: 'modalInput1', 
                label: 'Nombre y Apellidos', 
                type: 'text', 
                required: true,
                validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]/g, '').slice(0, 30)")
            },
            { 
                id: 'modalInput2', 
                label: 'Teléfono', 
                type: 'text', 
                required: true,
                validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9)")
            },
            { 
                id: 'modalInputRUC', 
                label: 'RUC', 
                type: 'text', 
                validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11)")
            },
            { 
                id: 'modalInputDireccion', 
                label: 'Dirección', 
                type: 'text', 
                required: true 
            },
            { 
                id: 'modalInputReferencia', 
                label: 'Referencia', 
                type: 'text', 
                required: true }
        ],
        'almacen': [
            { 
                id: 'modalInputProducto', 
                label: 'Producto', 
                type: 'text', 
                required: true,
                validation: (input) => input.setAttribute('maxlength', '100')
            },
            {
                id: 'modalInputDescripcion',
                label: 'Descripción',
                type: 'textarea',
                validation: (input) => {
                    input.setAttribute('rows', '3');
                    input.setAttribute('maxlength', '255');
                }
            },
            { 
                id: 'modalInputStock', 
                label: 'Stock Inicial', 
                type: 'number', 
                required: true,
                validation: (input) => {
                    input.setAttribute('min', '0');
                    input.setAttribute('step', '1');
                }
            },
            { 
                id: 'modalInputPrecio', 
                label: 'Precio Unitario', 
                type: 'number', 
                required: true,
                validation: (input) => {
                    input.setAttribute('min', '0');
                    input.setAttribute('step', '0.01');
                }
            },
            { 
                id: 'modalInputEntrada', 
                label: 'Entrada', 
                type: 'number', 
                required: true,
                validation: (input) => {
                    input.setAttribute('min', '0');
                    input.setAttribute('step', '1');
                    input.value = '0'; // Valor por defecto
                }
            },
            { 
                id: 'modalInputSalida', 
                label: 'Salida', 
                type: 'number', 
                required: true,
                validation: (input) => {
                    input.setAttribute('min', '0');
                    input.setAttribute('step', '1');
                    input.value = '0'; // Valor por defecto
                }
            }
        ],
        'trabajadores': [
                { 
                    id: 'modalInputNombre', 
                    label: 'Nombre y Apellidos', 
                    type: 'text', 
                    required: true,
                    validation: (input) => input.setAttribute('oninput', "this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]/g, '')")
                },
                { 
                    id: 'modalInputCargo', 
                    label: 'Cargo', 
                    type: 'text', 
                    required: true
                },
                {
                    id: 'modalInputArea',
                    label: 'Área',
                    type: 'select',
                    options: ['Ventas', 'Logística', 'Administración', 'Recursos Humanos', 'Producción'],
                    required: false
                },
                {
                    id: 'modalInputSexo',
                    label: 'Sexo',
                    type: 'select',
                    options: ['Masculino', 'Femenino', 'Otro'],
                    required: false
                },
                { 
                    id: 'modalInputEdad', 
                    label: 'Edad', 
                    type: 'number', 
                    required: true,
                    validation: (input) => {
                        input.setAttribute('min', '18');
                        input.setAttribute('max', '100');
                    }
                }
        ],
        'caja': [
            { 
                id: 'modalInput1', 
                label: 'Descripcion', 
                type: 'text', 
                required: true 
            },
            { 
                id: 'modalInput2', 
                label: 'Monto Apertura', 
                type: 'number', 
                required: true 
            }
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