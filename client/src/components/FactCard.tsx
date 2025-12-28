import { Typography } from "./ui";

type FactCardProps = {
  text: string;
};

export function FactCard({ text }: FactCardProps) {
  return (
    <div
      className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-[67.5px] px-2 py-8 sm:h-[135px] sm:w-[135px] sm:py-[43px]"
      style={{
        backgroundImage:
          "linear-gradient(179.84deg, rgba(255, 255, 255, 0.25) 0.14%, rgba(115, 115, 115, 0) 131.99%)",
      }}
    >
      <Typography
        variant="caption"
        className="whitespace-pre-wrap text-center leading-[1.2] text-white sm:text-base"
      >
        {text}
      </Typography>
    </div>
  );
}
