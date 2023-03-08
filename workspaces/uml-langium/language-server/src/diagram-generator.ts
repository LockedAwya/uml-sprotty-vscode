import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';
import { Class, Inheritance, Umlmodel } from './generated/ast';

export class UMLDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<Umlmodel>): SModelRoot {
        const { document } = args;
        const model = document.parseResult.value;
        return {
            type: 'graph',
            id: model.name ?? 'root',
            children: [
                ...model.classes.map(m => this.generateNode(m, args)),
                ...model.classes.flatMap(m => m.inheritance).map(t => this.generateEdge(t, args))
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
                paddingTop: 10.0,
                paddingBottom: 10.0,
                paddingLeft: 10.0,
                paddingRight: 10.0
            }
        };
    }

    protected generateEdge(inheritance: Inheritance, { idCache }: GeneratorContext<Umlmodel>): SEdge {
        const sourceId = idCache.getId(inheritance.$container);
        const targetId = idCache.getId(inheritance.class?.ref);
        const edgeId = idCache.uniqueId(`${sourceId}:${inheritance.class?.ref?.name}:${targetId}`, inheritance);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: inheritance.class?.ref?.name
                }
            ]
        };
    }

}
