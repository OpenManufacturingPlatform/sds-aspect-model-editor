import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {OverWrittenProperty} from '@bame/meta-model';

export interface PropertiesDialogData {
  name: string;
  properties: OverWrittenProperty[];
  isExternalRef: boolean;
}

@Component({
  templateUrl: './properties-modal.component.html',
  styleUrls: ['./properties-modal.component.scss'],
})
export class PropertiesModalComponent implements OnInit, AfterViewInit {
  public form: FormGroup;
  public keys: string[] = [];

  public headers = ['name', 'payloadName', 'optional', 'notInPayload'];
  public dataSource: MatTableDataSource<OverWrittenProperty>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PropertiesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PropertiesDialogData
  ) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data.properties);
    const group = this.data.properties.reduce((acc, curr) => {
      this.keys.push(curr.property.aspectModelUrn);
      acc[curr.property.aspectModelUrn] = this.formBuilder.group({
        name: [curr.property.name],
        optional: [curr.keys.optional || false],
        notInPayload: [curr.keys.notInPayload || false],
        payloadName: [curr.keys.payloadName || ''],
      });
      return acc;
    }, {});

    this.form = this.formBuilder.group(group);
    if (this.data.isExternalRef) {
      this.form.disable();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getControl(path: string | string[]): FormControl {
    return this.form.get(path) as FormControl;
  }

  closeModal() {
    this.dialogRef.close();
  }

  saveChanges() {
    this.dialogRef.close(this.form.value);
  }
}
