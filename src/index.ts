#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Tool schemas
const FileFormatInfoSchema = z.object({
  format: z.enum(["STL", "3MF", "GCODE", "OBJ", "STEP"]),
});

const Print3MFInfoSchema = z.object({
  aspect: z.enum(["structure", "compatibility", "metadata", "all"]),
});

const PrintSettingsSchema = z.object({
  material: z.string().optional(),
  layerHeight: z.number().optional(),
  infill: z.number().optional(),
  printSpeed: z.number().optional(),
});

const TroubleshootingSchema = z.object({
  issue: z.string(),
  printerModel: z.string().optional(),
});

const MaterialSelectorSchema = z.object({
  partType: z.string(),
  requirements: z.string().optional(),
});

// MCP Server instance
const server = new Server(
  {
    name: "bambu-studio-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: "get_file_format_info",
    description:
      "Get detailed information about 3D printing file formats (STL, 3MF, G-code, OBJ, STEP) including their purposes, capabilities, and when to use them in Bambu Studio.",
    inputSchema: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["STL", "3MF", "GCODE", "OBJ", "STEP"],
          description: "The file format to get information about",
        },
      },
      required: ["format"],
    },
  },
  {
    name: "get_3mf_info",
    description:
      "Get comprehensive information about 3MF files in Bambu Studio, including structure, compatibility, metadata handling, and best practices.",
    inputSchema: {
      type: "object",
      properties: {
        aspect: {
          type: "string",
          enum: ["structure", "compatibility", "metadata", "all"],
          description:
            "Which aspect of 3MF to learn about: structure, compatibility with other slicers, metadata, or all",
        },
      },
      required: ["aspect"],
    },
  },
  {
    name: "recommend_print_settings",
    description:
      "Get recommendations for optimal print settings in Bambu Studio based on material type, desired quality, and print requirements.",
    inputSchema: {
      type: "object",
      properties: {
        material: {
          type: "string",
          description: "Material type (e.g., PLA, PETG, ABS, TPU)",
        },
        layerHeight: {
          type: "number",
          description: "Desired layer height in mm (e.g., 0.2)",
        },
        infill: {
          type: "number",
          description: "Infill percentage (0-100)",
        },
        printSpeed: {
          type: "number",
          description: "Desired print speed in mm/s",
        },
      },
    },
  },
  {
    name: "troubleshoot_issue",
    description:
      "Get troubleshooting guidance for common Bambu Studio and 3D printing issues, including print failures, quality problems, and software issues.",
    inputSchema: {
      type: "object",
      properties: {
        issue: {
          type: "string",
          description:
            "Description of the issue or problem (e.g., 'first layer not sticking', 'stringing', 'layer shifting')",
        },
        printerModel: {
          type: "string",
          description: "Bambu Lab printer model (e.g., X1, P1P, A1)",
        },
      },
      required: ["issue"],
    },
  },
  {
    name: "select_material",
    description:
      "Get recommendations for selecting the right material for a 3D printing project based on part requirements and use case.",
    inputSchema: {
      type: "object",
      properties: {
        partType: {
          type: "string",
          description:
            "Type of part being printed (e.g., 'functional mechanical part', 'decorative item', 'outdoor use')",
        },
        requirements: {
          type: "string",
          description:
            "Specific requirements like strength, flexibility, heat resistance, or aesthetics",
        },
      },
      required: ["partType"],
    },
  },
];

