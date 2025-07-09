import { SessionService } from '../services/SessionService.js';
import { AuthGuard } from '../services/AuthGuard.js';
import { MONITORES } from '../constants/monitors.js';
import { Playlist, PlaylistItem } from '../models/Playlist.js';

class DashboardController {
  constructor() {
    this.timerEl = document.getElementById('session-timer');
    this.logoutBtn = document.getElementById('logout-btn');
    this.timeLeft = 0;
    this.timerInterval = null;
    this.init();
  }

  async init() {
    const isAuthenticated = await AuthGuard.checkAuth();
    if (!isAuthenticated) {
      return; 
    }

    // Se estiver autenticado, continua com a inicialização
    const user = await SessionService.checkSession();
    if (user && user.remainingTime) {
      this.timeLeft = user.remainingTime;
      this.startTimer();
    }
    
    // Verificação periódica de sessão (a cada 30 segundos)
    this.sessionCheckInterval = setInterval(async () => {
      const currentUser = await SessionService.checkSession();
      if (!currentUser) {
        clearInterval(this.sessionCheckInterval);
        AuthGuard.redirectToLogin();
      }
    }, 30000); // 30 segundos
    
    this.logoutBtn.addEventListener('click', async () => {
      await SessionService.logout();
      AuthGuard.redirectToLogin();
    });
  }

