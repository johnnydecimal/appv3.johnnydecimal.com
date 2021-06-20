export const LogViewer = ({ log }: { log: string[] }) => (
  <div>
    {log.map((entry: string, i: number) => (
      <p
        className="mt-1"
        dangerouslySetInnerHTML={{ __html: entry }}
        key={i}
        style={{ paddingLeft: "10ch", textIndent: "-10ch" }}
      ></p>
    ))}
  </div>
);
