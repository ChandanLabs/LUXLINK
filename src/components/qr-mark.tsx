import { useEffect, useState } from "react";

export function QrMark({ value }: { value: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancel = false;
    void import("qrcode")
      .then((mod) =>
        mod.toString(value, {
          type: "svg",
          margin: 1,
          color: { dark: "#f4f1ea", light: "#00000000" },
        }),
      )
      .then((markup) => {
        if (!cancel && markup.trim().startsWith("<svg")) setSvg(markup);
      })
      .catch(() => {
        if (!cancel) setSvg("");
      });
    return () => {
      cancel = true;
    };
  }, [value]);

  return (
    <div className="grid size-36 place-items-center rounded-2xl border border-line bg-raised p-2">
      {svg ? (
        <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <span className="font-mono text-xs text-faint">QR</span>
      )}
    </div>
  );
}
