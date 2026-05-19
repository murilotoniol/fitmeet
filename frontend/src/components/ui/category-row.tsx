import { cn } from "@/lib/utils";

import { CategoryCard } from "./category-card";

type CategoryItem = {
  id: string | number;
  title: string;
  image: string;
  selected?: boolean;
  onClick?: () => void;
};

type CategoryRowProps = {
  items: CategoryItem[];
  className?: string;
};

function CategoryRow({ items, className }: CategoryRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full gap-6 overflow-x-auto pb-2 [scrollbar-width:thin]",
        className,
      )}
    >
      {items.slice(0, 12).map((item) => (
        <CategoryCard
          key={item.id}
          title={item.title}
          image={item.image}
          selected={item.selected}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}

export { CategoryRow };
