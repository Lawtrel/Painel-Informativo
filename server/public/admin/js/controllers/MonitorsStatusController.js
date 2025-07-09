import { MONITORES } from '../constants/monitors.js';

function createMonitorItem(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'dashboard-monitor-card__item';

  // Preview de imagem/vídeo
  let preview = '';
  if (item.tipo === 'imagem' && item.url_http) {
    preview = `<img src="${item.url_http}" alt="${item.arquivo}" class="dashboard-monitor-card__item-preview" />`;
  } else if (item.tipo === 'video' && item.url_http) {
    preview = `<video src="${item.url_http}" class="dashboard-monitor-card__item-preview" controls></video>`;
  }

  // Texto simples
  let mensagem = '';
  if (item.tipo === 'texto_simples' && item.mensagem) {
    mensagem = `<span class="dashboard-monitor-card__item-mensagem">${item.mensagem}</span>`;
  }

  itemDiv.innerHTML = `
    ${preview}
    <div class="dashboard-monitor-card__item-info">
      <span class="dashboard-monitor-card__item-type">${item.tipo}</span>
      <span class="dashboard-monitor-card__item-arquivo">${item.arquivo || ''}</span>
      <span class="dashboard-monitor-card__item-duracao">${item.duracao_s ? item.duracao_s + 's' : ''}</span>
      ${mensagem}
    </div>
  `;
  return itemDiv;
}

function createMonitorCard(monitor) {
  const card = document.createElement('div');
  card.className = 'dashboard-monitor-card';

  // Header
  const header = document.createElement('div');
  header.className = 'dashboard-monitor-card__header';
  header.innerHTML = `
    <div class="dashboard-monitor-card__header-left">
      <span class="dashboard-monitor-card__header-icon"><i class="fas fa-tv"></i></span>
      <span class="dashboard-monitor-card__header-label">${monitor.label || `Monitor ${monitor.id_monitor}`}</span>
    </div>
    <span class="dashboard-monitor-card__header-count">${monitor.itens.length} ${monitor.itens.length === 1 ? 'item' : 'itens'}</span>
  `;
  card.appendChild(header);

  // Conteúdo
  const content = document.createElement('div');
  content.className = 'dashboard-monitor-card__content';
  if (!monitor.itens || monitor.itens.length === 0) {
    content.innerHTML = `
      <div class="dashboard-monitor-card__empty">
        <i class="fas fa-inbox"></i>
        <span>Nenhum conteúdo adicionado</span>
      </div>
    `;
  } else {
    monitor.itens.forEach(item => {
      const itemDiv = createMonitorItem(item);
      content.appendChild(itemDiv);
    });
  }
  card.appendChild(content);

  return card;
}

async function fetchMonitorsFromAPI() {
  try {
    const response = await fetch('../../api/get_content.php');
    const data = await response.json();
    if (data.success && data.data && Array.isArray(data.data.monitores)) {
      return data.data.monitores;
    }
    return [];
  } catch (e) {
    return [];
  }
}

function renderMonitorsStatus(monitores) {
  const container = document.querySelector('.dashboard-monitors-status__cards');
  container.innerHTML = '';

  monitores.forEach(monitor => {
    const card = document.createElement('div');
    card.className = 'monitor-card';
    card.innerHTML = `
      <div class="monitor-card__header">
        <span class="monitor-card__icon"><i class="fas fa-tv"></i></span>
        <span class="monitor-card__title">${getMonitorLabel(monitor.id_monitor)}</span>
        <span class="monitor-card__count">${monitor.itens && monitor.itens.length ? monitor.itens.length : 0} ${monitor.itens && monitor.itens.length === 1 ? 'item' : 'itens'}</span>
      </div>
      <div class="monitor-card__content">
        ${!monitor.itens || monitor.itens.length === 0 ? `
          <div class="monitor-card__empty">
            <i class="fas fa-inbox"></i>
            <span>Nenhum conteúdo adicionado</span>
          </div>
        ` : monitor.itens.map((item, idx) => `
            ${renderMonitorItem(item)}
            ${idx < monitor.itens.length - 1 ? '<div class=\'monitor-item__separator\'></div>' : ''}
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });
}

function getItemStatus(item) {
  if (item.status) return item.status;
  if (item.url_http || (item.tipo === 'texto_simples' && item.mensagem)) return 'enviado';
  if (item.isNew) return 'pendente';
  return 'pendente';
}

