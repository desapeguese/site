import BarToolsSkeleton from "./BarToolsSkeleton";
import { MenuSkeleton } from "./MenuSkeleton";

export const HeaderSkeleton = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      <BarToolsSkeleton />
      <MenuSkeleton />
    </header>
  );
};