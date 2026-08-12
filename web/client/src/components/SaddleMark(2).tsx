// Signal & Ledger: símbolo modular de sela que conecta storage e compute.
type SaddleMarkProps = {
  className?: string;
  label?: string;
};

export function SaddleMark({ className = "h-9 w-9", label = "Saddle" }: SaddleMarkProps) {
  return (
    <img
      className={className}
      src="/manus-storage/saddle-mark_fc46a721.png"
      alt={label}
      width="40"
      height="40"
    />
  );
}

export default SaddleMark;