// Tool handlers
async function handleGetFileFormatInfo(format: string): Promise<string> {
  const formatInfo: Record<string, string> = {
    STL: `**STL (STereoLithography) File Format**

**Purpose**: Represents 3D geometry as a triangular mesh - the most basic and universal 3D model format.

**Key Characteristics**:
- Contains ONLY geometry data (the shape of your model)
- No color, texture, or material information
- No print settings or metadata
- Binary or ASCII format

**When to Use in Bambu Studio**:
- Importing basic 3D models for slicing
- Maximum compatibility with other software
- When you only need the geometry
- Exporting models from CAD software

**Limitations**:
- No embedded print settings
- Cannot store multi-material or multi-color information
- Larger file sizes for complex models compared to 3MF
- No project management features

**Best Practice**: Use STL for simple imports, but switch to 3MF for saving projects with settings.`,

    "3MF": `**3MF (3D Manufacturing Format) File Format**

**Purpose**: Modern, comprehensive format for 3D printing that includes geometry, settings, and metadata in a ZIP-based container.

**Key Characteristics**:
- Contains geometry, print settings, colors, materials
- Compressed ZIP archive format
- Industry standard supported by major slicers
- Can include thumbnails and previews
- Supports multi-material and multi-color prints

**Bambu Studio Variants**:
1. **Standard 3MF**: Full project files with settings
2. **.gcode.3mf**: Ready-to-print files with embedded G-code
3. **Generic 3MF**: Compatible with other slicers (Core Spec)
4. **Bambu 3MF**: Uses 3MF Production Extension for faster loading

**When to Use in Bambu Studio**:
- Saving complete projects with all settings
- Sharing projects with others
- Multi-color or multi-material prints
- When you need to preserve layer heights, speeds, etc.
- Archiving print-ready files

**Best Practice**: Use 3MF as your primary project format. Export as "Generic 3MF" for compatibility with other slicers.`,

    GCODE: `**G-code File Format**

**Purpose**: Machine instruction language that tells the 3D printer exactly how to move, heat, and extrude to create your object.

**Key Characteristics**:
- Plain text file with commands (G0, G1, M104, etc.)
- Printer-specific (tailored for your exact printer model)
- Contains temperatures, speeds, movements, extrusion amounts
- Human-readable but complex
- Ready-to-print format

**Bambu Studio Usage**:
- Generated by slicing STL or 3MF files
- Often embedded in .gcode.3mf files
- Can be exported as standalone .gcode files
- Includes printer-specific optimizations

**When to Use**:
- Sending directly to printer
- Final output after slicing
- When you don't need to modify the model
- Quick prints without re-slicing

**Limitations**:
- Cannot be re-sliced or modified
- Printer-specific (won't work on different models)
- No geometry data (can't view the original model)
- Settings are "baked in"

**Best Practice**: Keep the source 3MF files for future modifications; G-code is your final output format.`,

    OBJ: `**OBJ (Wavefront Object) File Format**

**Purpose**: Standard 3D geometry format that can include color and texture information.

**Key Characteristics**:
- Contains 3D geometry (vertices, faces)
- Can include vertex colors and textures
- Plain text format (human-readable)
- Widely supported in 3D modeling software
- Often paired with .mtl (material) files

**When to Use in Bambu Studio**:
- Importing colored models from 3D modeling software
- Models with texture information
- When STL doesn't preserve needed color data
- Converting from graphics/animation software

**Advantages over STL**:
- Supports vertex colors
- Can reference texture files
- Better for multi-color models

**Limitations**:
- Larger file sizes than STL
- No print settings or metadata
- Less common in 3D printing than STL

**Best Practice**: Use OBJ when importing models with color data, then save as 3MF for your print project.`,

    STEP: `**STEP (Standard for the Exchange of Product Data) File Format**

**Purpose**: CAD-native format that preserves precise engineering geometry and assembly information.

**Key Characteristics**:
- Preserves exact CAD geometry (curves, surfaces, assemblies)
- Contains precise mathematical representations
- Maintains tolerance and measurement data
- Can include assembly relationships
- Industry standard for engineering (ISO 10303)

**When to Use in Bambu Studio**:
- Importing from CAD software (SolidWorks, Fusion 360, etc.)
- Engineering and functional parts requiring precision
- Parts with exact dimensions and tolerances
- Complex assemblies that need to be printed separately

**Advantages**:
- More accurate than STL mesh approximations
- Preserves design intent
- Better for technical/engineering parts
- Can maintain assembly structure

**Bambu Studio Support**:
- Native STEP import support
- Converts to mesh for slicing
- Preserves better detail than STL conversion
- Good for high-precision parts

**Best Practice**: Use STEP for importing CAD models; it provides better accuracy than converting to STL first.`,
  };

  return (
    formatInfo[format] ||
    "Format information not available for the specified format."
  );
}

async function handleGet3MFInfo(aspect: string): Promise<string> {
  const info: Record<string, string> = {
    structure: `**3MF File Structure in Bambu Studio**

3MF files are ZIP archives with a specific structure:

\`\`\`
my-project.3mf (ZIP archive)
├── [Content_Types].xml          # MIME types for contents
├── _rels/                        # Relationship definitions
│   └── .rels                     # Root relationships
├── 3D/                           # 3D model data
│   ├── 3dmodel.model             # Main model file (XML)
│   └── Metadata/
│       ├── thumbnail.png         # Preview image
│       └── model_settings.xml    # Print settings
├── Metadata/                     # Project metadata
│   ├── Slic3r_PE.config          # Slicer configuration
│   └── Slic3r_PE_model.config    # Model-specific settings
└── Bambu/                        # Bambu-specific data
    ├── project_settings.json     # Project settings
    └── auxiliary.xml             # Auxiliary data

**Key Components**:

1. **3dmodel.model**: XML file with mesh geometry, vertices, triangles
2. **Metadata**: Print settings, speeds, temperatures, materials
3. **Thumbnails**: Preview images for file browsers and printer screens
4. **Relationships**: Links between files and resources

**Bambu Studio Extensions**:
- Uses 3MF Production Extension for faster I/O
- Splits large models across multiple files
- Includes Bambu-specific settings and profiles

**Extraction**: You can rename .3mf to .zip and extract contents for inspection or programmatic access.`,

    compatibility: `**3MF Compatibility in Bambu Studio**

**Bambu Studio 3MF Variants**:

1. **Standard Bambu 3MF** (Default)
   - Uses 3MF Production Extension
   - Faster save/load times
   - Optimized for large projects
   - **May not open in other slicers** (Cura, PrusaSlicer)

2. **Generic 3MF** (Export Option)
   - Uses 3MF Core Specification
   - Compatible with most slicers
   - Slightly slower to load
   - Universal compatibility

3. **.gcode.3mf** (Ready-to-Print)
   - Contains pre-sliced G-code
   - Ready for printing immediately
   - Printer-specific
   - Cannot be re-sliced

**Compatibility Issues**:

**Problem**: Other slicers can't open Bambu 3MF files
- **Cause**: Bambu uses Production Extension by default
- **Solution**: Export as "Generic 3MF" or "Export to 3MF (Core Spec)"

**Cross-Slicer Workflow**:
1. In Bambu Studio: File → Export → Export to 3MF (Core Spec)
2. Now compatible with Cura, PrusaSlicer, Simplify3D
3. May lose some Bambu-specific settings

**Importing from Other Slicers**:
- Most 3MF files from other slicers import fine
- Some settings may need adjustment
- Material profiles might not match
- Check speeds and temperatures after import

**Best Practices**:
- Use standard Bambu 3MF for your own projects
- Export Generic 3MF when sharing with users of other slicers
- Keep both versions if cross-compatibility is needed
- Test imports from other slicers before important prints`,

    metadata: `**3MF Metadata in Bambu Studio**

3MF files can contain extensive metadata beyond geometry:

**Embedded Information**:

1. **Print Settings**
   - Layer heights (initial, standard, sparse)
   - Print speeds (outer wall, inner wall, infill, travel)
   - Temperatures (nozzle, bed, chamber)
   - Cooling settings (fan speeds by layer)

2. **Material Profiles**
   - Filament type (PLA, PETG, ABS, etc.)
   - Color information
   - Brand and product details
   - Material-specific settings

3. **Model Properties**
   - Model scale and orientation
   - Support structures configuration
   - Per-model print settings overrides
   - Object arrangement on plate

4. **Project Configuration**
   - Printer profile (X1, P1P, A1, etc.)
   - Plate configuration (build volume)
   - Multi-plate projects
   - Assembly instructions

5. **Visual Elements**
   - Thumbnail images (for file browsers)
   - Layer preview images
   - Print time and material estimates
   - Slicing timestamp

**Accessing Metadata**:
- Bambu Studio UI: Right-click → Properties
- Command line: Rename to .zip and extract
- Programmatic: Parse XML/JSON files inside

**Using Metadata**:
- Quick project identification
- Reproducing successful prints
- Sharing complete print profiles
- Archiving print configurations
- Quality control and documentation

**Privacy Note**: 3MF files may contain user information, machine IDs, and timestamps. Review before sharing publicly.`,

    all: `**Complete 3MF Guide for Bambu Studio**

[See individual aspects: structure, compatibility, and metadata for full details]

**Quick Reference**:

**What is 3MF?**
ZIP-based archive containing 3D geometry, print settings, metadata, and resources.

**Bambu Studio Versions**:
- Standard: Fast, uses Production Extension (Bambu-only)
- Generic: Core Spec, compatible with all slicers
- .gcode.3mf: Ready-to-print with embedded G-code

**File Structure**:
- 3D/3dmodel.model: Geometry (XML mesh)
- Metadata/: Settings and configurations
- Thumbnails: Preview images
- Relationships: File connections

**Compatibility**:
- Bambu to Other Slicers: Export as "Generic 3MF"
- Other Slicers to Bambu: Usually works, check settings
- Within Bambu: Full compatibility

**Best Practices**:
1. Use 3MF as primary project format (not STL)
2. Save complete projects with all settings
3. Export Generic 3MF for sharing
4. Keep source files separate from print-ready exports
5. Use descriptive filenames with version numbers
6. Back up important projects with all metadata

**When to Use Each Format**:
- **3MF**: All project work, archiving, sharing within Bambu
- **Generic 3MF**: Sharing with other slicer users
- **.gcode.3mf**: Ready-to-print, send to printer
- **STL**: Only for basic geometry exchange

**Pro Tips**:
- 3MF files are ZIP archives - can extract and inspect
- Metadata includes all settings for perfect reproduction
- Thumbnails help organize your project library
- Production Extension = faster but less compatible`,
  };

  return (
    info[aspect] || "Information not available for the specified aspect."
  );
}