function getColorClass(color, type) {
  if (!color) return type === 'bg' ? 'bg-dark' : 'text-white';
  const map = {
    // fundo
    '#222': 'bg-dark',
    '#003366': 'bg-blue',
    '#444': 'bg-gray',
    '#fff': 'bg-white',
    // texto
    '#fff': 'text-white',
    '#ffe600': 'text-yellow',
    '#222': 'text-black',
    '#003366': 'text-blue',
  };
  return map[color] || (type === 'bg' ? 'bg-dark' : 'text-white');
}

function renderMonitorItem(item) {
  let preview = '';
  if (item.tipo === 'imagem' && item.url_http) {
    preview = `<img src="${item.url_http}" alt="${item.arquivo}" class="monitor-item__preview-img" />`;
  } else if (item.tipo === 'video' && item.url_http) {
    preview = `<video src="${item.url_http}" class="monitor-item__preview-img" controls></video>`;
  } else if (item.tipo === 'texto_simples' && item.mensagem) {
    // Aplica cor de fundo e cor do texto diretamente do JSON
    const bg = item.cor_fundo || '#222';
    const color = item.cor_texto || '#fff';
    preview = `<div class="monitor-item__preview-texto" style="background:${bg};color:${color}">${item.mensagem}</div>`;
  } else {
    preview = `<div class="monitor-item__preview-unknown"><i class="fas fa-question"></i></div>`;
  }

  // Status
  let statusClass = '';
  let statusIcon = '';
  let statusLabel = '';
  const status = (getItemStatus(item) || '').toLowerCase();
  if (status === 'enviado') {
    statusClass = 'monitor-item__status--enviado';
    statusIcon = 'fa-check';
    statusLabel = 'Enviado';
  } else if (status === 'pendente' || status === 'aguardando') {
    statusClass = 'monitor-item__status--pendente';
    statusIcon = 'fa-clock';
    statusLabel = 'Aguardando';
  } else if (status === 'erro') {
    statusClass = 'monitor-item__status--erro';
    statusIcon = 'fa-exclamation-triangle';
    statusLabel = 'Erro';
  } else {
    statusClass = 'monitor-item__status--pendente';
    statusIcon = 'fa-info-circle';
    statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Aguardando';
  }

  // Ordem especial para texto simples
  let infoContent = '';
  if (item.tipo === 'texto_simples') {
    infoContent = `
      <span class="monitor-item__type">${item.tipo.replace('_', ' ')}</span>
      <span class="monitor-item__mensagem">${item.mensagem}</span>
      ${typeof item.duracao_s !== 'undefined' ? `<span class="monitor-item__duration"><i class="fas fa-clock"></i> ${item.duracao_s}s</span>` : ''}
      <span class="monitor-item__status ${statusClass}"><i class="fas ${statusIcon}"></i> ${statusLabel}</span>
    `;
  } else {
    infoContent = `
      <span class="monitor-item__type">${item.tipo.replace('_', ' ')}</span>
      ${item.arquivo ? `<span class="monitor-item__filename"><i class="fas fa-file"></i> ${item.arquivo}</span>` : ''}
      ${typeof item.duracao_s !== 'undefined' ? `<span class="monitor-item__duration"><i class="fas fa-clock"></i> ${item.duracao_s}s</span>` : ''}
      <span class="monitor-item__status ${statusClass}"><i class="fas ${statusIcon}"></i> ${statusLabel}</span>
    `;
  }

  return `
    <div class="monitor-item">
      <div class="monitor-item__preview">${preview}</div>
      <div class="monitor-item__info">
        ${infoContent}
      </div>
    </div>
  `;
}

function showLoading() {
  const container = document.querySelector('.dashboard-monitors-status__cards');
  container.innerHTML = '<div style="width:100%;text-align:center;padding:2rem 0;color:#003366;font-size:1.1rem;">Carregando monitores...</div>';
}

function getMonitorLabel(id) {
  const monitor = MONITORES.find(m => m.value == id);
  return monitor ? monitor.label : `Monitor ${id}`;
}

window.updateMonitorsStatus = function() {
  const playlist = window.playlistGlobal;
  if (!playlist || !playlist.monitores) return;
  renderMonitorsStatus(playlist.monitores);
};

document.addEventListener('DOMContentLoaded', async function() {

}); 