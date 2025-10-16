// script.js

let repairsData = [];
let currentEditId = null;

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded successfully');
    console.log('PapaParse available:', typeof Papa !== 'undefined');
    
    // Initialize empty state
    renderAll();
});

// Tab Navigation
function showTab(tabName, event) {
    console.log('Switching to tab:', tabName);
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    const content = document.getElementById(tabName);
    if (content) {
        content.classList.add('active');
        console.log('Tab switched successfully');
    } else {
        console.error('Tab content not found:', tabName);
    }
}

// Load CSV file
function loadCSV() {
    console.log('loadCSV function called');
    
    const fileInput = document.getElementById('csvFileInput');
    if (!fileInput) {
        console.error('File input not found');
        alert('Erro: Elemento de input não encontrado');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um ficheiro CSV!');
        return;
    }
    
    console.log('Loading file:', file.name);

    // Check if PapaParse is loaded
    if (typeof Papa === 'undefined') {
        alert('Erro: Biblioteca PapaParse não carregada. Recarregue a página.');
        console.error('PapaParse not loaded');
        return;
    }

    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('CSV parsed:', results);
            
            if (results.errors.length > 0) {
                console.error('CSV parsing errors:', results.errors);
                alert('Erro ao processar o ficheiro CSV. Verifique o formato.');
                return;
            }

            if (!results.data || results.data.length === 0) {
                alert('O ficheiro CSV está vazio ou não contém dados válidos.');
                return;
            }

            // Convert CSV data to our format
            repairsData = results.data.map(row => ({
                Rep: parseInt(row.Rep) || 0,
                Cliente: row.Cliente || '',
                Contacto: row.Contacto || 'Desconhecido',
                'Data Entrada': row['Data Entrada'] || row.DataEntrada || '',
                'Data Recolha': row['Data Recolha'] || row.DataRecolha || '',
                Marca: row.Marca || '',
                Modelo: row.Modelo || '',
                'N/S': row['N/S'] || row.NS || '',
                Carregador: parseBool(row.Carregador),
                Bateria: parseBool(row.Bateria),
                'Cabo A/C': parseBool(row['Cabo A/C'] || row.CaboAC),
                Avaria: row.Avaria || '',
                Diagnostico: row.Diagnostico || '',
                'Data Orçamentado': row['Data Orçamentado'] || row['Data Or�amentado'] || row.DataOrcamentado || '',
                Valor: parseFloat(row.Valor) || 0,
                Aprovado: parseBool(row.Aprovado),
                Pronto: parseBool(row.Pronto),
                Enviado: parseBool(row.Enviado),
                Observações: row.Observações || row['Observa��es'] || row.Observacoes || '',
                Title: row.Title || '',
                Link: row.Link || '',
                Snippet: row.Snippet || '',
                Description: row.Description || ''
            }));

            console.log('Data loaded:', repairsData.length, 'records');
            renderAll();
            alert(`${repairsData.length} reparações carregadas com sucesso!`);
            fileInput.value = '';
        },
        error: function(error) {
            console.error('Error reading file:', error);
            alert('Erro ao ler o ficheiro CSV.');
        }
    });
}

// Helper function to parse boolean values
function parseBool(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'sim';
    }
    return false;
}

// Render all views
function renderAll() {
    console.log('Rendering all views with', repairsData.length, 'records');
    renderDashboard();
    renderAllRepairs();
    renderReports();
}

// Dashboard rendering
function renderDashboard() {
    const stats = {
        total: repairsData.length,
        approved: repairsData.filter(r => r.Aprovado).length,
        completed: repairsData.filter(r => r.Pronto).length,
        sent: repairsData.filter(r => r.Enviado).length
    };

    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) {
        console.error('statsGrid element not found');
        return;
    }

    statsGrid.innerHTML = `
        <div class="stat-card"><h3>${stats.total}</h3><p>Total Reparações</p></div>
        <div class="stat-card"><h3>${stats.approved}</h3><p>Aprovadas</p></div>
        <div class="stat-card"><h3>${stats.completed}</h3><p>Prontas</p></div>
        <div class="stat-card"><h3>${stats.sent}</h3><p>Enviadas</p></div>
    `;

    const tbody = document.querySelector('#recentRepairs tbody');
    if (!tbody) {
        console.error('recentRepairs tbody not found');
        return;
    }

    if (repairsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Carregue um ficheiro CSV para começar</td></tr>';
        return;
    }

    tbody.innerHTML = repairsData.slice(0, 5).map(r => `
        <tr>
            <td>${r.Rep}</td>
            <td>${r.Cliente}</td>
            <td>${r.Marca}</td>
            <td>${r.Modelo}</td>
            <td>${r.Avaria}</td>
            <td>€${r.Valor.toFixed(2)}</td>
            <td>${getStatusBadge(r)}</td>
        </tr>
    `).join('');
}

