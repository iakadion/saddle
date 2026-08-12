// Signal & Ledger: símbolo modular de sela que conecta storage e compute.
type SaddleMarkProps = {
  className?: string;
  label?: string;
};

export function SaddleMark({ className = "h-9 w-9", label = "Saddle" }: SaddleMarkProps) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}assets/saddle-mark.webp`}
      alt={label}
      width="40"
      height="40"
    />
  );
}

export default SaddleMark;