async function handleRecommendPrintSettings(params: {
  material?: string;
  layerHeight?: number;
  infill?: number;
  printSpeed?: number;
}): Promise<string> {
  const { material, layerHeight, infill, printSpeed } = params;

  let recommendations = "**Print Settings Recommendations for Bambu Studio**\n\n";

  // Material-specific recommendations
  if (material) {
    const materialLower = material.toLowerCase();
    recommendations += `**Material: ${material.toUpperCase()}**\n\n`;

    if (materialLower.includes("pla")) {
      recommendations += `**PLA Settings**:
- **Nozzle Temperature**: 200-220°C (start at 210°C)
- **Bed Temperature**: 50-60°C (optional, helps adhesion)
- **Print Speed**: 50-100 mm/s (60 mm/s recommended)
- **Cooling**: 100% after first layer
- **Retraction**: 0.5-1.0mm at 35mm/s
- **Layer Height**: 0.08-0.28mm (0.2mm standard)

**Tips**: PLA is forgiving and easy to print. Good bed adhesion with clean glass or PEI. Use brim for small footprints.

`;
    } else if (materialLower.includes("petg")) {
      recommendations += `**PETG Settings**:
- **Nozzle Temperature**: 230-250°C (start at 240°C)
- **Bed Temperature**: 70-90°C (80°C recommended)
- **Print Speed**: 40-60 mm/s (50 mm/s recommended)
- **Cooling**: 30-50% (less than PLA)
- **Retraction**: 1.0-2.0mm at 25mm/s
- **Layer Height**: 0.12-0.28mm (0.2mm standard)

**Tips**: PETG is stronger than PLA but more stringy. Reduce cooling, increase retraction. Clean bed with IPA. Slower is better.

`;
    } else if (materialLower.includes("abs")) {
      recommendations += `**ABS Settings**:
- **Nozzle Temperature**: 240-260°C (start at 250°C)
- **Bed Temperature**: 90-110°C (100°C recommended)
- **Chamber Temperature**: 40-60°C (if available)
- **Print Speed**: 40-60 mm/s
- **Cooling**: Minimal (0-20%, off for first layers)
- **Retraction**: 0.5-1.0mm at 40mm/s
- **Layer Height**: 0.12-0.3mm (0.2mm standard)

**Tips**: ABS requires enclosed printer and good ventilation. Warping is common - use brim or raft. Keep chamber warm.

`;
    } else if (materialLower.includes("tpu") || materialLower.includes("flex")) {
      recommendations += `**TPU/Flexible Filament Settings**:
- **Nozzle Temperature**: 210-230°C (start at 220°C)
- **Bed Temperature**: 40-60°C (optional)
- **Print Speed**: 15-30 mm/s (SLOW!)
- **Cooling**: 50-100%
- **Retraction**: 0.5-1.0mm at 15mm/s (or disable)
- **Layer Height**: 0.12-0.28mm (0.2mm standard)

**Tips**: Print VERY slowly. Reduce retraction or disable. Direct drive extruders work best. Increase extrusion multiplier slightly.

`;
    } else {
      recommendations += `**General Material Guidance**:
- Research specific temperatures for your material
- Start with manufacturer recommendations
- Perform temperature tower tests
- Adjust based on results
- Document successful settings for future use

`;
    }
  }

  // Layer height recommendations
  if (layerHeight) {
    recommendations += `**Layer Height: ${layerHeight}mm**\n\n`;

    if (layerHeight <= 0.12) {
      recommendations += `**Fine/Detail Settings** (${layerHeight}mm):
- Excellent surface quality
- Visible layer lines minimal
- Print time: VERY LONG (3-4x standard)
- Best for: Miniatures, detailed parts, prototypes
- Speed: Reduce to 40-60% of normal
- First layer: Use same height or slightly larger

`;
    } else if (layerHeight <= 0.20) {
      recommendations += `**Standard/Balanced Settings** (${layerHeight}mm):
- Good balance of quality and speed
- Layer lines visible but acceptable
- Print time: Normal/standard
- Best for: General purpose, functional parts
- Speed: Normal/standard for material
- First layer: Can use same or 0.2mm

`;
    } else if (layerHeight <= 0.28) {
      recommendations += `**Fast/Draft Settings** (${layerHeight}mm):
- Faster prints, more visible layers
- Good for prototypes and test prints
- Print time: 30-50% faster than standard
- Best for: Rough drafts, internal parts, non-visible
- Speed: Can increase 10-20%
- First layer: Use 0.2mm for better adhesion

`;
    } else {
      recommendations += `**Very Fast/Rough Settings** (${layerHeight}mm):
- Very fast but rough surface
- Significant layer lines
- Print time: Very short
- Best for: Concept models, testing only
- Speed: Moderate (material dependent)
- Note: May reduce strength
- First layer: Use 0.2-0.25mm for adhesion

`;
    }
  }

  // Infill recommendations
  if (infill !== undefined) {
    recommendations += `**Infill: ${infill}%**\n\n`;

    if (infill === 0) {
      recommendations += `**0% Infill (Vase Mode)**:
- Single wall, no infill, no top layers
- Very fast and material-efficient
- Use for: Decorative vases, lamp shades
- Requires: Vase mode enabled
- Note: Not structurally strong

`;
    } else if (infill <= 10) {
      recommendations += `**Low Infill (${infill}%)**:
- Minimal internal structure
- Fast and material-efficient
- Use for: Decorative items, non-load bearing
- Strength: Low
- Pattern: Grid or Lines

`;
    } else if (infill <= 20) {
      recommendations += `**Standard Infill (${infill}%)**:
- Good balance of strength and efficiency
- Most common for general prints
- Use for: Most functional parts, everyday objects
- Strength: Moderate
- Pattern: Grid, Cubic, or Gyroid

`;
    } else if (infill <= 50) {
      recommendations += `**High Infill (${infill}%)**:
- Strong internal structure
- Longer print time, more material
- Use for: Load-bearing parts, mechanical components
- Strength: High
- Pattern: Cubic, Gyroid, or Honeycomb

`;
    } else {
      recommendations += `**Very High/Solid Infill (${infill}%)**:
- Very strong, nearly solid
- Long print time, high material use
- Use for: Maximum strength, threaded inserts, critical parts
- Strength: Very High
- Pattern: Cubic or Gyroid (or 100% for solid)
- Note: Diminishing returns above 80%

`;
    }
  }

  // Print speed recommendations
  if (printSpeed) {
    recommendations += `**Print Speed: ${printSpeed} mm/s**\n\n`;

    if (printSpeed <= 40) {
      recommendations += `**Slow/Precise Speed (${printSpeed} mm/s)**:
- High quality output
- Best layer adhesion
- Use for: Detailed parts, difficult materials
- Trade-off: Longer print times
- Good for: ABS, PETG, flexible filaments

`;
    } else if (printSpeed <= 80) {
      recommendations += `**Standard Speed (${printSpeed} mm/s)**:
- Balanced quality and speed
- Good for most materials
- Use for: General printing, PLA, PETG
- Most reliable setting
- Recommended for: Daily use

`;
    } else if (printSpeed <= 150) {
      recommendations += `**Fast Speed (${printSpeed} mm/s)**:
- Quick prints with some quality trade-off
- Requires good printer calibration
- Use for: PLA, simple geometries, drafts
- May need: Lower acceleration, higher temps
- Best for: Bambu Lab's high-speed printers

`;
    } else {
      recommendations += `**Very Fast Speed (${printSpeed} mm/s)**:
- Maximum speed, optimized for Bambu printers
- Requires: Excellent calibration
- Use for: PLA only (mostly)
- May need: Input shaping, pressure advance tuning
- Trade-off: Some quality loss, higher wear
- Best for: X1 Carbon with proper tuning

`;
    }
  }

  // General recommendations
  recommendations += `\n**General Bambu Studio Tips**:

1. **Start Conservative**: Begin with standard settings and adjust
2. **One Change at a Time**: Test individual setting changes
3. **Use Presets**: Bambu Studio has excellent material presets
4. **Calibration First**: Ensure printer is properly calibrated
5. **Temperature Towers**: Test optimal temperatures for each material
6. **Document Success**: Save profiles of successful prints
7. **Material Matters**: Quality filament makes a big difference

**Bambu-Specific Features**:
- Use **Flow Calibration** for each material
- Enable **Adaptive Layer Height** for curved surfaces
- Use **Arch Move** algorithm for smoother curves
- Enable **Pressure Advance** for cleaner corners
- Consider **AMS** profiles for multi-color/material

**Quick Troubleshooting**:
- Poor adhesion: Increase bed temp, slow first layer
- Stringing: Increase retraction, lower temperature
- Layer shifting: Reduce speed, check belts
- Warping: Increase bed temp, use brim/raft, enclose printer
`;

  return recommendations;
}

