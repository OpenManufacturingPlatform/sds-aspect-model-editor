import {Component, OnDestroy, OnInit} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DefaultOperation, DefaultProperty} from '@bame/meta-model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {NamespacesCacheService} from '@bame/cache';

@Component({
  selector: 'bci-output-input-field',
  templateUrl: './output-input-field.component.html',
})
export class OutputInputFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  filteredPropertyTypes$: Observable<any[]>;

  outputControl: FormControl;
  newPropertyControl: FormControl;

  constructor(public metaModelDialogService: EditorModelService, public namespacesCacheService: NamespacesCacheService) {
    super(metaModelDialogService, namespacesCacheService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setOutputControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('output');
  }

  setOutputControl() {
    const property = this.metaModelElement?.output?.property;
    const value = property?.name ? property?.name : '';

    this.parentForm.setControl(
      'output',
      new FormControl({
        value,
        disabled: !!value || this.metaModelElement.isExternalReference(),
      })
    );
    this.parentForm.setControl(
      'outputValue',
      new FormControl({
        value: property,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    this.outputControl = this.parentForm.get('output') as FormControl;
    this.newPropertyControl = this.parentForm.get('outputValue') as FormControl;

    this.filteredPropertyTypes$ = this.initFilteredPropertyTypes(this.outputControl);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'output') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    const defaultProperty = this.currentCachedFile.getCachedProperties().find(property => property.aspectModelUrn === newValue.urn);
    this.parentForm.setControl('outputValue', new FormControl(defaultProperty));

    this.outputControl.patchValue(newValue.name);
    this.newPropertyControl.setValue(defaultProperty);
    this.outputControl.disable();
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty(this.metaModelElement.metaModelVersion, urn, propertyName, null);
    this.parentForm.setControl('outputValue', new FormControl(newProperty));

    this.outputControl.patchValue(propertyName);
    this.newPropertyControl.setValue(newProperty);
    this.outputControl.disable();
  }

  unlockOutput() {
    this.outputControl.enable();
    this.outputControl.patchValue('');
    this.newPropertyControl.patchValue('');
    this.parentForm.setControl('outputValue', new FormControl(null));
    this.newPropertyControl.markAllAsTouched();
  }
}
