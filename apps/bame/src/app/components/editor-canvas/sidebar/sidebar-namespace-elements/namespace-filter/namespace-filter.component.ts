/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ElementModel} from '@bame/shared';

@Component({
  selector: 'bci-namespace-filter',
  styleUrls: ['./namespace-filter.component.scss'],
  templateUrl: './namespace-filter.component.html',
})
export class NamespaceFilterComponent implements OnChanges {
  @Input()
  fileName: string;

  @Input()
  public elements: ElementModel[] = [];

  @Output()
  public searchElements = new EventEmitter<ElementModel[]>();

  public types = ['property', 'operation', 'characteristic', 'entity', 'constraint', 'trait', 'unit', 'event'];
  public selectedTypes = [];
  public searchedString: string = null;
  public filteredElements: ElementModel[];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements')) {
      this.filteredElements = this.elements;
      this.searchedString = '';
      this.selectedTypes = [];
    }
  }

  public getClassesForType(type: string): string[] {
    return this.selectedTypes.includes(type) ? [type, 'selected'] : [type];
  }

  public toggleSelect(type: string) {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes.splice(this.selectedTypes.indexOf(type), 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.filterElements();
  }

  public filterElements() {
    this.filteredElements = this.elements.filter(element => {
      if (this.searchedString) {
        return element.name.toUpperCase().includes(this.searchedString.toUpperCase());
      } else {
        return true;
      }
    });
    if (this.selectedTypes?.length > 0) {
      this.filteredElements = this.filteredElements.filter(element => this.selectedTypes.includes(element.type));
    }
    this.searchElements.emit(this.filteredElements);
  }
}
