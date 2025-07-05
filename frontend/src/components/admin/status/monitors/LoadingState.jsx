export default function LoadingState() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#003366]">
        <i className="fas fa-tv"></i> Status dos Monitores
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[180px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando monitores...</p>
        </div>
      </div>
    </section>
  );
} 