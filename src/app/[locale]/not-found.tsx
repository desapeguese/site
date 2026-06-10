import PageContainer from "@/components/layout/page-container";
import { BackButton } from "./_components/BackButton";

export default async function NotFoundPage() {
  return (
    <PageContainer scrolllable>
      <div className="relative min-h-screen w-full bg-background overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-50 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-secondary-50 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-tertiary-50 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
          <div className="flex flex-col items-center text-center max-w-2xl">
            <div className="relative">
              <h1 className="text-[10rem] font-black text-primary opacity-20 leading-none select-none md:text-[15rem]">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="heading-03-bold text-primary">Página não encontrada</h2>
              </div>
            </div>

            <p className="mt-8 body-paragraph text-muted-foreground max-w-md">
              A página que você está procurando pode ter sido removida, teve seu nome alterado ou está temporariamente
              indisponível.
            </p>

            <div className="my-12 relative w-48 h-48">
              <div className="absolute inset-0 bg-primary rounded-lg rotate-12 opacity-20"></div>
              <div className="absolute inset-4 bg-primary rounded-lg -rotate-12 opacity-40"></div>
              <div className="absolute inset-8 flex items-center justify-center">
                <span className="text-7xl">😐</span>
              </div>
            </div>

            <div className="space-x-4">
              <BackButton />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export const metadata = {
  title: "Página Não Encontrada | TINA",
  description: "A página solicitada não foi encontrada.",
};
