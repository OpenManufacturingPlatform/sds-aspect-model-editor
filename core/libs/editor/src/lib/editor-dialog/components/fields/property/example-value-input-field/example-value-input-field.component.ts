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

import {Component, OnInit} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DefaultProperty} from '@ame/meta-model';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'ame-example-value-input-field',
  templateUrl: './example-value-input-field.component.html',
})
export class ExampleValueInputFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit {

  isDisabled = false;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  initForm() {
    this.isDisabled = this.metaModelElement.characteristic?.dataType?.isComplex();
    this.parentForm.setControl(
      'exampleValue',
      new FormControl({
        value: this.metaModelElement?.exampleValue || '',
        disabled: this.metaModelElement.isExternalReference() || this.isDisabled
      })
    );
  }
}
