/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {provideMockObject} from '../../../../../../jest-helpers';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '@ame/aspect-exporter';
import {OperationVisitor} from './operation-visitor';
import {DefaultAspect, DefaultOperation} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfModel} from '@ame/rdf/utils';
import {ModelService} from '@ame/rdf/services';

describe('Operation Visitor', () => {
  let service: OperationVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;
  let mxGraphService: jest.Mocked<MxGraphService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let operation: DefaultOperation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationVisitor,
        {
          provide: RdfNodeService,
          useValue: provideMockObject(RdfNodeService),
        },
        {
          provide: RdfListService,
          useValue: provideMockObject(RdfListService),
        },
        {
          provide: MxGraphService,
          useValue: provideMockObject(MxGraphService),
        },
      ],
    });

    modelService = provideMockObject(ModelService);
    rdfModel = provideMockObject(RdfModel);
    rdfModel.store = new Store();
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    operation = new DefaultOperation('1', 'bamm#operation1', 'operation1', [], null);

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    mxGraphService = TestBed.inject(MxGraphService) as jest.Mocked<MxGraphService>;
    service = TestBed.inject(OperationVisitor);
  });

  const getOperationCell = () => ({
    getMetaModelElement: jest.fn(() => operation),
  });

  it('should update store width default operations', () => {
    const propertyCell = getOperationCell();
    service.visit(propertyCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(operation, {
      input: [],
      output: null,
      preferredName: [],
      description: [],
      see: [],
      name: 'operation1',
    });
  });

  it('should update the parents parent with the new operation reference', () => {
    const operationCell = getOperationCell();
    operation.name = 'operation2';

    const parents = [new DefaultAspect('1', 'aspect', 'aspect', null, [operation])];
    mxGraphService.resolveParents.mockImplementation(() => parents.map(parent => ({getMetaModelElement: () => parent} as any)));

    expect(operation.aspectModelUrn).toBe('bamm#operation1');

    service.visit(operationCell as any);

    expect(operation.aspectModelUrn).toBe('bamm#operation2');
    expect(rdfListService.remove).toHaveBeenNthCalledWith(1, parents[0], operation);
    expect(rdfListService.remove).toHaveBeenNthCalledWith(2, parents[1], operation);
    expect(rdfListService.push).toHaveBeenNthCalledWith(1, parents[0], operation);
    expect(rdfListService.push).toHaveBeenNthCalledWith(2, parents[1], operation);

    expect(rdfNodeService.update).toHaveBeenCalledWith(operation, {
      input: [],
      output: null,
      preferredName: [],
      description: [],
      see: [],
      name: 'operation2',
    });
  });
});