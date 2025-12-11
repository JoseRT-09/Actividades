import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRepository } from '../domain/repositories/user.repository';
import { ResidenceRepository } from '../domain/repositories/residence.repository';
import { ServiceCostRepository } from '../domain/repositories/service-cost.repository';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { ReportRepository } from '../domain/repositories/report.repository';
import { ComplaintRepository } from '../domain/repositories/complaint.repository';
import { ActivityRepository } from '../domain/repositories/activity.repository';
import { AmenityRepository } from '../domain/repositories/amenity.repository';

import { UserApiRepository } from './repositories/user-api.repository';
import { ResidenceApiRepository } from './repositories/residence-api.repository';
import { ServiceCostApiRepository } from './repositories/service-cost-api.repository';
import { PaymentApiRepository } from './repositories/payment-api.repository';
import { ReportApiRepository } from './repositories/report-api.repository';
import { ComplaintApiRepository } from './repositories/complaint-api.repository';
import { ActivityApiRepository } from './repositories/activity-api.repository';
import { AmenityApiRepository } from './repositories/amenity-api.repository';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    { provide: UserRepository, useClass: UserApiRepository },
    { provide: ResidenceRepository, useClass: ResidenceApiRepository },
    { provide: ServiceCostRepository, useClass: ServiceCostApiRepository },
    { provide: PaymentRepository, useClass: PaymentApiRepository },
    { provide: ReportRepository, useClass: ReportApiRepository },
    { provide: ComplaintRepository, useClass: ComplaintApiRepository },
    { provide: ActivityRepository, useClass: ActivityApiRepository },
    { provide: AmenityRepository, useClass: AmenityApiRepository }
  ]
})
export class DataModule { }