export default function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: ((i * 37 + 13) % 97).toFixed(2),
    y: ((i * 53 + 7) % 93).toFixed(2),
    size: i % 4 === 0 ? 4 : i % 4 === 1 ? 3 : 2,
    dur: `${2 + (i % 5) * 0.4}s`,
    delay: `${(i * 0.23) % 3}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            ["--star-dur" as string]: s.dur,
            ["--star-delay" as string]: s.delay,
          }}
        />
      ))}
    </div>
  );
}
