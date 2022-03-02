import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {provideMockObject} from 'src/app/jest-helpers/utils';
import {DefaultCharacteristic} from 'src/app/shared/aspect-meta-model/default-characteristic';
import {DefaultEntity} from 'src/app/shared/aspect-meta-model/default-entity';
import {DefaultProperty} from 'src/app/shared/aspect-meta-model/default-property';
import {RdfModel} from 'src/app/shared/model';
import {ModelService} from 'src/app/shared/model.service';
import {MxGraphService} from 'src/app/shared/mx-graph/mx-graph.service';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {EntityVisitor} from './entity-visitor';

describe('Entity Visitor', () => {
  let service: EntityVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;
  let mxGraphService: jest.Mocked<MxGraphService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let entity: DefaultEntity;
  let property: DefaultProperty;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityVisitor,
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
    entity = new DefaultEntity('1', 'bamm#entity1', 'entity1', null);
    entity.properties = [property];

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    mxGraphService = TestBed.inject(MxGraphService) as jest.Mocked<MxGraphService>;
    service = TestBed.inject(EntityVisitor);
  });

  const getEntityCell = () => ({
    getMetaModelElement: jest.fn(() => entity),
  });

  it('should update store width default properties', () => {
    const entityCell = getEntityCell();
    service.visit(entityCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
      name: 'entity1',
    });
    expect(rdfListService.createEmpty).toHaveBeenCalledWith(entity, ListProperties.properties);
    expect(rdfListService.push).toHaveBeenCalledWith(entity, property);
  });

  it('should update entity name', () => {
    const entityCell = getEntityCell();
    entity.name = 'entity2';
    service.visit(entityCell as any);
    expect(rdfNodeService.remove).toHaveBeenCalled();
    expect(rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
      name: 'entity2',
    });
    expect(entity.aspectModelUrn).toBe('bamm#entity2');
  });

  it('should update the parents with the new entity reference', () => {
    const entityCell = getEntityCell();
    entity.name = 'entity3';

    const parents = [
      new DefaultCharacteristic('1', 'characteristic1', 'characteristic1', entity),
      new DefaultCharacteristic('1', 'characteristic2', 'characteristic2', entity),
    ];
    mxGraphService.resolveParents.mockImplementation(() => parents.map(parent => ({getMetaModelElement: () => parent} as any)));

    expect(entity.aspectModelUrn).toBe('bamm#entity1');

    service.visit(entityCell as any);

    expect(entity.aspectModelUrn).toBe('bamm#entity3');
    expect(rdfNodeService.update).toHaveBeenNthCalledWith(1, parents[0], {dataType: 'bamm#entity3'});
    expect(rdfNodeService.update).toHaveBeenNthCalledWith(2, parents[1], {dataType: 'bamm#entity3'});

    expect(rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
      name: 'entity3',
    });
  });
});
