/********************************************************************************
 * Copyright (c) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import '../css/diagram.css';
import 'sprotty/css/sprotty.css';

import { Container, ContainerModule } from 'inversify';
import {
    configureCommand, configureModelElement, ConsoleLogger, CreateElementCommand, HtmlRoot,
    HtmlRootView, LogLevel, overrideViewerOptions, PreRenderedElement,
    PreRenderedView, SGraphView, SLabelView, SModelRoot,
    SRoutingHandle, SRoutingHandleView, TYPES, loadDefaultModules, SGraph, SLabel,
    hoverFeedbackFeature, popupFeature, creatingOnDragFeature, editLabelFeature, labelEditUiModule,
    SCompartment, SCompartmentView, SButton, ExpandButtonView, expandFeature, nameFeature, withEditLabelFeature
} from 'sprotty';
//import { PolylineArrowEdgeView, TriangleButtonView } from './views';
import { CreateTransitionPort, ClassNode, Icon, StatesEdge } from './model';
//import { TriangleButtonView } from './views';
import { PolylineArrowEdgeView, IconView, NodeView, TriangleButtonView } from "./views";

const ClassDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    //rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'graph', SGraph, SGraphView, {
        enable: [hoverFeedbackFeature, popupFeature]
    });
    //configureModelElement(context, 'node:class', StatesNode, RectangularNodeView);
    configureModelElement(context, 'node:class', ClassNode, NodeView, {
        enable: [expandFeature, nameFeature, withEditLabelFeature]
    });
    configureModelElement(context, 'label', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:xref', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'comp:header', SCompartment, SCompartmentView);
    configureModelElement(context, 'label:heading', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:icon', SLabel, SLabelView);
    configureModelElement(context, 'icon', Icon, IconView);
    configureModelElement(context, 'edge', StatesEdge, PolylineArrowEdgeView);
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'port', CreateTransitionPort, TriangleButtonView, {
        enable: [popupFeature, creatingOnDragFeature]
    });
    configureModelElement(context, 'button:expand', SButton, ExpandButtonView);

    configureCommand(context, CreateElementCommand);
});

export function createClassDiagramContainer(widgetId: string): Container {
    const container = new Container();
    loadDefaultModules(container, { exclude: [labelEditUiModule] });
    container.load(ClassDiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });
    return container;
}
