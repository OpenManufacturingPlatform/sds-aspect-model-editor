/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

/// <reference types="Cypress" />

import {Aspect, DefaultEntity} from '@bame/meta-model';
import {SELECTOR_dialogInputModel, SELECTOR_dialogStartButton, SELECTOR_tbLoadButton} from '../../support/constants';

describe('Test load external reference with cross references', () => {
  it('Loading different elements from cross referenced file one way', () => {
    cy.intercept('POST', 'http://localhost:9091/bame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/bame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': [
        'external-entity-reference.txt',
        'external-characteristic-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
      'com.bosch.nexeed.different:1.0.0': [
        'external-entity-reference.txt',
        'external-characteristic-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
    });

    // Same Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-entity-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-characteristic-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-property-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/same-namespace/external-operation-reference.txt',
      }
    );

    // Different Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'com.bosch.nexeed.different:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-entity-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'com.bosch.nexeed.different:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-characteristic-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'com.bosch.nexeed.different:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-property-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'com.bosch.nexeed.different:1.0.0:external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/different-namespace/external-operation-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/cross-references/model-with-cross-referenced-element')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
      })
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(2000))
      .then(() => cy.getAspect())
      .then((aspect: Aspect) => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(2);
        expect(aspect.operations[0].name).to.equal('externalOperationWithCrossRef1');
        expect(aspect.operations[1].name).to.equal('externalOperationWithCrossRef2');

        expect(aspect.operations[0].input).to.be.length(1);
        expect(aspect.operations[0].input[0].property.name).to.equal('externalPropertyWithCrossRef1');

        expect(aspect.operations[1].input).to.be.length(1);
        expect(aspect.operations[1].input[0].property.name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.operations[0].output.property.name).to.equal('externalPropertyWithCrossRef1');
        expect(aspect.operations[1].output.property.name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.properties).to.be.length(2);
        expect(aspect.properties[0].property.name).to.equal('externalPropertyWithCrossRef1');
        expect(aspect.properties[1].property.name).to.equal('externalPropertyWithCrossRef2');

        expect(aspect.properties[0].property.characteristic.name).to.equal('ExternalCharacteristicWithCrossRef1');
        expect(aspect.properties[1].property.characteristic.name).to.equal('ExternalCharacteristicWithCrossRef2');

        const entity1 = <DefaultEntity>aspect.properties[0].property.characteristic.dataType;
        const entity2 = <DefaultEntity>aspect.properties[1].property.characteristic.dataType;
        expect(entity1.name).to.equal('ExternalEntityWithCrossRef1');
        expect(entity2.name).to.equal('ExternalEntityWithCrossRef2');

        expect(entity1.properties).to.be.length(2);
        expect(entity2.properties).to.be.length(2);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:externalPropertyWithCrossRef1 different:externalPropertyWithCrossRef2)');
        expect(rdf).to.contain('bamm:operations (:externalOperationWithCrossRef1 different:externalOperationWithCrossRef2)');

        expect(rdf).not.contain(':externalPropertyWithCrossRef1 a bamm:Property');
        expect(rdf).not.contain(':externalPropertyWithCrossRef2 a bamm:Property');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef1 a bamm:Characteristic');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef2 a bamm:Characteristic');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef1 a bamm:Entity');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef2 a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty3 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty4 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Text');
        expect(rdf).not.contain('bamm:characteristic bamm-c:boolean');
      });
  });

  it('Loading different elements from cross referenced file mixing', () => {
    cy.intercept('POST', 'http://localhost:9091/bame/api/models/validate', {fixture: 'model-validation-response.json'});
    cy.intercept('GET', 'http://localhost:9091/bame/api/models/namespaces', {
      'io.openmanufacturing.digitaltwin:1.0.0': [
        'external-entity-reference.txt',
        'external-property-reference.txt',
        'external-operation-reference.txt',
      ],
      'com.bosch.nexeed.different:1.0.0': ['external-characteristic-reference.txt'],
    });

    // Same Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-entity-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-entity-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-property-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-property-reference.txt',
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'io.openmanufacturing.digitaltwin:1.0.0:external-operation-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-operation-reference.txt',
      }
    );

    // Different Namespace
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:9091/bame/api/models',
        headers: {'Bame-Model-Urn': 'com.bosch.nexeed.different:1.0.0:external-characteristic-reference.txt'},
      },
      {
        fixture: '/external-reference/cross-references/mixing-namespace/external-characteristic-reference.txt',
      }
    );

    cy.visitDefault();
    cy.fixture('/external-reference/cross-references/model-with-cross-referenced-element-with-mixing-namespaces')
      .as('rdfString')
      .then(rdfString => {
        cy.get(SELECTOR_tbLoadButton).click({force: true});
        cy.get('[data-cy="create-model"]').click({force: true});
        cy.get(SELECTOR_dialogInputModel).invoke('val', rdfString).trigger('input');
      })
      .then(() => cy.get(SELECTOR_dialogStartButton).click({force: true}).wait(2000))
      .then(() => cy.getAspect())
      .then((aspect: Aspect) => {
        expect(aspect.name).to.equal('AspectDefault');
        expect(aspect.operations).to.be.length(1);
        expect(aspect.operations[0].name).to.equal('externalOperationWithCrossRef');

        expect(aspect.operations[0].input).to.be.length(1);
        expect(aspect.operations[0].input[0].property.name).to.equal('externalPropertyWithCrossRef');

        expect(aspect.operations[0].output.property.name).to.equal('externalPropertyWithCrossRef');

        expect(aspect.properties).to.be.length(1);
        expect(aspect.properties[0].property.name).to.equal('externalPropertyWithCrossRef');
        expect(aspect.properties[0].property.characteristic.name).to.equal('ExternalCharacteristicWithCrossRef');

        const entity = <DefaultEntity>aspect.properties[0].property.characteristic.dataType;
        expect(entity.name).to.equal('ExternalEntityWithCrossRef');
        expect(entity.properties).to.be.length(2);
      })
      .then(() => cy.getUpdatedRDF())
      .then(rdf => {
        expect(rdf).to.contain('bamm:properties (:externalPropertyWithCrossRef)');
        expect(rdf).to.contain('bamm:operations (:externalOperationWithCrossRef)');

        expect(rdf).not.contain(':externalPropertyWithCrossRef a bamm:Property');
        expect(rdf).not.contain(':ExternalCharacteristicWithCrossRef a bamm:Characteristic');
        expect(rdf).not.contain(':ExternalEntityWithCrossRef a bamm:Entity');
        expect(rdf).not.contain(':childrenProperty1 a bamm:Property');
        expect(rdf).not.contain(':childrenProperty2 a bamm:Property');
        expect(rdf).not.contain('bamm:characteristic bamm-c:Text');
        expect(rdf).not.contain('bamm:characteristic bamm-c:boolean');
      });
  });
});
