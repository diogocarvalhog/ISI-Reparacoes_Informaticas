// script.js

let repairsData = [];

window.addEventListener('DOMContentLoaded', function() {
    renderAll();
});

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function loadCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um ficheiro CSV!');
        return;
    }

    Papa.parse(file, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.errors.length > 0) {
                console.error('CSV parsing errors:', results.errors);
                alert('Erro ao processar o ficheiro CSV.');
                return;
            }

            if (!results.data || results.data.length === 0) {
                alert('O ficheiro CSV está vazio.');
                return;
            }

            repairsData = results.data.map(row => ({
                Rep: parseInt(row.Rep) || 0,
                Cliente: (row.Cliente || '').trim(),
                Contacto: (row.Contacto || 'Desconhecido').trim(),
                'Data Entrada': (row['Data Entrada'] || '').trim(),
                'Data Recolha': (row['Data Recolha'] || '').trim(),
                Marca: (row.Marca || '').trim(),
                Modelo: (row.Modelo || '').trim(),
                'N/S': (row['N/S'] || '').trim(),
                Carregador: parseBool(row.Carregador),
                Bateria: parseBool(row.Bateria),
                'Cabo A/C': parseBool(row['Cabo A/C']),
                Avaria: (row.Avaria || '').trim(),
                Diagnostico: (row.Diagnostico || '').trim(),
                'Data Orçamentado': (row['Data Orçamentado'] || row['Data Orï¿½amentado'] || '').trim(),
                Valor: parseFloat(row.Valor) || 0,
                Aprovado: parseBool(row.Aprovado),
                Pronto: parseBool(row.Pronto),
                Enviado: parseBool(row.Enviado),
                Observações: (row.Observações || row['Observaï¿½ï¿½es'] || '').trim(),
                Title: (row.Title || '').trim(),
                Link: (row.Link || '').trim(),
                Snippet: (row.Snippet || '').trim(),
                Description: (row.Description || '').trim(),
                Image: (row.Image || '').trim()
            }));

            renderAll();
            alert(`${repairsData.length} reparações carregadas com sucesso!`);
            fileInput.value = '';
            
            // Switch to dashboard after loading
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('.tab').classList.add('active');
            document.getElementById('dashboard').classList.add('active');
        },
        error: function(error) {
            console.error('Error reading file:', error);
            alert('Erro ao ler o ficheiro CSV.');
        }
    });
}

function parseBool(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'sim';
    }
    return false;
}

function renderAll() {
    renderDashboard();
    renderAllRepairs();
    renderReports();
}

function renderDashboard() {
    const stats = {
        total: repairsData.length,
        approved: repairsData.filter(r => r.Aprovado).length,
        completed: repairsData.filter(r => r.Pronto).length,
        sent: repairsData.filter(r => r.Enviado).length
    };

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><h3>${stats.total}</h3><p>Total Reparações</p></div>
        <div class="stat-card"><h3>${stats.approved}</h3><p>Aprovadas</p></div>
        <div class="stat-card"><h3>${stats.completed}</h3><p>Prontas</p></div>
        <div class="stat-card"><h3>${stats.sent}</h3><p>Enviadas</p></div>
    `;

    const tbody = document.querySelector('#recentRepairs tbody');
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

function renderAllRepairs() {
    const tbody = document.querySelector('#allRepairs tbody');
    if (repairsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Nenhuma reparação encontrada. Carregue um ficheiro CSV.</td></tr>';
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
            <td>
                <button class="btn btn-success" onclick="viewDetails(${r.Rep})">Detalhes</button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(repair) {
    if (repair.Enviado) return '<span class="status-badge status-sent">Enviado</span>';
    if (repair.Pronto) return '<span class="status-badge status-completed">Pronto</span>';
    if (repair.Aprovado) return '<span class="status-badge status-approved">Aprovado</span>';
    return '<span class="status-badge status-pending">Pendente</span>';
}

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    
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
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Nenhuma reparação encontrada.</td></tr>';
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
            <td>
                <button class="btn btn-success" onclick="viewDetails(${r.Rep})">Detalhes</button>
            </td>
        </tr>
    `).join('');
}

