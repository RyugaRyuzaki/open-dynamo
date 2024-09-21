import {Skeleton} from "@/components/ui/skeleton";
const length = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SuspensePage = () => {
  return (
    <div className="w-[80%] mx-auto">
      {length.map((item: number, index: number) => (
        <div
          key={`${item}-${index}`}
          className="flex items-center space-x-4 my-1"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[calc(100%-12rem)]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuspensePage;
