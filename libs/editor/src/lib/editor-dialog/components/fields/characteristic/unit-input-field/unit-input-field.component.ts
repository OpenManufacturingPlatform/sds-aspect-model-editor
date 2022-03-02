import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultDuration, DefaultMeasurement, DefaultQuantifiable, DefaultUnit, Unit} from '@bame/meta-model';
import {BammUnitInstantiator, MetaModelElementInstantiator} from '@bame/instantiator';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@bame/cache';
import {ModelService} from '@bame/rdf/services';

declare const bammuDefinition: any;

@Component({
  selector: 'bci-unit-input-field',
  templateUrl: './unit-input-field.component.html',
})
export class UnitInputFieldComponent
  extends InputFieldComponent<DefaultQuantifiable | DefaultDuration | DefaultMeasurement>
  implements OnInit, OnDestroy
{
  unitRequired = false;

  filteredPredefinedUnits$: Observable<Array<any>>;
  filteredUnits$: Observable<Array<DefaultUnit>>;
  units: Array<Unit> = [];
  unitDisplayControl: FormControl;
  private bammUnitInstantiator: BammUnitInstantiator;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private modelService: ModelService
  ) {
    super(metaModelDialogService, namespacesCacheService);
    this.bammUnitInstantiator = new BammUnitInstantiator(
      new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.currentCachedFile)
    );
    this.fieldName = 'unit';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(metaModelElement => {
      this.units = metaModelElement ? Object.keys(bammuDefinition.units).map(key => bammuDefinition.units[key]) : null;
      if (this.metaModelElement instanceof DefaultDuration) {
        this.units = this.units.filter(unit => unit.quantityKinds && unit.quantityKinds.includes('time'));
      }
      this.unitRequired = metaModelElement instanceof DefaultDuration || metaModelElement instanceof DefaultMeasurement;
      this.initUnitFormControl();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
    this.parentForm.removeControl('changedUnit');
  }

  onPredefinedUnitChange(predefinedUnit: Unit) {
    if (predefinedUnit) {
      const newPredefinedUnit = this.bammUnitInstantiator.getUnit(predefinedUnit?.name);
      this.parentForm.get('unit').setValue(newPredefinedUnit);
      this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.unitDisplayControl.disable();
    }
  }

  onExistingUnitChange(existingUnit) {
    this.unitDisplayControl.patchValue(existingUnit.name);
    this.parentForm.get('unit').setValue(existingUnit);
    this.unitDisplayControl.disable();
  }

  initUnitFormControl() {
    const unit = this.getCurrentValue(this.fieldName);
    const unitName = unit instanceof DefaultUnit ? unit.name : unit;
    this.unitDisplayControl = new FormControl({value: unitName, disabled: !!unit}, this.unitRequired ? Validators.required : null);

    this.parentForm.setControl(
      this.fieldName,
      new FormControl({value: unit, disabled: this.metaModelElement?.isExternalReference()}, this.unitRequired ? Validators.required : null)
    );

    this.parentForm.setControl('changedUnit', new FormControl(unitName ? this.bammUnitInstantiator.getUnit(unitName) : null));
    this.filteredUnits$ = this.initFilteredUnits(this.unitDisplayControl);
    this.filteredPredefinedUnits$ = this.initFilteredPredefinedUnits(this.unitDisplayControl, this.units);
  }

  createNewUnit(unitName: string) {
    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${unitName}`;
    const newUnit = new DefaultUnit(this.metaModelElement.metaModelVersion, urn, unitName);

    // set the control of newDatatype
    this.unitDisplayControl.patchValue(unitName);
    this.parentForm.get('unit').setValue(newUnit);
    this.unitDisplayControl.disable();
  }

  unlockUnit() {
    this.unitDisplayControl.enable();
    this.unitDisplayControl.patchValue('');
    this.parentForm.get('unit').setValue(null);
    this.parentForm.get('unit').markAllAsTouched();
  }
}
