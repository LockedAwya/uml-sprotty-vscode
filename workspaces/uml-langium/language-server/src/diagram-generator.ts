import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SModelElement } from 'sprotty-protocol';
import { Class, Inheritance, Umlmodel } from './generated/ast';
//import { features } from 'process';
//import { Expandable } from 'sprotty';
//import { Reference } from 'langium';
// import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
// import { Class, Umlmodel } from './generated/ast';

export class UMLDiagramGenerator extends LangiumDiagramGenerator {

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
                //...arr.map(t => this.generateEdge(t, args))
                //...model.classes.flatMap(m => m.superType?.ref).map(t => this.generateEdge(t, args))
            ]
        };
    }

    protected generateNode(_class: Class, { idCache }: GeneratorContext<Umlmodel>): SNode {
        const nodeId = idCache.uniqueId(_class.name, _class);
        let arr: Array<SModelElement | SLabel> = [];
        arr.push(<SLabel>{
            type: 'label',
            id: idCache.uniqueId(nodeId + '.label'),
            text: _class.name
        })
        for (let i = 0; i < _class.features.length; i++) {
            arr.push(<SLabel>{
                type: 'label',
                id: idCache.uniqueId(nodeId + '.label'),
                text: _class.features[i].name + ":" + " " + _class.features[i].type.$refText
            })
        }
        return {
            type: 'node',
            id: nodeId,
            layout: 'vbox',
            children: arr,
            layoutOptions: {
                paddingTop: 10.0,
                paddingBottom: 50.0,
                paddingLeft: 30.0,
                paddingRight: 30.0
            }
        };
    }

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
                    text: "extends"
                }
            ]
        };
    }

}
