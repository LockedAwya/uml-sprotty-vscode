/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import { AstNode, AbstractAstReflection, Reference, ReferenceInfo, TypeMetaData } from 'langium';

export type QualifiedName = string;

export type Type = Class | DataType | Interface;

export const Type = 'Type';

export function isType(item: unknown): item is Type {
    return reflection.isInstance(item, Type);
}

export interface Class extends AstNode {
    readonly $container: Umlmodel;
    readonly $type: 'Class';
    abstract: boolean
    features: Array<Feature>
    Implementation: Array<Implementation>
    inheritance: Array<Inheritance>
    name: string
}

export const Class = 'Class';

export function isClass(item: unknown): item is Class {
    return reflection.isInstance(item, Class);
}

export interface DataType extends AstNode {
    readonly $container: Umlmodel;
    readonly $type: 'DataType';
    name: string
}

export const DataType = 'DataType';

export function isDataType(item: unknown): item is DataType {
    return reflection.isInstance(item, DataType);
}

export interface Feature extends AstNode {
    readonly $container: Class | Interface;
    readonly $type: 'Feature';
    many: boolean
    name: string
    param: boolean
    params: Array<Param>
    type: Reference<Type>
}

export const Feature = 'Feature';

export function isFeature(item: unknown): item is Feature {
    return reflection.isInstance(item, Feature);
}

export interface Implementation extends AstNode {
    readonly $container: Class;
    readonly $type: 'Implementation';
    interface: Array<Reference<Interface>>
}

export const Implementation = 'Implementation';

export function isImplementation(item: unknown): item is Implementation {
    return reflection.isInstance(item, Implementation);
}

export interface Inheritance extends AstNode {
    readonly $container: Class;
    readonly $type: 'Inheritance';
    class: Reference<Class>
}

export const Inheritance = 'Inheritance';

export function isInheritance(item: unknown): item is Inheritance {
    return reflection.isInstance(item, Inheritance);
}

export interface Interface extends AstNode {
    readonly $container: Umlmodel;
    readonly $type: 'Interface';
    features: Array<Feature>
    interfaceInheritance: Array<InterfaceInheritance>
    name: string
}

export const Interface = 'Interface';

export function isInterface(item: unknown): item is Interface {
    return reflection.isInstance(item, Interface);
}

export interface InterfaceInheritance extends AstNode {
    readonly $container: Interface;
    readonly $type: 'InterfaceInheritance';
    interface: Array<Reference<Interface>>
}

export const InterfaceInheritance = 'InterfaceInheritance';

export function isInterfaceInheritance(item: unknown): item is InterfaceInheritance {
    return reflection.isInstance(item, InterfaceInheritance);
}

export interface Param extends AstNode {
    readonly $container: Feature;
    readonly $type: 'Param';
    many: boolean
    name: string
    type: Reference<Type>
}

export const Param = 'Param';

export function isParam(item: unknown): item is Param {
    return reflection.isInstance(item, Param);
}

export interface Umlmodel extends AstNode {
    readonly $type: 'Umlmodel';
    classes: Array<Class>
    datatypes: Array<DataType>
    interfaces: Array<Interface>
    name: string
    types: Array<Type>
}

export const Umlmodel = 'Umlmodel';

export function isUmlmodel(item: unknown): item is Umlmodel {
    return reflection.isInstance(item, Umlmodel);
}

export interface UmlAstType {
    Class: Class
    DataType: DataType
    Feature: Feature
    Implementation: Implementation
    Inheritance: Inheritance
    Interface: Interface
    InterfaceInheritance: InterfaceInheritance
    Param: Param
    Type: Type
    Umlmodel: Umlmodel
}

export class UmlAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return ['Class', 'DataType', 'Feature', 'Implementation', 'Inheritance', 'Interface', 'InterfaceInheritance', 'Param', 'Type', 'Umlmodel'];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case Class:
            case DataType:
            case Interface: {
                return this.isSubtype(Type, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Feature:type':
            case 'Param:type': {
                return Type;
            }
            case 'Implementation:interface':
            case 'InterfaceInheritance:interface': {
                return Interface;
            }
            case 'Inheritance:class': {
                return Class;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'Class': {
                return {
                    name: 'Class',
                    mandatory: [
                        { name: 'abstract', type: 'boolean' },
                        { name: 'features', type: 'array' },
                        { name: 'Implementation', type: 'array' },
                        { name: 'inheritance', type: 'array' }
                    ]
                };
            }
            case 'Feature': {
                return {
                    name: 'Feature',
                    mandatory: [
                        { name: 'many', type: 'boolean' },
                        { name: 'param', type: 'boolean' },
                        { name: 'params', type: 'array' }
                    ]
                };
            }
            case 'Implementation': {
                return {
                    name: 'Implementation',
                    mandatory: [
                        { name: 'interface', type: 'array' }
                    ]
                };
            }
            case 'Interface': {
                return {
                    name: 'Interface',
                    mandatory: [
                        { name: 'features', type: 'array' },
                        { name: 'interfaceInheritance', type: 'array' }
                    ]
                };
            }
            case 'InterfaceInheritance': {
                return {
                    name: 'InterfaceInheritance',
                    mandatory: [
                        { name: 'interface', type: 'array' }
                    ]
                };
            }
            case 'Param': {
                return {
                    name: 'Param',
                    mandatory: [
                        { name: 'many', type: 'boolean' }
                    ]
                };
            }
            case 'Umlmodel': {
                return {
                    name: 'Umlmodel',
                    mandatory: [
                        { name: 'classes', type: 'array' },
                        { name: 'datatypes', type: 'array' },
                        { name: 'interfaces', type: 'array' },
                        { name: 'types', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}

export const reflection = new UmlAstReflection();