async function handleTroubleshootIssue(
  issue: string,
  printerModel?: string
): Promise<string> {
  const issueLower = issue.toLowerCase();
  let troubleshooting = `**Troubleshooting: ${issue}**\n`;

  if (printerModel) {
    troubleshooting += `**Printer Model: ${printerModel}**\n\n`;
  }

  // Adhesion issues
  if (
    issueLower.includes("adhesion") ||
    issueLower.includes("stick") ||
    issueLower.includes("first layer")
  ) {
    troubleshooting += `**First Layer / Bed Adhesion Issues**

**Common Causes & Solutions**:

1. **Bed Not Level or Too Far**:
   - Run automatic bed leveling in Bambu Studio
   - Check Z-offset adjustment
   - Ensure bed is clean and flat

2. **Bed Temperature Too Low**:
   - PLA: Increase to 60°C
   - PETG: Increase to 80-85°C
   - ABS: Increase to 100-110°C

3. **Print Speed Too Fast**:
   - Slow first layer to 20-30 mm/s
   - Increase first layer flow to 105-110%

4. **Bed Surface Issues**:
   - Clean with IPA (isopropyl alcohol)
   - Replace textured sheet if worn
   - Use glue stick for difficult materials

5. **Z-Offset Adjustment**:
   - In Bambu Studio: Printer Settings → Z-offset
   - Decrease by -0.05mm increments
   - First layer should slightly squish

**Bambu Studio Settings**:
- Enable "Brim" for small parts (5-10mm)
- Use "Raft" for warping materials
- Increase "First layer height" to 0.2-0.25mm
- Enable "Slow down for better layer adhesion"

`;
  }

  // Stringing issues
  if (
    issueLower.includes("string") ||
    issueLower.includes("oozing") ||
    issueLower.includes("hair")
  ) {
    troubleshooting += `**Stringing / Oozing Issues**

**Causes & Solutions**:

1. **Temperature Too High**:
   - Reduce nozzle temp by 5-10°C
   - Print temperature tower to find optimal temp
   - Lower temps reduce oozing

2. **Retraction Settings**:
   - Increase retraction distance (0.5-2mm)
   - Increase retraction speed (25-45 mm/s)
   - For direct drive: 0.5-1mm
   - For Bowden: 4-6mm

3. **Travel Speed Too Slow**:
   - Increase travel speed to 150-200 mm/s
   - Enable "Avoid crossing perimeters"
   - Use "Z-hop on retraction" (0.2-0.4mm)

4. **Material Issues**:
   - Wet filament causes stringing
   - Dry filament before use
   - Store in dry box with desiccant

5. **Combing Settings**:
   - Enable "Only retract when crossing perimeters"
   - Use "Avoid crossing perimeters" when possible

**Bambu Studio Settings**:
- Print Settings → Retraction
- Enable "Wipe while retracting"
- Increase "Extra length on restart" if under-extruding after retract
- Test with small stringing test models

`;
  }

  // Layer shifting
  if (
    issueLower.includes("layer shift") ||
    issueLower.includes("misalign") ||
    issueLower.includes("offset")
  ) {
    troubleshooting += `**Layer Shifting Issues**

**Causes & Solutions**:

1. **Mechanical Issues**:
   - Check belt tension (should twang when plucked)
   - Inspect pulleys for damage
   - Ensure motors are secure
   - Check for obstructions in motion path

2. **Speed Too High**:
   - Reduce print speed by 30-50%
   - Lower acceleration settings
   - Reduce jerk/junction deviation

3. **Motor Current Too Low**:
   - May need firmware adjustment
   - Check for overheating stepper drivers
   - Ensure adequate cooling

4. **Electrical Issues**:
   - Check cable connections
   - Test motor drivers
   - Look for loose connections

5. **Mechanical Binding**:
   - Clean and lubricate linear rails
   - Check for debris in motion system
   - Ensure proper assembly

**Immediate Steps**:
1. Slow down print speed to 50 mm/s
2. Check all belt tensions
3. Verify all cables are secure
4. Clean motion system

**Bambu-Specific**:
- Run self-test diagnostics
- Check for firmware updates
- Verify CoreXY mechanism alignment

`;
  }

  // Warping
  if (
    issueLower.includes("warp") ||
    issueLower.includes("corner") ||
    issueLower.includes("lift")
  ) {
    troubleshooting += `**Warping / Corner Lifting Issues**

**Causes & Solutions**:

1. **Insufficient Bed Adhesion**:
   - Increase bed temperature
   - Clean bed thoroughly with IPA
   - Use glue stick or hairspray
   - Add brim or raft

2. **Cooling Too Aggressive**:
   - Reduce part cooling for first 5-10 layers
   - ABS: Minimal to no cooling
   - Disable fan for first layer

3. **Temperature Differential**:
   - Use enclosure to maintain ambient temp
   - Close doors if available
   - Avoid drafts and AC vents
   - Keep chamber warm (40-60°C for ABS)

4. **Part Geometry**:
   - Sharp corners warp more
   - Add "mouse ears" to corners
   - Use chamfered corners instead of sharp
   - Orient parts to minimize flat areas

5. **Material-Specific**:
   - ABS warps most: Use enclosure, high bed temp
   - PETG: Moderate warping, 80°C bed
   - PLA: Minimal warping, easiest

**Bambu Studio Settings**:
- Enable "Brim" with 8-15mm width
- Use "Raft" for severe warping
- Increase "Bed temperature" by 5-10°C
- Disable "Part cooling fan" for first 3-5 layers
- Consider "Draft shield" feature

`;
  }

  // Clogging
  if (
    issueLower.includes("clog") ||
    issueLower.includes("jam") ||
    issueLower.includes("under-extru")
  ) {
    troubleshooting += `**Clogging / Under-Extrusion Issues**

**Causes & Solutions**:

1. **Partial Clog**:
   - Perform cold pull cleaning
   - Heat to 180°C, push filament, cool to 90°C, pull
   - Repeat 2-3 times
   - Clean nozzle with needle

2. **Temperature Too Low**:
   - Increase nozzle temp by 5-10°C
   - Ensure temp matches material requirements
   - Check thermistor accuracy

3. **Filament Quality**:
   - Check filament diameter (should be 1.75mm ±0.03)
   - Wet filament causes steam and clogs
   - Try different brand/spool

4. **Extruder Issues**:
   - Check extruder tension
   - Look for ground filament (too tight)
   - Clean extruder gears
   - Verify proper filament path

5. **Nozzle Wear or Damage**:
   - Replace nozzle if old or damaged
   - Check for abrasive filament use
   - Inspect nozzle opening for deformation

**Bambu-Specific**:
- Run AMS calibration if using AMS
- Check filament path for tangles
- Verify filament sensor operation
- Clean extruder gears regularly

**Preventive Maintenance**:
- Dry filament before use
- Store in sealed bags with desiccant
- Replace nozzles every 500-1000 hours
- Regular cold pulls with cleaning filament

`;
  }

  // Print quality
  if (
    issueLower.includes("quality") ||
    issueLower.includes("rough") ||
    issueLower.includes("blobbing") ||
    issueLower.includes("ringing") ||
    issueLower.includes("ghosting")
  ) {
    troubleshooting += `**Print Quality Issues**

**Common Quality Problems**:

1. **Ringing / Ghosting** (ripples after corners):
   - Reduce print speed (especially outer walls)
   - Lower acceleration and jerk
   - Enable Input Shaping (Bambu printers)
   - Increase part rigidity
   - Tighten loose components

2. **Z-Banding** (horizontal lines):
   - Check Z-axis binding
   - Lubricate lead screws
   - Verify consistent layer height
   - Check for Z-wobble

3. **Blobs / Zits**:
   - Tune retraction settings
   - Enable "Randomize seam position"
   - Use "Hide seam" option
   - Reduce coasting amount

4. **Over-extrusion**:
   - Reduce flow rate (95-98%)
   - Run flow calibration
   - Check filament diameter
   - Calibrate E-steps

5. **Poor Overhangs**:
   - Increase part cooling
   - Reduce print speed for overhangs
   - Add supports
   - Optimize part orientation

**Bambu Studio Calibration**:
- Run "Flow Rate Calibration"
- Enable "Pressure Advance"
- Use "Adaptive Layer Height"
- Enable "Smooth Speed Changes"
- Run "Vibration Compensation"

`;
  }

  // Software issues
  if (
    issueLower.includes("software") ||
    issueLower.includes("crash") ||
    issueLower.includes("freeze") ||
    issueLower.includes("error")
  ) {
    troubleshooting += `**Bambu Studio Software Issues**

**Common Software Problems**:

1. **Crashes or Freezing**:
   - Update to latest Bambu Studio version
   - Check system requirements (8GB RAM minimum)
   - Reduce complex model polygon count
   - Clear cache and temp files
   - Reinstall if persistent

2. **Slicing Errors**:
   - Check model for errors (holes, non-manifold)
   - Use "Repair" function on model
   - Try different slicer engine settings
   - Simplify overly complex models

3. **Connection Issues** (to printer):
   - Verify network connection (WiFi/LAN)
   - Check printer IP address
   - Update printer firmware
   - Restart printer and Bambu Studio
   - Check firewall settings

4. **File Import Problems**:
   - Verify file format compatibility
   - Check file isn't corrupted
   - Try repairing model in mesh repair tool
   - Export from source in different format

5. **Settings Not Saving**:
   - Check file permissions
   - Run as administrator if needed
   - Verify profile isn't read-only
   - Check configuration file location

**Maintenance**:
- Regularly update Bambu Studio
- Keep printer firmware current
- Backup custom profiles
- Clear old project files periodically

`;
  }

  // If no specific issue matched, provide general guidance
  if (troubleshooting === `**Troubleshooting: ${issue}**\n${printerModel ? `**Printer Model: ${printerModel}**\n\n` : ""}`) {
    troubleshooting += `**General Troubleshooting Approach**

**Systematic Problem Solving**:

1. **Identify the Problem**:
   - Document exactly what's wrong
   - Note when in the print it occurs
   - Check if it's consistent or random

2. **Recent Changes**:
   - New filament brand or color?
   - Settings changes?
   - Different model or geometry?
   - Software or firmware updates?

3. **Basic Checks**:
   - Bed leveled and clean
   - Nozzle not clogged
   - Correct temperatures
   - Filament dry and feeding properly
   - No mechanical obstructions

4. **Systematic Testing**:
   - Change ONE variable at a time
   - Use calibration prints
   - Document each change
   - Compare to known good prints

5. **Common Issues by Symptom**:
   - First layer problems → Bed adhesion, leveling, Z-offset
   - Stringing → Temperature, retraction, moisture
   - Layer shifting → Speed, mechanics, electrical
   - Warping → Bed temp, cooling, enclosure
   - Poor quality → Speed, calibration, wear

**Bambu-Specific Diagnostics**:
- Run built-in self-test
- Check error logs in Bambu Handy app
- Verify firmware version matches Bambu Studio
- Review print history for patterns
- Use Bambu Lab community forums

**Getting Help**:
- Post clear photos of the issue
- Include your settings (export profile)
- Mention material, printer model, software version
- Describe troubleshooting steps already tried
- Share project file if possible

**Useful Resources**:
- Bambu Lab Wiki: wiki.bambulab.com
- Community Forum: forum.bambulab.com
- Reddit: r/BambuLab
- Discord: Bambu Lab Official
`;
  }

  return troubleshooting;
}

