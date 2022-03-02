import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultCharacteristic, DefaultCollection} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@bame/cache';
import {NotificationsService} from '@bame/shared';

@Component({
  selector: 'bci-element-characteristic-input-field',
  templateUrl: './element-characteristic-input-field.component.html',
})
export class ElementCharacteristicInputFieldComponent extends InputFieldComponent<DefaultCollection> implements OnInit, OnDestroy {
  filteredCharacteristicTypes$: Observable<any[]>;

  elementCharacteristicDisplayControl: FormControl;
  elementCharacteristicControl: FormControl;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private notificationsService: NotificationsService
  ) {
    super(metaModelDialogService, namespacesCacheService);
    this.fieldName = 'elementCharacteristic';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setElementCharacteristicControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('elementCharacteristicDisplay');
    this.parentForm.removeControl('elementCharacteristic');
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.elementCharacteristic || null;
  }

  setElementCharacteristicControl() {
    const elementCharacteristic = this.getCurrentValue();
    const value = elementCharacteristic?.name || '';

    this.parentForm.setControl(
      'elementCharacteristicDisplay',
      new FormControl(
        {
          value,
          disabled: !!value || this.metaModelElement.isExternalReference(),
        }
      )
    );
    this.parentForm.setControl(
      'elementCharacteristic',
      new FormControl({
        value: elementCharacteristic,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    this.elementCharacteristicDisplayControl = this.parentForm.get('elementCharacteristicDisplay') as FormControl;
    this.elementCharacteristicControl = this.parentForm.get('elementCharacteristic') as FormControl;

    this.filteredCharacteristicTypes$ = this.initFilteredCharacteristicTypes(this.elementCharacteristicDisplayControl, this.metaModelElement.aspectModelUrn);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'elementCharacteristicDisplay') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    const defaultCharacteristic = this.currentCachedFile
      .getCachedCharacteristics()
      .find(characteristic => characteristic.aspectModelUrn === newValue.urn);
    this.parentForm.setControl('elementCharacteristic', new FormControl(defaultCharacteristic));

    this.elementCharacteristicDisplayControl.patchValue(newValue.name);
    this.elementCharacteristicControl.setValue(defaultCharacteristic);
    this.elementCharacteristicDisplayControl.disable();
  }

  createNewCharacteristic(characteristicName: string) {
    if (!this.isUpperCase(characteristicName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${characteristicName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === characteristicName) {
      this.notificationsService.error('Element characteristic cannot link itself.');
      this.elementCharacteristicDisplayControl.setValue('');
      return;
    }

    const newCharacteristic = new DefaultCharacteristic(this.metaModelElement.metaModelVersion, urn, characteristicName, null);
    this.parentForm.setControl('elementCharacteristic', new FormControl(newCharacteristic));

    this.elementCharacteristicDisplayControl.patchValue(characteristicName);
    this.elementCharacteristicControl.setValue(newCharacteristic);
    this.elementCharacteristicDisplayControl.disable();
  }

  unlockElementCharacteristic() {
    this.elementCharacteristicDisplayControl.enable();
    this.elementCharacteristicDisplayControl.patchValue('');
    this.elementCharacteristicControl.patchValue('');
    this.parentForm.setControl('elementCharacteristic', new FormControl(null));
    this.elementCharacteristicControl.markAllAsTouched();
  }
}
