export const GET = (req) => {
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
			headers: {
				"Content-Type": "text/html",
			},
		},
	);
};
