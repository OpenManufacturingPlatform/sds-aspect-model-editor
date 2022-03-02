import {Injectable} from '@angular/core';
import {DefaultConstraint} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class ConstraintRenderService extends BaseRenderService {
  constructor(mxGraphService: MxGraphService, languageSettingsService: LanguageSettingsService) {
    super(mxGraphService, languageSettingsService);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultConstraint;
  }
}
