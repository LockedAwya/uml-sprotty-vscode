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
    let maybeExtends: string = "";
    if (_interface.interfaceInheritance.length !== 0) {
        maybeExtends += " extends".toString();
        for (let i = 0; i < _interface.interfaceInheritance[0].interface.length; i++) {
            //maybeExtends += _interface.interfaceInheritance[0].interface[i].$refText.toString() + " ".toString();
            if (i == _interface.interfaceInheritance[0].interface.length - 1) {
                maybeExtends += " ".toString() + _interface.interfaceInheritance[0].interface[i].$refText.toString();
            } else {
                maybeExtends += " ".toString() + _interface.interfaceInheritance[0].interface[i].$refText.toString() + ",".toString();
            }
        }
    }
    fileNode.append(`interface ${_interface.name}${maybeExtends} {`, NL);
    fileNode.indent(interfaceBody => {
        const featureData = _interface.features.map(f => generateFeatureForInterface(f, interfaceBody));
        featureData.forEach(([generateField, ,]) => generateField());
    });
    fileNode.append('}', NL);
}

function generateClass(_class: Class, fileNode: CompositeGeneratorNode): void {
    const maybeExtends = _class.inheritance.length !== 0 ? ` extends ${_class.inheritance[0].class.$refText}` : '';
    const maybeAbstractClass = _class.abstract ? `abstract` : '';
    let maybeImplements: string = "";
    if (_class.Implementation.length !== 0) {
        maybeImplements += " implements".toString();
        for (let i = 0; i < _class.Implementation[0].interface.length; ++i) {
            if (i == _class.Implementation[0].interface.length - 1) {
                maybeImplements += " ".toString() + _class.Implementation[0].interface[i].$refText.toString();
                //maybeImplements += " ".toString() + _class.Implementation[0].interface[i].ref?.interfaceInheritance[0].
            } else {
                maybeImplements += " ".toString() + _class.Implementation[0].interface[i].$refText.toString() + ",".toString();
            }
        }
    }
    fileNode.append(`${maybeAbstractClass} class ${_class.name}${maybeExtends}${maybeImplements} {`, NL);
    fileNode.indent(classBody => {
        const featureData = _class.features.map(f => generateFeatureForClass(f, classBody));
        featureData.forEach(([generateField, ,]) => generateField());
        featureData.forEach(([, generateSetter, generateGetter, generateMethod]) => { generateSetter(); generateGetter(); generateMethod() });
        if (_class.Implementation.length !== 0) {
            for (let i = 0; i < _class.Implementation[0].interface.length; ++i) {
                const overridedFeatureImplements = _class.Implementation[0].interface[i].ref?.features.map(f => overridedImplementedMethods(f, classBody)) ?? undefined;
                if (overridedFeatureImplements !== undefined) {
                    overridedFeatureImplements.forEach(([generateMethod, ,]) => generateMethod());
                }
            }
        }
    });
    fileNode.append('}', NL);
}

function generateFeatureForInterface(feature: Feature, interfaceBody: IndentNode): [() => void] {
    let name = feature.name;
    let type = feature.type.$refText;
    //let maybeContainsParams = feature.params.length;
    let maybeMethod = feature.param;

    //generateParams

    if (feature.many) {
        type += '[]'.toString();
    } else {
        if (maybeMethod) {
            //name += '()'.toString();
            name += '('
            for (let i = 0; i < feature.params.length; ++i) {
                name += feature.params[i].type.$refText + ' ';
                if (i == feature.params.length - 1) {
                    name += feature.params[i].name;
                    break;
                }
                name += feature.params[i].name + ', ';
            }
            name += ')'
        }
        type += ''.toString();
    }
    return [
        () => { // generate the field
            interfaceBody.append(`${type} ${name};`, NL);
        },
    ]
}

function overridedImplementedMethods(_interfaceFeature: Feature, classBody: IndentNode): [() => void] {
    let name = _interfaceFeature.name;
    let type = _interfaceFeature.type.$refText + (_interfaceFeature.many ? '[]' : '');
    let maybeContainsParams = _interfaceFeature.params.length;
    let maybeMethod = _interfaceFeature.param;
    return [
        () => {
            if (maybeMethod) {
                if (maybeContainsParams != 0) {
                    //name += '()'.toString();
                    name += '('
                    for (let i = 0; i < _interfaceFeature.params.length; ++i) {
                        name += _interfaceFeature.params[i].type.$refText + ' ';
                        if (i == _interfaceFeature.params.length - 1) {
                            name += _interfaceFeature.params[i].name;
                            break;
                        }
                        name += _interfaceFeature.params[i].name + ', ';
                    }
                    name += ')'
                } else {
                    name += '()';
                }
                type += ''.toString();
                //appending
                classBody.append(NL);
                classBody.append(`@Override`, NL);
                classBody.append(`public ${type} ${name} {`, NL);
                if (type.includes("void")) {
                    classBody.indent(methodBody => {
                        methodBody.append(`System.out.println("${name}");`, NL);
                    });
                } else {
                    classBody.indent(methodBody => {
                        methodBody.append(`return ${null};`, NL);
                    });
                }
                classBody.append('}', NL);
            }
        }
    ];
}

function generateFeatureForClass(feature: Feature, classBody: IndentNode): [() => void, () => void, () => void, () => void] {
    let name = feature.name;
    let type = feature.type.$refText + (feature.many ? '[]' : '');
    let maybeContainsParams = feature.params.length;
    let maybeMethod = feature.param;

    return [
        () => { // generate the field
            if (!maybeMethod) {
                classBody.append(`private ${type} ${name};`, NL);
            }
        },
        () => { // generate the setter
            if (!maybeMethod) {
                classBody.append(NL);
                classBody.append(`public void set${_.upperFirst(name)}(${type} ${name}) {`, NL);
                classBody.indent(methodBody => {
                    methodBody.append(`this.${name} = ${name};`, NL);
                });
                classBody.append('}', NL);
            }
        },
        () => { // generate the getter
            if (!maybeMethod) {
                classBody.append(NL);
                classBody.append(`public ${type} get${_.upperFirst(name)}() {`, NL);
                classBody.indent(methodBody => {
                    methodBody.append(`return ${name};`, NL);
                });
                classBody.append('}', NL);
            }
        },
        () => { //generate the method
            //TODO refactor
            if (maybeMethod) {
                if (maybeContainsParams != 0) {
                    //name += '()'.toString();
                    name += '('
                    for (let i = 0; i < feature.params.length; ++i) {
                        name += feature.params[i].type.$refText + ' ';
                        if (i == feature.params.length - 1) {
                            name += feature.params[i].name;
                            break;
                        }
                        name += feature.params[i].name + ', ';
                    }
                    name += ')'
                } else {
                    name += '()';
                }
                type += ''.toString();
                //appending
                classBody.append(NL);
                classBody.append(`public ${type} ${name} {`, NL);
                if (type.includes("void")) {
                    classBody.indent(methodBody => {
                        methodBody.append(`System.out.println("${name}");`, NL);
                    });
                } else {
                    classBody.indent(methodBody => {
                        methodBody.append(`return ${null};`, NL);
                    });
                }
                classBody.append('}', NL);
            }
        }
    ];
}