  startTimer() {
    this.updateTimerUI();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleSessionExpire();
      }
    }, 1000);
  }

  updateTimerUI() {
    if (this.timerEl) {
      this.timerEl.textContent = this.formatTime(this.timeLeft);
      this.timerEl.classList.remove(
        'dashboard-header__timer--white',
        'dashboard-header__timer--yellow',
        'dashboard-header__timer--red'
      );
      if (!this.timeLeft || this.timeLeft <= 0 || this.timeLeft <= 300) {
        this.timerEl.classList.add('dashboard-header__timer--red');
      } else if (this.timeLeft <= 600) {
        this.timerEl.classList.add('dashboard-header__timer--yellow');
      } else {
        this.timerEl.classList.add('dashboard-header__timer--white');
      }
    }
  }

  formatTime(seconds) {
    if (!seconds || seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async handleSessionExpire() {
    try {
      await SessionService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre redireciona, mesmo se o logout falhar
      AuthGuard.redirectToLogin();
    }
  }
}

// Lógica JS para upload de conteúdo
function setupUploadForm() {
  const tipoSelect = document.getElementById('tipo-conteudo');
  const duracaoInput = document.getElementById('duracao');
  const monitorSelect = document.getElementById('monitor-select');
  const dropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');
  const statusDiv = document.getElementById('upload-status');
  const form = document.getElementById('upload-form');
  const previewBtn = document.getElementById('preview-btn');
  const dropzoneIcon = document.getElementById('dropzone-icon');
  const dropzoneTitle = document.getElementById('dropzone-title');
  const dropzoneDesc = document.getElementById('dropzone-desc');

  let selectedFile = null;
  let imagePreviewUrl = null;
  
  let playlist = null;
  let monitorCards = {};

  async function loadPlaylist() {
    if (window.playlistService && typeof window.playlistService.getPlaylist === 'function') {
      const result = await window.playlistService.getPlaylist();

      if (result.success && result.playlist) {
        playlist = result.playlist;
        window.playlistGlobal = playlist;
        console.log('Playlist carregada do servidor:', JSON.stringify(playlist.toSaveObject(), null, 2));
      } else {
        playlist = Playlist.createEmpty();
        window.playlistGlobal = playlist;
        console.log('Playlist vazia criada localmente.');
      }
    } else {
      playlist = Playlist.createEmpty();
      window.playlistGlobal = playlist;
      console.log('Playlist vazia criada localmente.');
    }
    updateMonitorCards();
    if (window.updateMonitorsStatus) window.updateMonitorsStatus();
  }

  loadPlaylist();

  // Função para obter resolução de arquivo
  function getFileResolution(file) {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
        };
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            aspectRatio: video.videoWidth / video.videoHeight
          });
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve(null);
      }
    });
  }

  // Função para gerar badge de qualidade
  function getResolutionBadge(resolution) {
    if (!resolution) return '';
    const { width, height } = resolution;
    const aspectRatio = width / height;
    if (width >= 1080 && height >= 1920 && Math.abs(aspectRatio - 0.5625) < 0.1) {
      return '<span class="upload-preview-badge upload-preview-badge--good">Full HD Vertical</span>';
    }
    if (width >= 720 && height >= 1280 && aspectRatio > 0.5) {
      return '<span class="upload-preview-badge upload-preview-badge--good">HD Vertical</span>';
    }
    if (aspectRatio > 1) {
      return '<span class="upload-preview-badge upload-preview-badge--error">Horizontal</span>';
    }
    return '<span class="upload-preview-badge upload-preview-badge--warning">Baixa Resolução</span>';
  }

  // Função para adicionar item à playlist
  function addPendingItemToMonitor(monitorId, itemData) {
    if (!playlist) {
      playlist = Playlist.createEmpty();
    }

    const newItem = playlist.addItemToMonitor(monitorId, itemData);
    
    // Atualizar cards dos monitores
    updateMonitorCards();
    
    return newItem;
  }

  // Função para atualizar os cards dos monitores
  function updateMonitorCards() {
    if (!playlist) return;
    
    // Obter itens pendentes da playlist
    const pendingItems = playlist.getPendingItems();
    
    // Agrupar itens por monitor
    const itemsByMonitor = {};
    pendingItems.forEach(item => {
      if (!itemsByMonitor[item.monitorId]) {
        itemsByMonitor[item.monitorId] = [];
      }
      itemsByMonitor[item.monitorId].push(item);
    });

    // Para cada monitor que tem itens pendentes
    Object.keys(itemsByMonitor).forEach(monitorId => {
      const monitorItems = itemsByMonitor[monitorId];
      
      // Procurar card existente do monitor (que já foi carregado pelo MonitorsStatusController)
      let existingCard = null;
      const allCards = document.querySelectorAll('.monitor-card');
      allCards.forEach(card => {
        const titleElement = card.querySelector('.monitor-card__title');
        if (titleElement && titleElement.textContent === getMonitorName(parseInt(monitorId))) {
          existingCard = card;
        }
      });
      
      if (existingCard) {
        // Adicionar itens pendentes ao card existente
        addPendingItemsToExistingCard(existingCard, monitorItems);
      } else {
        // Criar novo card se não existir
        const monitorCard = createMonitorCard(monitorId, getMonitorName(parseInt(monitorId)));
        monitorCards[monitorId] = monitorCard;
        const cardsContainer = document.querySelector('.dashboard-monitors-status__cards');
        if (cardsContainer) {
          cardsContainer.appendChild(monitorCard);
        }
        updateMonitorCardContent(monitorCard, monitorItems);
      }
    });
    
    // Atualizar seção de salvar
    updateSaveActions();
  }

  // Função para obter nome do monitor
  function getMonitorName(monitorId) {
    if (typeof MONITORES !== 'undefined') {
      const monitor = MONITORES.find(m => parseInt(m.value) === monitorId);
      return monitor ? monitor.label : `Monitor ${monitorId + 1}`;
    }
    return `Monitor ${monitorId + 1}`;
  }

  // Função para criar card do monitor
  function createMonitorCard(monitorId, monitorName) {
    const card = document.createElement('div');
    card.className = 'monitor-card';
    card.innerHTML = `
      <div class="monitor-card__header">
        <span class="monitor-card__icon"><i class="fas fa-tv"></i></span>
        <span class="monitor-card__title">${monitorName}</span>
        <span class="monitor-card__count">0 itens</span>
      </div>
      <div class="monitor-card__content">
        <div class="pending-items-list"></div>
      </div>
    `;
    return card;
  }

  // Função para adicionar itens pendentes ao card existente
  function addPendingItemsToExistingCard(card, items) {
    const content = card.querySelector('.monitor-card__content');
    if (!content) return;
    
    // Remover apenas itens pendentes existentes deste monitor
    const existingPendingItems = content.querySelectorAll('.monitor-item[data-pending="true"]');
    existingPendingItems.forEach(item => item.remove());
    
    // Adicionar novos itens pendentes
    items.forEach(item => {
      const pendingItemDiv = document.createElement('div');
      pendingItemDiv.className = 'monitor-item';
      pendingItemDiv.setAttribute('data-pending', 'true');
      
      // Criar preview da imagem/vídeo se disponível
      let preview = '';
      if (item.preview_url && item.tipo === 'imagem') {
        preview = `<img src="${item.preview_url}" alt="${item.arquivo}" class="monitor-item__preview-img" />`;
      } else if (item.preview_url && item.tipo === 'video') {
        preview = `<video src="${item.preview_url}" class="monitor-item__preview-img" controls></video>`;
      } else {
        preview = `<div class="monitor-item__preview-unknown"><i class="fas fa-${item.tipo === 'imagem' ? 'image' : 'video'}"></i></div>`;
      }
      
      pendingItemDiv.innerHTML = `
        <div class="monitor-item__preview">
          ${preview}
        </div>
        <div class="monitor-item__info">
          <span class="monitor-item__type">${item.tipo.replace('_', ' ')}</span>
          <span class="monitor-item__filename"><i class="fas fa-file"></i> <span>${item.arquivo}</span></span>
          <span class="monitor-item__duration"><i class="fas fa-clock"></i> ${item.duracao_s}s</span>
          <span class="monitor-item__status monitor-item__status--pendente"><i class="fas fa-clock"></i> Pendente</span>
        </div>
        <button class="pending-item-remove" onclick="removePendingItem(${item.id})">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      content.appendChild(pendingItemDiv);
    });
    
    // Atualizar contador no header
    const countElement = card.querySelector('.monitor-card__count');
    if (countElement) {
      const totalItems = content.querySelectorAll('.monitor-item').length;
      countElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    }
  }

    // Função para atualizar conteúdo do card do monitor
  function updateMonitorCardContent(card, items) {
    const countElement = card.querySelector('.monitor-card__count');
    const content = card.querySelector('.monitor-card__content');
    
    countElement.textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
    
    // Limpar conteúdo
    content.innerHTML = '';
   
    // Adicionar itens
    items.forEach(item => {
      const pendingItemDiv = document.createElement('div');
      pendingItemDiv.className = 'monitor-item';
      pendingItemDiv.setAttribute('data-pending', 'true');
      
      // Criar preview da imagem/vídeo se disponível
      let preview = '';
      if (item.preview_url && item.tipo === 'imagem') {
        preview = `<img src="${item.preview_url}" alt="${item.arquivo}" class="monitor-item__preview-img" />`;
      } else if (item.preview_url && item.tipo === 'video') {
        preview = `<video src="${item.preview_url}" class="monitor-item__preview-img" controls></video>`;
      } else {
        preview = `<div class="monitor-item__preview-unknown"><i class="fas fa-${item.tipo === 'imagem' ? 'image' : 'video'}"></i></div>`;
      }
      
      pendingItemDiv.innerHTML = `
        <div class="monitor-item__preview">
          ${preview}
        </div>
        <div class="monitor-item__info">
          <span class="monitor-item__type">${item.tipo.replace('_', ' ')}</span>
          <span class="monitor-item__filename"><i class="fas fa-file"></i> <span>${item.arquivo}</span></span>
          <span class="monitor-item__duration"><i class="fas fa-clock"></i> ${item.duracao_s}s</span>
          <span class="monitor-item__status monitor-item__status--pendente"><i class="fas fa-clock"></i> Pendente</span>
        </div>
        <button class="pending-item-remove" onclick="removePendingItem(${item.id})">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      content.appendChild(pendingItemDiv);
    });
  }

  // Função para remover item pendente (global para onclick)
  window.removePendingItem = function(itemId) {
    if (!playlist) return;
    
    // Encontrar o item na playlist
    const pendingItems = playlist.getPendingItems();
    const itemToRemove = pendingItems.find(item => item.id === itemId);
    
    if (itemToRemove) {
      // Remover da playlist
      playlist.removeItemFromMonitor(itemToRemove.monitorId, itemId);
      
      // Remover item dos cards existentes
      const existingCards = document.querySelectorAll('.monitor-card');
      existingCards.forEach(card => {
        const titleElement = card.querySelector('.monitor-card__title');
        if (titleElement && titleElement.textContent === getMonitorName(parseInt(itemToRemove.monitorId))) {
          const pendingItemsInCard = card.querySelectorAll('.monitor-item[data-pending="true"]');
          pendingItemsInCard.forEach(pendingItem => {
            const itemName = pendingItem.querySelector('.monitor-item__filename');
            if (itemName && itemName.textContent.includes(itemToRemove.arquivo)) {
              pendingItem.remove();
              
              // Atualizar contador
              const content = card.querySelector('.monitor-card__content');
              const countElement = card.querySelector('.monitor-card__count');
              if (countElement && content) {
                const totalItems = content.querySelectorAll('.monitor-item').length;
                countElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
              }
            }
          });
        }
      });
    }
    
    updateSaveActions();
  };

  // Função para atualizar a seção de salvar alterações
  function updateSaveActions() {
    const saveBtn = document.getElementById('save-playlist-btn');
    const saveBtnText = document.getElementById('save-btn-text');
    const saveMessage = document.getElementById('save-actions-message');
    const saveStatus = document.getElementById('save-status');
    
    const hasPendingItems = playlist && playlist.hasPendingItems();
    const pendingCount = playlist ? playlist.getPendingItems().length : 0;
    
    if (hasPendingItems) {
      saveBtn.disabled = false;
      saveBtnText.textContent = `Salvar Alterações (${pendingCount} item${pendingCount > 1 ? 's' : ''})`;
      saveMessage.textContent = `Você tem ${pendingCount} item${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''} para enviar. Clique em 'Salvar Alterações' para enviar os arquivos e aplicar as mudanças aos monitores.`;
    } else {
      saveBtn.disabled = true;
      saveBtnText.textContent = 'Nada para Salvar';
      saveMessage.textContent = 'As alterações só serão aplicadas aos monitores após salvar. Certifique-se de revisar todo o conteúdo antes de salvar.';
    }
    
    // Limpar status
    saveStatus.style.display = 'none';
    saveStatus.className = 'dashboard-save-actions__status';
  }

  // Função para salvar playlist (simulação)
  async function savePlaylist() {
    const saveBtn = document.getElementById('save-playlist-btn');
    const saveBtnText = document.getElementById('save-btn-text');
    const saveStatus = document.getElementById('save-status');
    
    if (!playlist || !playlist.hasPendingItems()) {
      saveStatus.textContent = 'Nenhum novo conteúdo para enviar. Adicione novos arquivos antes de salvar.';
      saveStatus.className = 'dashboard-save-actions__status warning';
      saveStatus.style.display = 'block';
      return;
    }

    // LOG DETALHADO DA PLAYLIST ANTES DE SALVAR
    console.log('Playlist que será enviada para o backend:', JSON.stringify(playlist.toSaveObject(), null, 2));

    // Desabilitar botão durante envio
    saveBtn.disabled = true;
    saveBtnText.textContent = 'Salvando...';
    saveStatus.textContent = 'Enviando arquivos e salvando alterações...';
    saveStatus.className = 'dashboard-save-actions__status info';
    saveStatus.style.display = 'block';

    try {
      // Usar o serviço de playlist para salvar
      const result = await window.playlistService.savePlaylist(playlist);
      if (result.success) {
        // Sucesso: atualize a playlist local e a interface
        playlist = result.playlist;
        window.playlistGlobal = playlist;
        updateMonitorCards();
        if (window.updateMonitorsStatus) window.updateMonitorsStatus();
        saveStatus.textContent = result.message || 'Playlist salva com sucesso!';
        saveStatus.className = 'dashboard-save-actions__status success';
        saveStatus.style.display = 'block';
        setTimeout(() => {
          saveStatus.style.display = 'none';
        }, 3000);
      } else {
        // Erro
        saveStatus.textContent = `Erro ao salvar: ${result.message || 'Erro desconhecido'}`;
        saveStatus.className = 'dashboard-save-actions__status error';
        saveStatus.style.display = 'block';
      }
    } catch (error) {
      // Erro de rede
      console.error('Erro ao enviar arquivos:', error);
      saveStatus.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
      saveStatus.className = 'dashboard-save-actions__status error';
      saveStatus.style.display = 'block';
    }
  }

  // Função para resetar formulário e limpar itens pendentes
  function resetFormAndPending() {
    if (playlist) {
      // Criar nova playlist apenas com itens enviados
      const updatedMonitores = playlist.monitores.map(monitor => ({
        id_monitor: monitor.id_monitor,
        itens: (monitor.itens || []).filter(item => {
          if (item instanceof PlaylistItem) {
            return !item.isNew;
          }
          return true;
        })
      })).filter(monitor => monitor.itens.length > 0); // Remover monitores vazios

      playlist = new Playlist({
        monitores: updatedMonitores,
        ultima_atualizacao: new Date().toISOString()
      });
    }
    
    // Limpar apenas itens pendentes dos cards existentes
    const allCards = document.querySelectorAll('.monitor-card');
    allCards.forEach(card => {
      const pendingItems = card.querySelectorAll('.monitor-item[data-pending="true"]');
      pendingItems.forEach(item => item.remove());
      
      // Atualizar contador
      const content = card.querySelector('.monitor-card__content');
      const countElement = card.querySelector('.monitor-card__count');
      if (countElement && content) {
        const totalItems = content.querySelectorAll('.monitor-item').length;
        countElement.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
      }
    });
    
    // Limpar objeto monitorCards
    Object.keys(monitorCards).forEach(monitorId => {
      delete monitorCards[monitorId];
    });
    
    // Resetar formulário
    resetForm();
    
    // Atualizar seção de salvar
    updateSaveActions();
    
    // Mostrar mensagem
    const saveStatus = document.getElementById('save-status');
    saveStatus.textContent = 'Formulário resetado. Itens pendentes foram removidos.';
    saveStatus.className = 'dashboard-save-actions__status info';
    saveStatus.style.display = 'block';
    
    setTimeout(() => {
      saveStatus.style.display = 'none';
    }, 3000);
  }

  function resetForm() {
    form.reset();
    selectedFile = null;
    imagePreviewUrl = null;
    filePreview.style.display = 'none';
    filePreview.innerHTML = '';
    dropzone.style.display = 'block'; // Garantir que dropzone está visível
    statusDiv.textContent = '';
    statusDiv.style.display = 'none';
    statusDiv.classList.remove('success', 'warning', 'error');
    dropzone.classList.remove('dragover');
    dropzoneIcon.innerHTML = '<i class="fas fa-image"></i>';
    dropzoneTitle.textContent = 'Clique ou arraste o arquivo';
    dropzoneDesc.textContent = 'Formatos aceitos: JPG, PNG, GIF, MP4, WEBM, MOV';
  }

  // Troca ícone e instruções conforme tipo
  tipoSelect.addEventListener('change', () => {
    // Reset completo
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    selectedFile = null;
    imagePreviewUrl = null;
    filePreview.style.display = 'none';
    filePreview.innerHTML = '';
    dropzone.style.display = 'block'; // Garantir que dropzone está visível
    statusDiv.textContent = '';
    statusDiv.style.display = 'none';
    statusDiv.classList.remove('success', 'warning', 'error');
    dropzone.classList.remove('dragover');
    
    // Trocar ícone e instruções
    if (tipoSelect.value === 'imagem') {
      dropzoneIcon.innerHTML = '<i class="fas fa-image"></i>';
      dropzoneDesc.textContent = 'Formatos aceitos: JPG, PNG, GIF';
    } else {
      dropzoneIcon.innerHTML = '<i class="fas fa-video"></i>';
      dropzoneDesc.textContent = 'Formatos aceitos: MP4, WEBM, MOV';
    }
  });

  // Drag & drop
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
    dropzoneTitle.textContent = 'Solte o arquivo aqui';
  });
  dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    dropzoneTitle.textContent = 'Clique ou arraste o arquivo';
  });
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file) return;
    // Limpar mensagem de sucesso anterior
    statusDiv.textContent = '';
    statusDiv.style.display = 'none';
    statusDiv.classList.remove('success', 'warning', 'error');
    
    // Validação básica
    const tipo = tipoSelect.value;
    const maxSize = 2 * 1024 * 1024; // 2MB
    const validImage = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (tipo === 'imagem' && !validImage.includes(file.type)) {
      statusDiv.textContent = 'Formato de imagem não suportado.';
      statusDiv.style.display = 'block';
      return;
    }
    if (tipo === 'video' && !validVideo.includes(file.type)) {
      statusDiv.textContent = 'Formato de vídeo não suportado.';
      statusDiv.style.display = 'block';
      return;
    }
    if (file.size > maxSize) {
      statusDiv.textContent = 'Arquivo maior que 2MB.';
      statusDiv.style.display = 'block';
      return;
    }
    selectedFile = file;
    showPreview();
  }

  async function showPreview() {
    if (!selectedFile) return;
    dropzone.style.display = 'none';
    filePreview.style.display = 'flex';
    
    // Obter resolução do arquivo
    const resolution = await getFileResolution(selectedFile);
    const resolutionBadge = getResolutionBadge(resolution);
    
    // Gerar mensagem informativa sobre a resolução (como no React)
    let resolutionMessage = '';
    let messageType = 'info';
    
    if (resolution) {
      const { width, height } = resolution;
      const aspectRatio = width / height;
      
      if (width >= 1080 && height >= 1920 && Math.abs(aspectRatio - 0.5625) < 0.1) {
        resolutionMessage = 'Resolução Full HD Vertical (1080x1920) ou superior - Perfeita!';
        messageType = 'success';
      } else if (width >= 720 && height >= 1280 && aspectRatio > 0.5) {
        resolutionMessage = 'Resolução HD Vertical (720x1280) ou superior - Boa qualidade!';
        messageType = 'success';
      } else if (aspectRatio > 1) {
        resolutionMessage = '⚠️ Imagem horizontal detectada. Para painéis verticais, use proporção 9:16 ou similar.';
        messageType = 'warning';
      } else {
        resolutionMessage = 'Resolução muito baixa. Recomendado: mínimo 720x1280px para boa qualidade.';
        messageType = 'error';
      }
    }
    
    let html = '';
    const tipo = tipoSelect.value;
    if (tipo === 'imagem') {
      imagePreviewUrl = URL.createObjectURL(selectedFile);
      html += `<img src="${imagePreviewUrl}" alt="preview" class="upload-preview-img" />`;
    } else if (tipo === 'video') {
      imagePreviewUrl = URL.createObjectURL(selectedFile);
      html += `<video src="${imagePreviewUrl}" class="upload-preview-video" controls></video>`;
    }
    html += `<div class="upload-preview-details">
      <div class="upload-preview-title">${selectedFile.name}</div>
      ${resolutionBadge}
      <div class="upload-preview-meta">${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • ${selectedFile.type}</div>
      ${resolution ? `<div class="upload-preview-meta">${resolution.width} × ${resolution.height} (${resolution.aspectRatio.toFixed(2)}:1)</div>` : ''}
      <button type="button" class="upload-preview-remove" id="remove-file-btn"><i class="fas fa-times"></i> Remover arquivo</button>
    </div>`;
    filePreview.innerHTML = html;
    
    // Exibir mensagem informativa sobre a resolução
    if (resolutionMessage) {
      statusDiv.textContent = resolutionMessage;
      statusDiv.style.display = 'block';
      statusDiv.className = `upload-status ${messageType === 'success' ? 'success' : messageType === 'warning' ? 'warning' : messageType === 'error' ? 'error' : ''}`;
    } else {
      statusDiv.style.display = 'none';
    }
    
    document.getElementById('remove-file-btn').onclick = () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      selectedFile = null;
      imagePreviewUrl = null;
      filePreview.style.display = 'none'; // Esconder preview
      dropzone.style.display = 'block'; // Mostrar dropzone novamente
      filePreview.innerHTML = '';
      fileInput.value = '';
      statusDiv.textContent = '';
      statusDiv.style.display = 'none';
      statusDiv.classList.remove('success', 'warning', 'error');
    };
  }

  // Visualizar (abre preview em modal simples)
  previewBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!selectedFile) {
      statusDiv.textContent = 'Selecione um arquivo para visualizar.';
      statusDiv.style.display = 'block';
      return;
    }
    // Modal simples
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    let content = '';
    if (tipoSelect.value === 'imagem') {
      content = `<img src="${imagePreviewUrl}" style="max-width:80vw;max-height:80vh;border-radius:1rem;box-shadow:0 2px 16px #0008;" />`;
    } else {
      content = `<video src="${imagePreviewUrl}" controls style="max-width:80vw;max-height:80vh;border-radius:1rem;box-shadow:0 2px 16px #0008;"></video>`;
    }
    modal.innerHTML = `<div>${content}<div style="text-align:center;margin-top:1rem;"><button id="close-modal-btn" style="background:#003366;color:#fff;padding:0.5rem 1.2rem;border:none;border-radius:0.5rem;font-size:1rem;cursor:pointer;">Fechar</button></div></div>`;
    document.body.appendChild(modal);
    document.getElementById('close-modal-btn').onclick = () => {
      document.body.removeChild(modal);
    };
  });

  // Envio do formulário (adicionar à lista de pendentes)
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    if (!selectedFile) {
      statusDiv.textContent = 'Selecione um arquivo para enviar.';
      statusDiv.style.display = 'block';
      return;
    }
    if (!monitorSelect.value) {
      statusDiv.textContent = 'Selecione o monitor de destino.';
      statusDiv.style.display = 'block';
      return;
    }
    if (!duracaoInput.value || duracaoInput.value < 1 || duracaoInput.value > 3600) {
      statusDiv.textContent = 'A duração deve estar entre 1 e 3600 segundos.';
      statusDiv.style.display = 'block';
      return;
    }

    // Criar dados do item
    const itemData = {
      arquivo: selectedFile.name,
      tipo: tipoSelect.value,
      duracao_s: parseInt(duracaoInput.value),
      monitorId: monitorSelect.value,
      file: selectedFile,
      file_size: selectedFile.size,
      file_type: selectedFile.type,
      preview_url: imagePreviewUrl
    };

    try {
      // Adicionar à lista de pendentes
      const newItem = addPendingItemToMonitor(monitorSelect.value, itemData);
      
      // Obter nome do monitor para a mensagem
      const monitorName = getMonitorName(parseInt(monitorSelect.value));
      
      // Mostrar mensagem de sucesso
      statusDiv.textContent = `Conteúdo "${selectedFile.name}" adicionado ao ${monitorName} (ainda não enviado).`;
      statusDiv.style.display = 'block';
      statusDiv.className = 'upload-status success';
      
      // Resetar formulário mas manter mensagem de sucesso
      form.reset();
      selectedFile = null;
      imagePreviewUrl = null;
      filePreview.style.display = 'none';
      filePreview.innerHTML = '';
      dropzone.style.display = 'block';
      dropzone.classList.remove('dragover');
      dropzoneIcon.innerHTML = '<i class="fas fa-image"></i>';
      dropzoneTitle.textContent = 'Clique ou arraste o arquivo';
      dropzoneDesc.textContent = 'Formatos aceitos: JPG, PNG, GIF, MP4, WEBM, MOV';
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      statusDiv.textContent = `Erro ao adicionar item: ${error.message}`;
      statusDiv.style.display = 'block';
      statusDiv.className = 'upload-status error';
    }
  });

  // Event listeners para os botões de salvar e resetar
  const saveBtn = document.getElementById('save-playlist-btn');
  const resetBtn = document.getElementById('reset-form-btn');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', savePlaylist);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFormAndPending);
  }

  // Inicializar seção de salvar
  updateSaveActions();
}

// Função para adicionar novo item SEMPRE usando a playlist carregada do servidor
window.adicionarNovoItemNaPlaylist = function(monitorId, novoItem) {
  // Nunca crie uma nova playlist do zero aqui!
  // Use sempre a playlist carregada do servidor, que já tem os itens antigos
  if (!playlist) {
    console.error('Playlist não carregada! Aguarde o carregamento inicial.');
    return;
  }
  playlist.addItemToMonitor(monitorId, novoItem); // Adiciona ao model (antigos + novos)
  updateMonitorCards(); // Atualiza interface
};
// Ao chamar savePlaylist(), a playlist local (model) já contém todos os itens antigos + novos.
// O método savePlaylist envia a lista completa para o backend, que sobrescreve o playlist.json.

document.addEventListener('DOMContentLoaded', () => {
  new DashboardController();
  const select = document.getElementById('monitor-select');
  if (select && typeof MONITORES !== 'undefined') {
    select.innerHTML = MONITORES.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
  }
  setupUploadForm();
});
