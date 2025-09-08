export const GET = (req) => {
    const headers = new Headers({
        "Content-Type": "text/html",
    });
    const origin = req.headers.get("origin") || "*";
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Vary", "Origin");

    return new Response(
        `<html><body>
  
  This server caches official kicad mod files, here is the <a href="https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/LICENSE.md?ref_type=heads">license file</a> and <a href="https://gitlab.com/kicad/libraries/kicad-footprints">original repo</a>
    <p>
    Example URL: <a href="/Resistor_SMD.pretty/R_0402_1005Metric.kicad_mod">/Resistor_SMD.pretty/R_0402_1005Metric.kicad_mod</a>
    </p>
    <p>
    You can also load the circuit json equivalent of the mod file by replacing the .kicad_mod with .circuit.json
    <a href="/Resistor_SMD.pretty/R_0402_1005Metric.circuit.json">/Resistor_SMD.pretty/R_0402_1005Metric.circuit.json</a>
    </p>
  
  </body></html>`,
        {
            headers,
        },
    );
};

export const OPTIONS = (req) => {
    const headers = new Headers();
    const origin = req.headers.get("origin") || "*";
    const reqMethod = req.headers.get("access-control-request-method") || "GET";
    const reqHeaders = req.headers.get("access-control-request-headers") || "Content-Type";

    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", `${reqMethod}, OPTIONS`);
    headers.set("Access-Control-Allow-Headers", reqHeaders);
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");

    return new Response(null, { status: 204, headers });
};
