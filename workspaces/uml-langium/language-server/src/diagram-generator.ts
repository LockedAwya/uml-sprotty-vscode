import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
// import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
// import { Class, Inheritance, Umlmodel } from './generated/ast';

import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
import { Class, Umlmodel } from './generated/ast';

export class UMLDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<Umlmodel>): SModelRoot {
        const { document } = args;
        const model = document.parseResult.value;
        return {
            type: 'graph',
            id: model.name ?? 'root',
            children: [
                // ...model.elements.map(c => c.classes.map(m => this.generateNode(m, args))),
                // ...model.elements.map((c => c.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args)))),
                //...model.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args))
                ...model.classes.map(m => this.generateNode(m, args)),
                ...model.classes.flatMap(m => m.superType?.ref).map(t => this.generateEdge(t, args))
            ]
        };
    }


    protected generateNode(_class: Class, { idCache }: GeneratorContext<Umlmodel>): SNode {
        const nodeId = idCache.uniqueId(_class.name, _class);
        return {
            type: 'node',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: _class.name
                },
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                }
            ],
            layout: 'stack',
            layoutOptions: {
                paddingTop: 30.0,
                paddingBottom: 10.0,
                paddingLeft: 30.0,
                paddingRight: 30.0
            }
        };
    }

    protected generateEdge(_class: Class, { idCache }: GeneratorContext<Umlmodel>): SEdge {
        //const maybeExtend = inheritance.superType ? inheritance.superType?.$refText : '';
        const sourceId = idCache.getId(_class.$container);
        //let targetId = "";
        // if (_class.superType?.ref == undefined) {
        //     return;
        // }
        const targetId = idCache.getId(_class.superType?.ref);
        const edgeId = idCache.uniqueId(`${sourceId}:${"extends"}:${targetId}`, _class);
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
