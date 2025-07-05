export default function EmptyState() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#003366]">
        <i className="fas fa-tv"></i> Status dos Monitores
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[180px]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-tv text-3xl text-gray-300"></i>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#003366]">Nenhum conteúdo adicionado</h3>
        <p className="text-gray-500 text-center max-w-md">
          Use o formulário abaixo para começar a adicionar conteúdo aos monitores
        </p>
      </div>
    </section>
  );
} 