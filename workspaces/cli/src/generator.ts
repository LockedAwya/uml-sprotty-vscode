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
import { Umlmodel, Feature, Class, isClass, Type, Interface, isInterface } from '../../uml-langium/language-server/src/generated/ast';
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
        const generatedDirPath = generateJavaClasses(umlmodel, fileName, opts.destination);
        const generateDirPath2 = generateJavaInterfaces(umlmodel, fileName, opts.destination);
        if (!opts.quiet) {
            console.log(chalk.green(`Java classes generated successfully: ${chalk.yellow(generatedDirPath)}`));
            console.log(chalk.green(`Java interfaces generated successfully: ${chalk.yellow(generateDirPath2)}`));
        }
    } catch (error) {
        if (!opts.quiet) {
            console.error(chalk.red(String(error)));
        }
    }
};

export function generateJavaClasses(umlmodel: Umlmodel, fileName: string, destination?: string): string {
    const data = extractDestinationAndName(fileName, destination);
    return generateTypeElements(data.destination, umlmodel.classes, data.name);
}

export function generateJavaInterfaces(umlmodel: Umlmodel, fileName: string, destination?: string): string {
    const data = extractDestinationAndName(fileName, destination);
    return generateTypeElements(data.destination, umlmodel.interfaces, data.name);
}

function generateTypeElements(destination: string, elements: Array<Type | Class | Interface>, filePath: string): string {

    function generateTypesInternal(elements: Array<Type | Class | Interface>, filePath: string): string {
        const fullPath = path.join(destination, filePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        const packagePath = filePath.replace(/\//g, '.').replace(/^\.+/, '');
        for (const elem of elements) {
            if (isClass(elem)) {
                const fileNode = new CompositeGeneratorNode();
                fileNode.append(`package ${packagePath};`, NL, NL);
                generateClass(elem, fileNode);
                fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), toString(fileNode));
            } else if (isInterface(elem)) {
                const fileNode = new CompositeGeneratorNode();
                fileNode.append(`package ${packagePath};`, NL, NL);
                generateInterface(elem, fileNode);
                fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), toString(fileNode));
            }
        }
        return fullPath;
    }

    return generateTypesInternal(elements, filePath);
}

//TODO: generateInterface
function generateInterface(_interface: Interface, fileNode: CompositeGeneratorNode): void {
    //const maybeExtends = _interface.interfaceInheritance.length !== 0 ? ` extends ${_interface.interfaceInheritance[0].interface[0].$refText}` : '';
    let maybeExtends: string = "";
    if (_interface.interfaceInheritance.length !== 0) {
        maybeExtends += " extends".toString();
        for (let i = 0; i < _interface.interfaceInheritance[0].interface.length; i++) {
            //maybeExtends += _interface.interfaceInheritance[0].interface[i].$refText.toString() + " ".toString();
            if (i == _interface.interfaceInheritance[0].interface.length - 1) {
                maybeExtends += " ".toString() + _interface.interfaceInheritance[0].interface[i].$refText.toString() + " ".toString();
            } else {
                maybeExtends += " ".toString() + _interface.interfaceInheritance[0].interface[i].$refText.toString() + ",".toString();
            }
        }
    }
    fileNode.append(`interface ${_interface.name}${maybeExtends}{`, NL);
    fileNode.indent(interfaceBody => {
        const featureData = _interface.features.map(f => generateFeatureForInterface(f, interfaceBody));
        featureData.forEach(([generateField, ,]) => generateField());
    });
    fileNode.append('}', NL);
}

function generateClass(_class: Class, fileNode: CompositeGeneratorNode): void {
    //const maybeExtends = _class.superType ? ` extends ${_class.superType.$refText}` : '';
    const maybeExtends = _class.inheritance.length !== 0 ? ` extends ${_class.inheritance[0].class.$refText}` : '';
    let maybeImplements: string = "";
    if (_class.Implementation.length !== 0) {
        maybeImplements += " implements".toString();
        for (let i = 0; i < _class.Implementation[0].interface.length; ++i) {
            if (i == _class.Implementation[0].interface.length - 1) {
                maybeImplements += " ".toString() + _class.Implementation[0].interface[i].$refText.toString();
            } else {
                maybeImplements += " ".toString() + _class.Implementation[0].interface[i].$refText.toString() + ",".toString();
            }
        }
    }
    fileNode.append(`class ${_class.name}${maybeExtends}${maybeImplements} {`, NL);
    fileNode.indent(classBody => {
        const featureData = _class.features.map(f => generateFeature(f, classBody));
        featureData.forEach(([generateField, ,]) => generateField());
        featureData.forEach(([, generateSetter, generateGetter]) => { generateSetter(); generateGetter(); });
    });
    fileNode.append('}', NL);
}

function generateFeatureForInterface(feature: Feature, interfaceBody: IndentNode): [() => void] {
    let name = feature.name;
    let type = feature.type.$refText;
    //+ (feature.many ? '[]' : '');

    if (feature.many) {
        type += '[]'.toString();
    } else {
        if (type.startsWith("void")) {
            name += '()'.toString();
        }
        type += ''.toString();
    }
    return [
        () => { // generate the field
            interfaceBody.append(`${type} ${name};`, NL);
        }
    ]
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
