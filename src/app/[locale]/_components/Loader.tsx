export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <span className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        <span className="heading-05-bold text-primary">Carregando...</span>
      </div>
    </div>
  );
}