// Render all repairs table
function renderAllRepairs() {
    const tbody = document.querySelector('#allRepairs tbody');
    if (!tbody) {
        console.error('allRepairs tbody not found');
        return;
    }

    if (repairsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Nenhuma reparação encontrada. Carregue um ficheiro CSV para começar.</td></tr>';
        return;
    }
    
    tbody.innerHTML = repairsData.map(r => `
        <tr>
            <td>${r.Rep}</td>
            <td>${r.Cliente}</td>
            <td>${r['Data Entrada']}</td>
            <td>${r.Marca} ${r.Modelo}</td>
            <td>${r.Avaria}</td>
            <td>${r.Diagnostico}</td>
            <td>€${r.Valor.toFixed(2)}</td>
            <td>${getStatusBadge(r)}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick="editRepair(${r.Rep})" style="margin-right: 5px;">Editar</button>
                <button class="btn btn-success" onclick="viewDetails(${r.Rep})">Detalhes</button>
            </td>
        </tr>
    `).join('');
}

// Get status badge HTML
function getStatusBadge(repair) {
    if (repair.Enviado) return '<span class="status-badge status-sent">Enviado</span>';
    if (repair.Pronto) return '<span class="status-badge status-completed">Pronto</span>';
    if (repair.Aprovado) return '<span class="status-badge status-approved">Aprovado</span>';
    return '<span class="status-badge status-pending">Pendente</span>';
}

