import Tool from "./Tool.js";
import Add from "./add/add.js";
import Settings from "./settings/settings.js";
import Raise from "./terrain/raise.js";
import ModelPlacement from "./models/ModelPlacement.js";
import Delete from "./delete/Delete.js";
import CopyPaste from "./copypaste/CopyPaste.js";
import MaterialTool from "./material/MaterialTool.js";


export function createTools(scene, meshes, gridTracker, grid) {
    document.getElementById('toolBar').innerHTML = '';


    let tools = {
        tools: {},
        selectedTool: null,
        setSelectedTool: function (toolName) {
            if (this.tools[toolName]) {
                this.selectedTool = this.tools[toolName];
            }
        }
    };

    const raiseSubTools = [
        { name: 'Raise' },
        { name: 'Lower' },
        { name: 'Flatten' },
        { name: 'Path' }
    ];

    const addSubTools = [];

    const settingsSubTools = [
        { name: 'Save' },
        { name: 'Load' },
        { name: 'Import' },
        { name: 'Export' }
    ];

    const modelSubTools = [
        { name: 'Props' },
        { name: 'Enemies' },
        { name: 'Characters' },
        { name: 'Environment' }
    ];

    const deleteSubTools = [
        { name: 'Single' },
        { name: 'All Placed' }
    ];

    const materialSubTools = [
        { name: 'Generate' },
        { name: 'Templates' },
        { name: 'Library' }
    ];

    // Create all tools
    tools.tools.place = new Add("Place", scene, meshes, grid, tools, "./assets/util/ui/icons/path.png", addSubTools);
    tools.tools.raise = new Raise("Raise", scene, meshes, grid, tools, "./assets/util/ui/icons/tree.png", raiseSubTools);
    tools.tools.models = new ModelPlacement("Models", scene, meshes, grid, tools, "./assets/util/ui/icons/model.png", modelSubTools);
    tools.tools.delete = new Delete("Delete", scene, meshes, grid, tools, "./assets/util/ui/icons/delete.png", deleteSubTools);
    tools.tools.copypaste = new CopyPaste("Copy", scene, meshes, grid, tools, "./assets/util/ui/icons/copy.png", []);
    // Material tool uses gear icon as fallback (or create material.png)
    tools.tools.material = new MaterialTool("Material", scene, meshes, grid, tools, "./assets/util/ui/icons/gear.png", materialSubTools);
    tools.tools.settings = new Settings("Settings", scene, meshes, grid, tools, "./assets/util/ui/icons/gear.png", settingsSubTools);

    // Set the initial selected tool
    tools.selectedTool = tools.tools.place;

    console.log('🔨 Builder tools initialized:', Object.keys(tools.tools));

    return tools;
}
