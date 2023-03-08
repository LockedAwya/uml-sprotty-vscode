/******************************************************************************
 * This file was generated by langium-cli 1.0.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import { AstNode, AbstractAstReflection, Reference, ReferenceInfo, TypeMetaData } from 'langium';

export type QualifiedName = string;

export type Type = Class | DataType;

export const Type = 'Type';

export function isType(item: unknown): item is Type {
    return reflection.isInstance(item, Type);
}

export interface Class extends AstNode {
    readonly $container: Umlmodel;
    readonly $type: 'Class';
    features: Array<Feature>
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
    readonly $container: Class;
    readonly $type: 'Feature';
    many: boolean
    name: string
    type: Reference<Type>
}

export const Feature = 'Feature';

export function isFeature(item: unknown): item is Feature {
    return reflection.isInstance(item, Feature);
}

export interface Inheritance extends AstNode {
    readonly $container: Class;
    readonly $type: 'Inheritance';
    class?: Reference<Class>
}

export const Inheritance = 'Inheritance';

export function isInheritance(item: unknown): item is Inheritance {
    return reflection.isInstance(item, Inheritance);
}

export interface Umlmodel extends AstNode {
    readonly $type: 'Umlmodel';
    classes: Array<Class>
    datatypes: Array<DataType>
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
    Inheritance: Inheritance
    Type: Type
    Umlmodel: Umlmodel
}

export class UmlAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return ['Class', 'DataType', 'Feature', 'Inheritance', 'Type', 'Umlmodel'];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case Class:
            case DataType: {
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
            case 'Feature:type': {
                return Type;
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
                        { name: 'features', type: 'array' },
                        { name: 'inheritance', type: 'array' }
                    ]
                };
            }
            case 'Feature': {
                return {
                    name: 'Feature',
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
