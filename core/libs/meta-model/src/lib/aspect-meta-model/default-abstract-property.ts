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

import {Base, BaseMetaModelElement} from './base';
import {AspectModelVisitor} from '@ame/mx-graph';
import {OverWrittenProperty} from './overwritten-property';

interface AbstractProperty extends BaseMetaModelElement {
  refines?: string;
  exampleValue?: any;
}

export class DefaultAbstractProperty extends Base implements AbstractProperty {
  public extendedElement: OverWrittenProperty<DefaultAbstractProperty>;

  static createInstance() {
    return new DefaultAbstractProperty(null, null, 'property', null);
  }

  get className() {
    return 'DefaultAbstractProperty';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public exampleValue?: any) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitAbstractProperty(this, context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_baseMetalModelElement: BaseMetaModelElement) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_baseMetalModelElement: BaseMetaModelElement) {
    return null;
  }
}