// Filter repairs
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    
    if (!searchInput || !filterStatus) {
        console.error('Filter elements not found');
        return;
    }
    
    const search = searchInput.value.toLowerCase();
    const status = filterStatus.value;
    
    const filtered = repairsData.filter(r => {
        const matchSearch = !search || 
            r.Cliente.toLowerCase().includes(search) ||
            r.Marca.toLowerCase().includes(search) ||
            r.Modelo.toLowerCase().includes(search);
        
        const matchStatus = !status ||
            (status === 'aprovado' && r.Aprovado) ||
            (status === 'pronto' && r.Pronto) ||
            (status === 'enviado' && r.Enviado) ||
            (status === 'pendente' && !r.Aprovado && !r.Pronto && !r.Enviado);
        
        return matchSearch && matchStatus;
    });

    const tbody = document.querySelector('#allRepairs tbody');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Nenhuma reparação encontrada com os filtros aplicados.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td>${r.Rep}</td>
            <td>${r.Cliente}</td>
            <td>${r['Data Entrada']}</td>
            <td>${r.Marca} ${r.Modelo}</td>
            <td>${r.Avaria}</td>
            <td>${r.Diagnostico}</td>
            <td>€${r.Valor.toFixed(2)}</td>
            <td>${getStatusBadge(r)}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick="editRepair(${r.Rep})" style="margin-right: 5px;">Editar</button>
                <button class="btn btn-success" onclick="viewDetails(${r.Rep})">Detalhes</button>
            </td>
        </tr>
    `).join('');
}

// Add new repair manually
function addRepair(e) {
    e.preventDefault();
    console.log('Adding new repair');
    
    const form = e.target;
    const formData = new FormData(form);
    
    const newRepair = {
        Rep: repairsData.length > 0 ? Math.max(...repairsData.map(r => r.Rep)) + 1 : 1,
        Cliente: formData.get('cliente'),
        Contacto: formData.get('contacto') || 'Desconhecido',
        'Data Entrada': formData.get('dataEntrada'),
        'Data Recolha': '',
        Marca: formData.get('marca'),
        Modelo: formData.get('modelo'),
        'N/S': formData.get('serial') || '',
        Carregador: formData.get('carregador') === 'on',
        Bateria: formData.get('bateria') === 'on',
        'Cabo A/C': formData.get('caboAC') === 'on',
        Avaria: formData.get('avaria'),
        Diagnostico: formData.get('diagnostico') || '',
        'Data Orçamentado': '',
        Valor: parseFloat(formData.get('valor')) || 0,
        Aprovado: false,
        Pronto: false,
        Enviado: false,
        Observações: formData.get('observacoes') || ''
    };

    repairsData.push(newRepair);
    console.log('Repair added:', newRepair);
    
    form.reset();
    renderAll();
    alert('Reparação adicionada com sucesso!');
    
    return false;
}

// Edit repair
function editRepair(repId) {
    console.log('Editing repair:', repId);
    
    const repair = repairsData.find(r => r.Rep === repId);
    if (!repair) {
        console.error('Repair not found:', repId);
        return;
    }

    currentEditId = repId;
    
    const editAprovado = document.getElementById('editAprovado');
    const editPronto = document.getElementById('editPronto');
    const editEnviado = document.getElementById('editEnviado');
    const dataRecolhaInput = document.querySelector('#editForm [name="dataRecolha"]');
    
    if (editAprovado) editAprovado.checked = repair.Aprovado;
    if (editPronto) editPronto.checked = repair.Pronto;
    if (editEnviado) editEnviado.checked = repair.Enviado;
    if (dataRecolhaInput) dataRecolhaInput.value = repair['Data Recolha'] || '';
    
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Save edit
function saveEdit(e) {
    e.preventDefault();
    console.log('Saving edit for repair:', currentEditId);
    
    const repair = repairsData.find(r => r.Rep === currentEditId);
    if (!repair) {
        console.error('Repair not found:', currentEditId);
        return false;
    }

    const form = e.target;
    const formData = new FormData(form);
    
    repair.Aprovado = formData.get('aprovado') === 'on';
    repair.Pronto = formData.get('pronto') === 'on';
    repair.Enviado = formData.get('enviado') === 'on';
    repair['Data Recolha'] = formData.get('dataRecolha');

    console.log('Repair updated:', repair);
    
    closeModal();
    renderAll();
    alert('Reparação atualizada com sucesso!');
    
    return false;
}

// Close modal
function closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditId = null;
}

// View repair details
function viewDetails(repId) {
    console.log('Viewing details for repair:', repId);
    
    const repair = repairsData.find(r => r.Rep === repId);
    if (!repair) {
        console.error('Repair not found:', repId);
        return;
    }

    const detailsContent = document.getElementById('detailsContent');
    if (!detailsContent) return;

    let html = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-bottom: 15px;">Informações da Reparação</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div><strong>Rep:</strong> ${repair.Rep}</div>
                <div><strong>Cliente:</strong> ${repair.Cliente}</div>
                <div><strong>Contacto:</strong> ${repair.Contacto}</div>
                <div><strong>Data Entrada:</strong> ${repair['Data Entrada']}</div>
                <div><strong>Data Recolha:</strong> ${repair['Data Recolha'] || 'N/A'}</div>
                <div><strong>Marca:</strong> ${repair.Marca}</div>
                <div><strong>Modelo:</strong> ${repair.Modelo}</div>
                <div><strong>N/S:</strong> ${repair['N/S']}</div>
            </div>

            <h4 style="color: #667eea; margin-bottom: 10px;">Acessórios</h4>
            <div style="margin-bottom: 20px;">
                <span style="margin-right: 15px;">
                    ${repair.Carregador ? '✅' : '❌'} Carregador
                </span>
                <span style="margin-right: 15px;">
                    ${repair.Bateria ? '✅' : '❌'} Bateria
                </span>
                <span>
                    ${repair['Cabo A/C'] ? '✅' : '❌'} Cabo A/C
                </span>
            </div>

            <h4 style="color: #667eea; margin-bottom: 10px;">Avaria e Diagnóstico</h4>
            <div style="margin-bottom: 20px;">
                <p><strong>Avaria:</strong> ${repair.Avaria}</p>
                <p><strong>Diagnóstico:</strong> ${repair.Diagnostico}</p>
                <p><strong>Valor:</strong> €${repair.Valor.toFixed(2)}</p>
            </div>

            <h4 style="color: #667eea; margin-bottom: 10px;">Estado</h4>
            <div style="margin-bottom: 20px;">
                <span style="margin-right: 15px;">
                    ${repair.Aprovado ? '✅' : '❌'} Aprovado
                </span>
                <span style="margin-right: 15px;">
                    ${repair.Pronto ? '✅' : '❌'} Pronto
                </span>
                <span>
                    ${repair.Enviado ? '✅' : '❌'} Enviado
                </span>
            </div>

            <h4 style="color: #667eea; margin-bottom: 10px;">Observações</h4>
            <p style="margin-bottom: 20px;">${repair.Observações || 'Sem observações'}</p>
    `;

    // Add laptop information if available
    if (repair.Title || repair.Link || repair.Description) {
        html += `
            <h3 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">Informações do Modelo</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        `;
        
        if (repair.Title) {
            html += `<h4 style="margin-bottom: 10px;">${repair.Title}</h4>`;
        }
        
        if (repair.Description) {
            html += `<p style="margin-bottom: 10px; color: #495057;">${repair.Description}</p>`;
        }
        
        if (repair.Link) {
            html += `
                <a href="${repair.Link}" target="_blank" rel="noopener noreferrer" 
                   style="color: #667eea; text-decoration: none; font-weight: 600;">
                    Ver Review Completo →
                </a>
            `;
        }
        
        html += `</div>`;
    }

    html += `</div>`;
    
    detailsContent.innerHTML = html;
    
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close details modal
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Render reports
function renderReports() {
    if (repairsData.length === 0) {
        document.getElementById('totalRevenue').textContent = '€0.00';
        document.getElementById('avgRepairValue').textContent = '€0.00';
        document.getElementById('completionRate').textContent = '0%';
        document.getElementById('approvalRate').textContent = '0%';
        
        const tbody = document.querySelector('#clientReport tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Nenhum dado disponível</td></tr>';
        }
        return;
    }

    const totalRevenue = repairsData.reduce((sum, r) => sum + r.Valor, 0);
    const avgValue = totalRevenue / repairsData.length;
    const completionRate = (repairsData.filter(r => r.Pronto).length / repairsData.length) * 100;
    const approvalRate = (repairsData.filter(r => r.Aprovado).length / repairsData.length) * 100;

    document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
    document.getElementById('avgRepairValue').textContent = `€${avgValue.toFixed(2)}`;
    document.getElementById('completionRate').textContent = `${completionRate.toFixed(1)}%`;
    document.getElementById('approvalRate').textContent = `${approvalRate.toFixed(1)}%`;

    // Client statistics
    const clientStats = {};
    repairsData.forEach(r => {
        if (!clientStats[r.Cliente]) {
            clientStats[r.Cliente] = {
                count: 0,
                total: 0,
                approved: 0,
                completed: 0
            };
        }
        clientStats[r.Cliente].count++;
        clientStats[r.Cliente].total += r.Valor;
        if (r.Aprovado) clientStats[r.Cliente].approved++;
        if (r.Pronto) clientStats[r.Cliente].completed++;
    });

    const tbody = document.querySelector('#clientReport tbody');
    if (!tbody) return;
    
    tbody.innerHTML = Object.entries(clientStats)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([client, stats]) => `
            <tr>
                <td>${client}</td>
                <td>${stats.count}</td>
                <td>€${stats.total.toFixed(2)}</td>
                <td>${stats.approved}</td>
                <td>${stats.completed}</td>
            </tr>
        `).join('');
}

