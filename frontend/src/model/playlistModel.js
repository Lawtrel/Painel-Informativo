export function createPlaylistItem({
  arquivo,
  tipo,
  duracao_s,
  monitorId,
  file = undefined,
  isNew = true,
  status = 'pendente',
  data_criacao = new Date().toISOString(),
  preview_url = null,
  file_size = undefined,
  file_type = undefined,
  mensagem = undefined,
  cor_fundo = undefined,
  cor_texto = undefined
}) {
  return {
    id: Date.now() + Math.random(),
    arquivo,
    tipo,
    duracao_s,
    monitorId: parseInt(monitorId),
    file,
    isNew,
    status, // 'pendente', 'enviado', 'erro'
    data_criacao,
    preview_url,
    file_size,
    file_type,
    mensagem,
    cor_fundo,
    cor_texto
  };
}

// Limpa os itens da playlist para salvar (remove campos desnecessários)
export function cleanPlaylistForSave(monitores) {
  return monitores.map(monitor => ({
    id_monitor: monitor.id_monitor,
    itens: (monitor.itens || []).map(item => {
      const { arquivo, tipo, duracao_s, mensagem, cor_fundo, cor_texto } = item;
      const obj = { tipo, duracao_s };
      if (arquivo) obj.arquivo = arquivo;
      if (mensagem) obj.mensagem = mensagem;
      if (cor_fundo) obj.cor_fundo = cor_fundo;
      if (cor_texto) obj.cor_texto = cor_texto;
      return obj;
    })
  }));
}
