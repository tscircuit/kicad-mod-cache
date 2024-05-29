const fs = await import("fs")
const vfs = (await import("./vfs.js")).default

const filepaths = Object.keys(vfs)

fs.writeFileSync("public/kicad_files.json", JSON.stringify(filepaths))
fs.writeFileSync(
  "public/index.html",
  `<html><body>
  
This server hosts official kicad mod files, here is the <a href="https://gitlab.com/kicad/libraries/kicad-footprints/-/blob/master/LICENSE.md?ref_type=heads">license file</a> and <a href="https://gitlab.com/kicad/libraries/kicad-footprints">original repo</a>

</body></html>`
)