function viewDetails(repId) {
    const repair = repairsData.find(r => r.Rep === repId);
    if (!repair) return;

    let html = `
        <h3 class="section-title">Informações da Reparação</h3>
        <div class="details-grid">
            <div class="detail-item"><strong>Rep:</strong> ${repair.Rep}</div>
            <div class="detail-item"><strong>Cliente:</strong> ${repair.Cliente}</div>
            <div class="detail-item"><strong>Contacto:</strong> ${repair.Contacto}</div>
            <div class="detail-item"><strong>Data Entrada:</strong> ${repair['Data Entrada']}</div>
            <div class="detail-item"><strong>Data Recolha:</strong> ${repair['Data Recolha'] || 'N/A'}</div>
            <div class="detail-item"><strong>Marca:</strong> ${repair.Marca}</div>
            <div class="detail-item"><strong>Modelo:</strong> ${repair.Modelo}</div>
            <div class="detail-item"><strong>N/S:</strong> ${repair['N/S'] || 'N/A'}</div>
        </div>

        <h3 class="section-title">Acessórios</h3>
        <div class="accessories-list">
            <div class="accessory-item">
                <span>${repair.Carregador ? '✅' : '❌'}</span>
                <span>Carregador</span>
            </div>
            <div class="accessory-item">
                <span>${repair.Bateria ? '✅' : '❌'}</span>
                <span>Bateria</span>
            </div>
            <div class="accessory-item">
                <span>${repair['Cabo A/C'] ? '✅' : '❌'}</span>
                <span>Cabo A/C</span>
            </div>
        </div>

        <h3 class="section-title">Avaria e Diagnóstico</h3>
        <div class="details-grid">
            <div class="detail-item"><strong>Avaria:</strong> ${repair.Avaria}</div>
            <div class="detail-item"><strong>Diagnóstico:</strong> ${repair.Diagnostico}</div>
            <div class="detail-item"><strong>Data Orçamentado:</strong> ${repair['Data Orçamentado'] || 'N/A'}</div>
            <div class="detail-item"><strong>Valor:</strong> €${repair.Valor.toFixed(2)}</div>
        </div>

        <h3 class="section-title">Estado</h3>
        <div class="accessories-list">
            <div class="accessory-item">
                <span>${repair.Aprovado ? '✅' : '❌'}</span>
                <span>Aprovado</span>
            </div>
            <div class="accessory-item">
                <span>${repair.Pronto ? '✅' : '❌'}</span>
                <span>Pronto</span>
            </div>
            <div class="accessory-item">
                <span>${repair.Enviado ? '✅' : '❌'}</span>
                <span>Enviado</span>
            </div>
        </div>

        <h3 class="section-title">Observações</h3>
        <div class="detail-item">
            ${repair.Observações || 'Sem observações'}
        </div>
    `;

// Add laptop information from API if available
    if (repair.Title || repair.Link || repair.Description || repair.Image) {
        html += `
            <h3 class="section-title">Informações do Modelo (API KNIME)</h3>
            <div class="laptop-info-card">
        `;
        
        if (repair.Title) {
            html += `<h3>${repair.Title}</h3>`;
        }
        
        if (repair.Image) {
            html += `<img src="${repair.Image}" alt="${repair.Title || 'Laptop'}" onerror="this.style.display='none'">`;
        }
        
        if (repair.Snippet) {
            html += `<div class="snippet">${repair.Snippet}</div>`;
        }
        
        if (repair.Description) {
            html += `<p>${repair.Description}</p>`;
        }
        
        if (repair.Link) {
            html += `<a href="${repair.Link}" target="_blank">Ver mais informações →</a>`;
        }
        
        html += `</div>`;
    }

    document.getElementById('detailsContent').innerHTML = html;
    document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

function renderReports() {
    if (repairsData.length === 0) {
        document.getElementById('totalRevenue').textContent = '€0';
        document.getElementById('avgRepairValue').textContent = '€0';
        document.getElementById('completionRate').textContent = '0%';
        document.getElementById('approvalRate').textContent = '0%';
        
        const tbody = document.querySelector('#clientReport tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Nenhum dado disponível</td></tr>';
        return;
    }

    // Calculate overall statistics
    const totalRevenue = repairsData.reduce((sum, r) => sum + r.Valor, 0);
    const avgRepairValue = totalRevenue / repairsData.length;
    const completedCount = repairsData.filter(r => r.Pronto || r.Enviado).length;
    const approvedCount = repairsData.filter(r => r.Aprovado).length;
    const completionRate = (completedCount / repairsData.length) * 100;
    const approvalRate = (approvedCount / repairsData.length) * 100;

    document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
    document.getElementById('avgRepairValue').textContent = `€${avgRepairValue.toFixed(2)}`;
    document.getElementById('completionRate').textContent = `${completionRate.toFixed(1)}%`;
    document.getElementById('approvalRate').textContent = `${approvalRate.toFixed(1)}%`;

    // Generate client report
    const clientStats = {};
    
    repairsData.forEach(r => {
        if (!clientStats[r.Cliente]) {
            clientStats[r.Cliente] = {
                count: 0,
                totalValue: 0,
                approved: 0,
                completed: 0
            };
        }
        
        clientStats[r.Cliente].count++;
        clientStats[r.Cliente].totalValue += r.Valor;
        if (r.Aprovado) clientStats[r.Cliente].approved++;
        if (r.Pronto || r.Enviado) clientStats[r.Cliente].completed++;
    });

    const clientArray = Object.entries(clientStats)
        .map(([cliente, stats]) => ({ cliente, ...stats }))
        .sort((a, b) => b.totalValue - a.totalValue);

    const tbody = document.querySelector('#clientReport tbody');
    tbody.innerHTML = clientArray.map(client => `
        <tr>
            <td>${client.cliente}</td>
            <td>${client.count}</td>
            <td>€${client.totalValue.toFixed(2)}</td>
            <td>${client.approved}</td>
            <td>${client.completed}</td>
        </tr>
    `).join('');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
};