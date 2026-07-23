// Field caption paired with the "N / 3" step counter, per the signup Figma spec.
export default function AuthStepLabel({ text, step }: { text: string; step: number }) {
  return (
    <div
      className="flex w-full items-center justify-between text-sm font-medium"
      style={{ color: '#cfc3cf' }}
    >
      <span>{text}</span>
      <span className="text-base">
        <span style={{ color: '#f5f5f5' }}>{step}</span>
        <span style={{ color: '#e0e0e0' }}> / 3</span>
      </span>
    </div>
  );
}
