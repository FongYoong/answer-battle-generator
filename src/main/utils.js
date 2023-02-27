import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'

// path.dirname(__dirname)
// const web_project = path.join(process.resourcesPath, 'new_year_answer_battle_web');
export const resources = is.dev ? path.join(app.getAppPath(), 'extraResources') : path.join(process.resourcesPath, 'extraResources');
export const web_project = path.join(resources, 'new_year_answer_battle_web');
export const web_assets = path.join(web_project, 'src/assets');
export const config_dir = path.join(web_project, "app_configs")
export const default_config_dir = path.join(config_dir, "default")
export const general_config_path = path.join(config_dir, "general.config.json")
export const assets_config_path = path.join(config_dir, "assets.config.json")
export const rounds_config_path = path.join(config_dir, "rounds.config.json")
export const output_dist_path = path.join(web_project, "dist", "index.html")

export const node_dir = path.join(resources, 'node');
export const node_path = path.join(node_dir, 'node.exe');
export const npm_path = path.join(node_dir, 'npm');
