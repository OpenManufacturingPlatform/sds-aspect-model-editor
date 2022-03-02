import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@bame/meta-model';
import {MxGraphService} from '@bame/mx-graph';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AspectVisitor} from './aspect-visitor';
import {provideMockObject} from 'jest-helpers/utils';
import {ModelService} from '@bame/rdf/services';
import {RdfModel} from '@bame/rdf/utils';

describe('Aspect Visitor', () => {
  let service: AspectVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let aspect: DefaultAspect;
  let property: DefaultProperty;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AspectVisitor,
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
    aspect = new DefaultAspect('1', 'bamm#aspect', 'aspect1', null);
    property = new DefaultProperty('2', 'bamm#property', 'property1', null);
    aspect.properties = [{property, keys: {}}];

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    service = TestBed.inject(AspectVisitor);
  });

  const getAspectCell = () => ({
    getMetaModelElement: jest.fn(() => aspect),
  });

  it('should update store width default properties', () => {
    const aspectCell = getAspectCell();
    service.visit(aspectCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
      name: 'aspect1',
    });
    expect(rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.properties);
    expect(rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.operations);
    expect(rdfListService.push).toHaveBeenCalledWith(aspect, property);
  });

  it('should update aspect name', () => {
    const aspectCell = getAspectCell();
    service.visit(aspectCell as any);
    aspect.name = 'aspect2';
    service.visit(aspectCell as any);
    expect(rdfNodeService.remove).toHaveBeenCalled();
    expect(rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
      name: 'aspect2',
    });
    expect(aspect.aspectModelUrn).toBe('bamm#aspect2');
  });
});
