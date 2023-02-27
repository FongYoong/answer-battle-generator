import { app } from 'electron'
import path from 'path'
import fs from 'fs'
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { web_project, config_dir, default_config_dir, general_config_path, assets_config_path, rounds_config_path, output_dist_path,
    node_dir, npm_path,
} from './utils'

function copyFiles(srcDir, destDir) {
    const srcFiles = fs.readdirSync(srcDir)
    srcFiles.forEach((fileName) => {
        fs.copyFileSync(path.join(srcDir, fileName), path.join(destDir, fileName))
    })
}

function readJSONFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath))
}

function writeJSONFile(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data))
}

export const generate = async (data) => {


    copyFiles(default_config_dir, config_dir)

    const configs = {
        general: readJSONFile(general_config_path),
        assets: readJSONFile(assets_config_path),
        rounds: readJSONFile(rounds_config_path),
        outputPath: data.outputPath
    }

    configs.general = {
        ...configs.general,
        ...data.general
    }
    data.assets.forEach((f) => {
        const ori = configs.assets[f.name]
        configs.assets[f.name] = {
            path: f.file ? f.file : '',
            default: ori.default
        }
    })
    configs.rounds = data.rounds

    console.log(configs)
    
    writeJSONFile(configs.general, general_config_path)
    writeJSONFile(configs.assets, assets_config_path)
    writeJSONFile(configs.rounds, rounds_config_path)

    const originalDir = process.cwd()
    process.chdir(web_project)

    // process.env['PATH'] = `${process.env['PATH']};${node_dir}` 
    process.env['PATH'] = `${node_dir}` 
    console.log(process.env['PATH'])

    const { stdout, stderr } = await exec(
        `echo %PATH% && node -v && ${npm_path} run build`,
        // `echo %PATH% && node -v`,
    );
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);

    fs.copyFileSync(output_dist_path, configs.outputPath)

    process.chdir(originalDir)
}
