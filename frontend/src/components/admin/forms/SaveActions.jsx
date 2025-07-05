export default function SaveActions({ savePlaylist, loading, status, hasPendingItems, resetForm }) {

  async function handleSave() {
    await savePlaylist();
  }

  function handleReset() {
    resetForm();
  }

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-[#003366]"><i className="fas fa-save"></i> Salvar Alterações</h2>
        <p className="text-gray-600">Após adicionar todos os itens desejados, salve as alterações para aplicá-las aos monitores</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-[#003366]/10">
        <div className="flex items-center gap-2 text-[#003366]">
          <i className="fas fa-info-circle text-xl"></i>
          <div>
            <h4 className="font-bold">Importante</h4>
            <p className="text-gray-600">
              {hasPendingItems 
                ? "Você tem conteúdo pendente para enviar. Clique em 'Salvar Alterações' para enviar os arquivos e aplicar as mudanças aos monitores."
                : "As alterações só serão aplicadas aos monitores após salvar. Certifique-se de revisar todo o conteúdo antes de salvar."
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={loading || !hasPendingItems}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-colors ${
              hasPendingItems 
                ? 'bg-[#003366] text-white hover:bg-[#00509E] disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {hasPendingItems ? 'Salvar Alterações' : 'Nada para Salvar'}
              </>
            )}
          </button>
          <button 
            onClick={handleReset}
            className="flex cursor-pointer items-center gap-2 border border-[#003366] text-[#003366] px-4 py-2 rounded-lg font-semibold hover:bg-[#003366]/10 transition-colors"
          >
            <i className="fas fa-undo"></i> 
            Resetar Formulário
          </button>
        </div>
      </div>
      {status.message && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 shadow-sm border ${status.type === 'error' ? 'bg-red-100 text-red-700 border-red-200' : status.type === 'success' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-[#003366] border-[#003366]/20'}`}>
          <i className={`fas ${status.type === 'error' ? 'fa-times-circle' : status.type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
          {status.message}
        </div>
      )}
    </section>
  );
} 