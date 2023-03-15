/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import _ from 'lodash';
import { CompositeGeneratorNode, IndentNode, NL, toString } from 'langium';
import { Umlmodel, Feature, Class, isClass, Type } from '../../uml-langium/language-server/src/generated/ast';
import { extractAstNode, extractDestinationAndName, setRootFolder } from './cli-util';
import { createUMLServices } from '../../uml-langium/language-server/src/uml-module';
import { UmlDiagramLanguageMetaData } from '../../uml-langium/language-server/src/generated/module';
import { NodeFileSystem } from 'langium/node';

export type GenerateOptions = {
    destination?: string;
    root?: string;
    quiet: boolean;
}

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    try {
        const services = createUMLServices(NodeFileSystem).states;
        await setRootFolder(fileName, services, opts.root);
        const umlmodel = await extractAstNode<Umlmodel>(fileName, UmlDiagramLanguageMetaData.fileExtensions, services);
        const generatedDirPath = generateJava(umlmodel, fileName, opts.destination);
        if (!opts.quiet) {
            console.log(chalk.green(`Java classes generated successfully: ${chalk.yellow(generatedDirPath)}`));
        }
    } catch (error) {
        if (!opts.quiet) {
            console.error(chalk.red(String(error)));
        }
    }
};

export function generateJava(umlmodel: Umlmodel, fileName: string, destination?: string): string {
    const data = extractDestinationAndName(fileName, destination);
    return generateTypeElements(data.destination, umlmodel.classes, data.name);
}

function generateTypeElements(destination: string, elements: Array<Type | Class>, filePath: string): string {

    function generateTypesInternal(elements: Array<Type | Class>, filePath: string): string {
        const fullPath = path.join(destination, filePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        const packagePath = filePath.replace(/\//g, '.').replace(/^\.+/, '');
        for (const elem of elements) {
            //  if (isPackageDeclaration(elem)) {
            //      generateAbstractElementsInternal(elem.elements, path.join(filePath, elem.name.replace(/\./g, '/')));
            //  } else if (isClass(elem)) {
            //      const fileNode = new CompositeGeneratorNode();
            //      fileNode.append(`package ${packagePath};`, NL, NL);
            //      generateClass(elem, fileNode);
            //      fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), toString(fileNode));
            //  }
            if (isClass(elem)) {
                const fileNode = new CompositeGeneratorNode();
                fileNode.append(`package ${packagePath};`, NL, NL);
                generateClass(elem, fileNode);
                fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), toString(fileNode));
            }
        }
        return fullPath;
    }

    return generateTypesInternal(elements, filePath);
}

// function generateClass(_class: Class, fileNode: CompositeGeneratorNode): void {
//     const maybeExtends = _class ? ` extends ${_class.name}` : '';
//     fileNode.append(`class ${_class.name}${maybeExtends} {`, NL);
//     fileNode.indent(classBody => {
//         const featureData = _class.features.map(f => generateFeature(f, classBody));
//         featureData.forEach(([generateField, ,]) => generateField());
//         featureData.forEach(([, generateSetter, generateGetter]) => { generateSetter(); generateGetter(); });
//     });
//     fileNode.append('}', NL);
// }

function generateClass(_class: Class, fileNode: CompositeGeneratorNode): void {
    //const maybeExtends = _class.superType ? ` extends ${_class.superType.$refText}` : '';
    const maybeExtends = _class.inheritance.length !== 0 ? ` extends ${_class.inheritance[0].class.$refText}` : '';
    fileNode.append(`class ${_class.name}${maybeExtends} {`, NL);
    fileNode.indent(classBody => {
        const featureData = _class.features.map(f => generateFeature(f, classBody));
        featureData.forEach(([generateField, ,]) => generateField());
        featureData.forEach(([, generateSetter, generateGetter]) => { generateSetter(); generateGetter(); });
    });
    fileNode.append('}', NL);
}

function generateFeature(feature: Feature, classBody: IndentNode): [() => void, () => void, () => void] {
    const name = feature.name;
    const type = feature.type.$refText + (feature.many ? '[]' : '');

    return [
        () => { // generate the field
            classBody.append(`private ${type} ${name};`, NL);
        },
        () => { // generate the setter
            classBody.append(NL);
            classBody.append(`public void set${_.upperFirst(name)}(${type} ${name}) {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`this.${name} = ${name};`, NL);
            });
            classBody.append('}', NL);
        },
        () => { // generate the getter
            classBody.append(NL);
            classBody.append(`public ${type} get${_.upperFirst(name)}() {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`return ${name};`, NL);
            });
            classBody.append('}', NL);
        }
    ];
}