// Export to CSV
function exportToCSV() {
    if (repairsData.length === 0) {
        alert('Não há dados para exportar!');
        return;
    }

    // Check if PapaParse is loaded
    if (typeof Papa === 'undefined') {
        alert('Erro: Biblioteca PapaParse não carregada.');
        return;
    }

    // Prepare CSV data with all fields including new ones
    const headers = [
        'Rep', 'Cliente', 'Contacto', 'Data Entrada', 'Data Recolha',
        'Marca', 'Modelo', 'N/S', 'Carregador', 'Bateria', 'Cabo A/C',
        'Avaria', 'Diagnostico', 'Data Orçamentado', 'Valor',
        'Aprovado', 'Pronto', 'Enviado', 'Observações',
        'Title', 'Link', 'Snippet', 'Description'
    ];

    const csvContent = Papa.unparse({
        fields: headers,
        data: repairsData.map(r => [
            r.Rep,
            r.Cliente,
            r.Contacto,
            r['Data Entrada'],
            r['Data Recolha'],
            r.Marca,
            r.Modelo,
            r['N/S'],
            r.Carregador ? 1 : 0,
            r.Bateria ? 1 : 0,
            r['Cabo A/C'] ? 1 : 0,
            r.Avaria,
            r.Diagnostico,
            r['Data Orçamentado'],
            r.Valor,
            r.Aprovado ? 1 : 0,
            r.Pronto ? 1 : 0,
            r.Enviado ? 1 : 0,
            r.Observações,
            r.Title || '',
            r.Link || '',
            r.Snippet || '',
            r.Description || ''
        ])
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `reparacoes_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Ficheiro CSV exportado com sucesso!');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const detailsModal = document.getElementById('detailsModal');
    
    if (event.target === editModal) {
        closeModal();
    }
    
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
}