async function handleSelectMaterial(
  partType: string,
  requirements?: string
): Promise<string> {
  const partLower = partType.toLowerCase();
  const reqLower = requirements?.toLowerCase() || "";

  let recommendation = `**Material Selection Guide**\n\n`;
  recommendation += `**Part Type**: ${partType}\n`;
  if (requirements) {
    recommendation += `**Requirements**: ${requirements}\n`;
  }
  recommendation += `\n`;

  // Analyze requirements
  const needsStrength =
    reqLower.includes("strong") ||
    reqLower.includes("tough") ||
    reqLower.includes("durable");
  const needsFlexibility =
    reqLower.includes("flex") ||
    reqLower.includes("bend") ||
    reqLower.includes("elastic");
  const needsHeatResistance =
    reqLower.includes("heat") ||
    reqLower.includes("hot") ||
    reqLower.includes("temperature");
  const needsOutdoor =
    reqLower.includes("outdoor") ||
    reqLower.includes("sun") ||
    reqLower.includes("uv") ||
    reqLower.includes("weather");
  const needsFood =
    reqLower.includes("food") || reqLower.includes("safe");
  const needsDetail =
    reqLower.includes("detail") ||
    reqLower.includes("smooth") ||
    reqLower.includes("fine");

  // Main recommendation logic
  if (needsFlexibility) {
    recommendation += `**Recommended: TPU (Thermoplastic Polyurethane)**

**Why TPU**:
- Flexible and elastic
- Excellent impact resistance
- Good chemical resistance
- Durable and abrasion-resistant

**Properties**:
- Shore Hardness: 85A-95A (softer = more flexible)
- Strength: Moderate
- Heat Resistance: Up to 80°C
- UV Resistance: Good

**Print Settings**:
- Temperature: 210-230°C
- Speed: 15-30 mm/s (SLOW)
- Retraction: Minimal or disabled
- Direct drive recommended

**Best For**: Phone cases, gaskets, seals, wearables, shock absorbers, living hinges

**Alternatives**:
- **TPE**: More flexible, harder to print
- **Semiflex**: Easier to print, less flexible

`;
  } else if (needsHeatResistance) {
    recommendation += `**Recommended: ABS or ASA**

**ABS (Acrylonitrile Butadiene Styrene)**:
- Heat resistance: Up to 98°C
- Strong and impact-resistant
- Good for functional parts
- Requires enclosure
- Some warping issues

**ASA (Acrylonitrile Styrene Acrylate)** - Better Choice:
- Heat resistance: Up to 95°C
- UV resistant (ABS is not)
- Better outdoor performance
- Similar properties to ABS
- Also requires enclosure

**Print Settings**:
- Temperature: 240-260°C
- Bed: 100-110°C
- Enclosure: Required
- Cooling: Minimal

**Best For**: Automotive parts, outdoor fixtures, tool handles, functional prototypes, engineering parts

**Alternative**:
- **PETG**: Good heat resistance (80°C), easier to print, no enclosure needed

`;
  } else if (needsOutdoor) {
    recommendation += `**Recommended: ASA (Acrylonitrile Styrene Acrylate)**

**Why ASA**:
- Excellent UV resistance
- Weather resistant
- Won't fade or degrade in sun
- Good mechanical properties
- Temperature resistant

**Properties**:
- Heat Resistance: 90-95°C
- UV Resistance: Excellent
- Strength: High
- Impact Resistance: Very good

**Print Settings**:
- Temperature: 240-260°C
- Bed: 100-110°C
- Enclosure: Highly recommended
- Cooling: Minimal

**Best For**: Outdoor fixtures, garden tools, automotive trim, architectural models, signage

**Alternatives**:
- **PETG**: Good UV resistance, easier to print
- **Nylon**: Excellent durability, but absorbs moisture
- **PC (Polycarbonate)**: Maximum strength and temp, harder to print

`;
  } else if (needsFood) {
    recommendation += `**Recommended: Food-Safe PLA or PETG**

**Important Safety Notes**:
- Material must be food-safe grade
- Nozzle must be stainless steel or brass (not lead)
- 3D prints have layer lines that harbor bacteria
- Best for single-use or dry food only
- Apply food-safe coating for long-term use

**Food-Safe PLA**:
- Easiest to print
- Biodegradable
- Non-toxic
- Max temp: 50°C (not for hot liquids)

**Food-Safe PETG**:
- FDA approved variants available
- More durable than PLA
- Better temperature resistance (70°C)
- Dishwasher safe (top rack)

**Print Settings**:
- Use new, clean nozzle
- Standard settings for material
- 100% infill or food-safe coating

**Best For**: Cookie cutters, measuring spoons, food molds, utensil handles, dry food storage

**Not Recommended**: ABS (toxic fumes), PLA for hot liquids, reusable without coating

`;
  } else if (needsDetail) {
    recommendation += `**Recommended: PLA or Resin**

**For FDM (Bambu Studio) - PLA**:
- Excellent detail at small layer heights
- Minimal shrinkage
- Easy to print with fine settings
- Good surface finish
- Wide color selection

**Print Settings for Detail**:
- Layer Height: 0.08-0.12mm
- Speed: Slow (40-60 mm/s)
- Temperature: 200-210°C
- Cooling: 100%

**Special PLA Variants**:
- **PLA+**: Stronger, similar detail
- **Silk PLA**: Beautiful surface finish
- **Matte PLA**: Smooth, non-reflective

**Best For**: Miniatures, detailed models, figurines, artistic pieces, prototypes

**If Maximum Detail Needed**:
- Consider resin printing instead of FDM
- Resin offers 10x better detail
- But Bambu Studio is for FDM only

`;
  } else if (needsStrength || partLower.includes("functional") || partLower.includes("mechanical")) {
    recommendation += `**Recommended: PETG or Nylon**

**PETG (Polyethylene Terephthalate Glycol)** - Best All-Around:
- Strong and impact-resistant
- Good chemical resistance
- Moderate temperature resistance (80°C)
- Easy to print (easier than ABS)
- Food-safe options available
- No enclosure needed

**Print Settings**:
- Temperature: 230-250°C
- Bed: 75-85°C
- Speed: 40-60 mm/s
- Cooling: 30-50%

**Nylon (Polyamide)** - Maximum Strength:
- Exceptional strength and durability
- Excellent wear resistance
- Good chemical resistance
- Flexible without breaking
- Requires drying before use

**Print Settings**:
- Temperature: 240-260°C
- Bed: 70-80°C
- Enclosure: Recommended
- Must be dried (moisture absorbs quickly)

**Best For**: 
- PETG: Mechanical parts, brackets, enclosures, functional prototypes
- Nylon: Gears, bearings, hinges, high-wear parts, tools

**Alternatives**:
- **PLA+/PLA Pro**: Easier than PETG, decent strength
- **PC (Polycarbonate)**: Maximum strength, very difficult to print
- **Carbon Fiber Composites**: Ultimate strength, requires hardened nozzle

`;
  } else {
    // General purpose / decorative
    recommendation += `**Recommended: PLA (Polylactic Acid)**

**Why PLA for General Use**:
- Easiest to print
- Wide color selection
- Good detail and surface finish
- No odor, biodegradable
- No enclosure needed
- Most affordable

**Properties**:
- Strength: Moderate (good for non-functional)
- Heat Resistance: Low (60°C)
- Detail: Excellent
- Ease of Printing: Easiest

**Print Settings**:
- Temperature: 200-220°C
- Bed: 50-60°C (optional)
- Speed: 50-100 mm/s
- Cooling: 100% (after first layer)

**PLA Variants**:
- **Standard PLA**: General purpose, all colors
- **PLA+/Pro**: Stronger, less brittle
- **Silk PLA**: Shiny, metallic-like finish
- **Matte PLA**: Professional, non-glossy
- **Wood PLA**: Wood-like appearance and texture
- **Glow PLA**: Glows in the dark
- **Color-changing**: Temperature-sensitive

**Best For**: Decorative items, prototypes, art projects, figures, toys, models, learning

`;
  }

  // Add comparison table
  recommendation += `\n**Material Comparison Quick Reference**:

| Material | Strength | Heat Res | Ease | Best Use Case |
|----------|----------|----------|------|---------------|
| **PLA** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Decorative, prototypes |
| **PLA+** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | General functional parts |
| **PETG** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Functional, mechanical |
| **ABS** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Heat resistant, automotive |
| **ASA** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Outdoor, UV resistant |
| **TPU** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Flexible, shock absorbing |
| **Nylon** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | High wear, maximum strength |
| **PC** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | Engineering, extreme duty |

**Decision Tree**:
1. Flexible needed? → **TPU**
2. Outdoor use? → **ASA**
3. High temperature? → **ABS/ASA**
4. Maximum strength? → **Nylon** or **PC**
5. Food contact? → **Food-safe PLA/PETG**
6. Fine detail? → **PLA**
7. Functional part? → **PETG**
8. General/decorative? → **PLA**

**Bambu Studio Material Profiles**:
- Bambu Studio includes optimized profiles for all common materials
- Select material in "Filament Settings"
- Profiles include tested temperatures, speeds, and cooling
- Can customize and save your own profiles
`;

  return recommendation;
}

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_file_format_info") {
      const parsed = FileFormatInfoSchema.parse(args);
      const result = await handleGetFileFormatInfo(parsed.format);
      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "get_3mf_info") {
      const parsed = Print3MFInfoSchema.parse(args);
      const result = await handleGet3MFInfo(parsed.aspect);
      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "recommend_print_settings") {
      const parsed = PrintSettingsSchema.parse(args);
      const result = await handleRecommendPrintSettings(parsed);
      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "troubleshoot_issue") {
      const parsed = TroubleshootingSchema.parse(args);
      const result = await handleTroubleshootIssue(
        parsed.issue,
        parsed.printerModel
      );
      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "select_material") {
      const parsed = MaterialSelectorSchema.parse(args);
      const result = await handleSelectMaterial(
        parsed.partType,
        parsed.requirements
      );
      return {
        content: [{ type: "text", text: result }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bambu Studio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
