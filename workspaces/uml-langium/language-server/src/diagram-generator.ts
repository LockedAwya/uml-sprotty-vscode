import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SCompartment } from 'sprotty-protocol';
//import { SLabel, SModelRoot, SNode, SCompartment } from 'sprotty-protocol';
import { Class, Inheritance, Umlmodel } from './generated/ast';
//import { Class, Umlmodel } from './generated/ast';
import { Expandable } from 'sprotty';
//import { features } from 'process';
//import { Expandable } from 'sprotty';
//import { Reference } from 'langium';
// import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
// import { Class, Umlmodel } from './generated/ast';

export class UMLDiagramGenerator extends LangiumDiagramGenerator {

    //private idCache: GeneratorContext<Umlmodel>;

    protected generateRoot(args: GeneratorContext<Umlmodel>): SModelRoot {
        const { document } = args;
        const model = document.parseResult.value;
        //const maybeExtends = _class.superType ? ` extends ${_class.superType.$refText}` : '';
        // let arr = new Array<Class>();
        // for (const _class of model.classes) {
        //     if (_class !== undefined) {
        //         arr.push(_class);
        //     }
        // }
        return {
            type: 'graph',
            id: model.name ?? 'root',
            children: [
                // ...model.elements.map(c => c.classes.map(m => this.generateNode(m, args))),
                // ...model.elements.map((c => c.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args)))),
                //...model.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args))
                ...model.classes.map(m => this.generateNode(m, args)),
                ...model.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args))
            ]
        };
    }

    // protected generateFeature(text: string, className: string): SLabel {
    //     const nodeId = idCache.uniqueId(className, _class);
    //     return {
    //         type: 'label',
    //         id: idCache.uniqueId(nodeId + '.label'),
    //         text: text
    //     }
    // }

    protected generateNode(_class: Class, { idCache }: GeneratorContext<Umlmodel>): SNode & Expandable {
        const nodeId = idCache.uniqueId(_class.name, _class);
        return {
            type: 'node:class',
            id: nodeId,
            expanded: false,
            layout: 'vbox',
            children: [
                <SCompartment>{
                    id: nodeId + '_header',
                    type: 'comp:header',
                    layout: 'hbox',
                    children: [
                        // {
                        //     id: nodeId + '_icon',
                        //     type: 'icon',
                        //     layout: 'stack',
                        //     layoutOptions: {
                        //         hAlign: 'center',
                        //         resizeContainer: false
                        //     },
                        //     children: [
                        //         <SLabel>{
                        //             id: nodeId + '_ticon',
                        //             type: 'label:icon',
                        //             text: 'C'
                        //         }
                        //     ]
                        // },
                        <SLabel>{
                            id: nodeId + '_classname',
                            type: 'label:heading',
                            text: _class.name
                        },
                        {
                            id: nodeId + '_expand',
                            type: 'button:expand'
                        }
                    ]
                }
            ]
            // layoutOptions: {
            //     paddingTop: 10.0,
            //     paddingBottom: 50.0,
            //     paddingLeft: 30.0,
            //     paddingRight: 30.0
            // }
        };
    }

    // protected generateNode(_class: Class, { idCache }: GeneratorContext<Umlmodel>): SNode {
    //     const nodeId = idCache.uniqueId(_class.name, _class);
    //     let arr: Array<SModelElement | SLabel> = [];

    //     //generate class name
    //     arr.push(<SLabel>{
    //         type: 'label',
    //         id: idCache.uniqueId(nodeId + '.label'),
    //         text: _class.name
    //     })

    //     //generate attributes of a class
    //     for (let i = 0; i < _class.features.length; i++) {
    //         // const featureName = _class.features[i].name + ":" + " " + _class.features[i].type.$refText;
    //         // arr.push(this.generateFeature(featureName, nodeId));
    //         arr.push(<SLabel>{
    //             type: 'label',
    //             id: idCache.uniqueId(nodeId + '.label'),
    //             text: _class.features[i].name + ":" + " " + _class.features[i].type.$refText
    //         })
    //     }
    //     return {
    //         type: 'node:class',
    //         id: nodeId,
    //         layout: 'vbox',
    //         children: arr,
    //         layoutOptions: {
    //             paddingTop: 10.0,
    //             paddingBottom: 50.0,
    //             paddingLeft: 30.0,
    //             paddingRight: 30.0
    //         }
    //     };
    // }

    protected generateEdge(inheritance: Inheritance, { idCache }: GeneratorContext<Umlmodel>): SEdge {
        //const maybeExtend = inheritance.superType ? inheritance.superType?.$refText : '';
        const sourceId = idCache.getId(inheritance.$container);
        const targetId = idCache.getId(inheritance.class?.ref);
        const edgeId = idCache.uniqueId(`${sourceId}:${"extends"}:${targetId}`, inheritance);
        console.log("The source id is ", sourceId);
        console.log("The target id is ", targetId);
        console.log("The edge id is ", edgeId);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: "extends",
                    edgePlacement: {
                        position: 0.5,
                        side: 'on',
                        rotate: false
                    }
                }
            ]
        };
    }

}
